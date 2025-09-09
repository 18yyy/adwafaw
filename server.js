const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(PUBLIC_DIR));

// Multer setup for photos (store on disk under uploads/)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// MongoDB base connection
const BASE_MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://chxtey:bacana123@cluster0.64beeeu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const mongoClient = new MongoClient(BASE_MONGO_URL, { ignoreUndefined: true });

async function getDbByName(databaseName) {
  if (!databaseName || typeof databaseName !== 'string') {
    throw new Error('Database name (senha de acesso) inválido.');
  }
  if (!mongoClient.topology) {
    await mongoClient.connect();
  }
  return mongoClient.db(databaseName);
}

// Middleware to extract db from header or cookie
function withDb(req, res, next) {
  const dbName = req.header('x-db') || req.query.db || req.cookies.db;
  if (!dbName) return res.status(400).json({ error: 'Falta o cabeçalho x-db (senha de acesso).' });
  getDbByName(dbName)
    .then((db) => {
      req.db = db;
      req.dbName = dbName;
      next();
    })
    .catch((err) => {
      res.status(500).json({ error: 'Erro ao conectar ao banco de dados.', details: err.message });
    });
}

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Auth: set cookie with db name (senha) for convenience
app.post('/api/login', async (req, res) => {
  try {
    const { password } = req.body; // password is db name
    if (!password) return res.status(400).json({ error: 'Senha de Acesso é obrigatória.' });
    // Probe DB exists by listing collections (non-fatal if none)
    const db = await getDbByName(password);
    await db.listCollections().toArray();
    res.cookie('db', password, { httpOnly: false, sameSite: 'Lax' });
    res.json({ ok: true, db: password });
  } catch (err) {
    res.status(500).json({ error: 'Erro no login.', details: err.message });
  }
});

// List properties (casas)
app.get('/api/casas', withDb, async (req, res) => {
  try {
    const casas = await req.db.collection('casas').find({}).sort({ createdAt: -1 }).toArray();
    res.json({ items: casas });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar casas.', details: err.message });
  }
});

// Add property
app.post('/api/casas', withDb, upload.array('fotos', 12), async (req, res) => {
  try {
    const data = req.body;
    const photoFiles = (req.files || []).map((f) => ({ url: `/uploads/${f.filename}`, name: f.originalname }));

    const casa = {
      endereco: data.endereco || '',
      quartos: Number(data.quartos) || 0,
      vagasGaragem: Number(data.vagasGaragem) || 0,
      metragem: Number(data.metragem) || 0,
      valor: Number(data.valor) || 0,
      observacoes: data.observacoes || '',
      fotos: photoFiles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await req.db.collection('casas').insertOne(casa);
    res.status(201).json({ ok: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar imóvel.', details: err.message });
  }
});

// Remove property by id
app.delete('/api/casas/:id', withDb, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await req.db.collection('casas').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Imóvel não encontrado.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover imóvel.', details: err.message });
  }
});

// Fallback to static index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

