let dados = []; // Armazenamento temporário em memória

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Adiciona um novo dado
        const { descricao, valor } = req.body;
        if (!descricao || !valor) {
            return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
        }
        dados.push({ descricao, valor });
        return res.status(201).json({ message: "Dado adicionado com sucesso!" });
    } else if (req.method === 'GET') {
        // Retorna todos os dados
        return res.status(200).json(dados);
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}