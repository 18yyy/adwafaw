import fs from 'fs';

// Carrega os dados do arquivo (se existir) ou cria um array vazio
let dados = JSON.parse(fs.readFileSync('salas.json', 'utf-8') || '[]'); 

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { descricao, valor } = req.body;
        if (!descricao || !valor) {
            return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
        }

        dados.push({ descricao, valor });

        // Salva os dados no arquivo após cada POST
        fs.writeFileSync('salas.json', JSON.stringify(dados, null, 2));

        return res.status(201).json({ message: "Dado adicionado com sucesso!" });
    } else if (req.method === 'GET') {
        return res.status(200).json(dados);
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
