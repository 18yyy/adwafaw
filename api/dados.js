import fs from 'fs';
import path from 'path';

// Define o caminho completo para o arquivo
const filePath = path.join(process.cwd(), 'salas.json');

// Verifica se o arquivo existe, caso contrário, cria um arquivo vazio
let dados = [];
if (fs.existsSync(filePath)) {
    try {
        dados = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
    } catch (err) {
        console.error('Erro ao ler o arquivo:', err);
        // Caso ocorra um erro, inicializa dados como um array vazio
        dados = [];
    }
}

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { descricao, valor } = req.body;
        if (!descricao || !valor) {
            return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
        }

        dados.push({ descricao, valor });

        // Salva os dados no arquivo
        try {
            fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
            return res.status(201).json({ message: "Dado adicionado com sucesso!" });
        } catch (err) {
            console.error('Erro ao salvar o arquivo:', err);
            return res.status(500).json({ error: 'Erro ao salvar os dados.' });
        }

    } else if (req.method === 'GET') {
        return res.status(200).json(dados);
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
