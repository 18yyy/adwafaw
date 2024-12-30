import fs from 'fs';

// Carregar ou criar o arquivo se não existir
let dados = [];
try {
    const fileContent = fs.readFileSync('salas.json', 'utf-8');
    dados = JSON.parse(fileContent);
} catch (error) {
    console.error("Erro ao ler ou parsear o arquivo:", error);
    // Garantir que o dados seja um array vazio em caso de erro
    dados = [];
}

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { descricao, valor } = req.body;
        if (!descricao || !valor) {
            return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
        }

        dados.push({ descricao, valor });

        // Salvar os dados no arquivo
        try {
            fs.writeFileSync('salas.json', JSON.stringify(dados, null, 2));
        } catch (error) {
            console.error("Erro ao salvar dados no arquivo:", error);
            return res.status(500).json({ error: "Erro ao salvar os dados no arquivo." });
        }

        return res.status(201).json({ message: "Dado adicionado com sucesso!" });
    } else if (req.method === 'GET') {
        return res.status(200).json(dados);
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
