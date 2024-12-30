import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'api', 'salas.json');  // Caminho correto para o arquivo dentro de 'api'

// Tenta carregar o arquivo ou inicializar com um array vazio
let dados = [];
try {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        dados = JSON.parse(fileContent);
    } else {
        // Cria um arquivo vazio caso não exista
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
} catch (error) {
    console.error("Erro ao ler o arquivo:", error);
    dados = [];
}

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { descricao, valor } = req.body;
        if (!descricao || !valor) {
            return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
        }

        dados.push({ descricao, valor });

        // Tenta salvar os dados no arquivo
        try {
            fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
            return res.status(201).json({ message: "Dado adicionado com sucesso!" });
        } catch (error) {
            console.error("Erro ao salvar dados no arquivo:", error);
            return res.status(500).json({ error: "Erro ao salvar os dados no arquivo." });
        }
    } else if (req.method === 'GET') {
        return res.status(200).json(dados);
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
