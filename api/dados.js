import { db } from './firebase'; // Certifique-se de que a importação está correta

export default async function handler(req, res) {
    const dadosCollection = db.collection('dados'); // Referência à coleção 'dados'

    if (req.method === 'POST') {
        // Adiciona um novo dado
        const { descricao, valor } = req.body;
        if (!descricao || !valor) {
            return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
        }

        try {
            // Adiciona os dados na coleção Firestore
            await dadosCollection.add({
                descricao,
                valor,
                createdAt: admin.firestore.FieldValue.serverTimestamp(), // Adiciona um timestamp
            });

            return res.status(201).json({ message: "Dado adicionado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao adicionar dados no Firestore." });
        }
    } else if (req.method === 'GET') {
        // Retorna todos os dados
        try {
            const snapshot = await dadosCollection.get();
            const dados = snapshot.docs.map(doc => doc.data()); // Pega os dados dos documentos
            return res.status(200).json(dados);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar dados no Firestore." });
        }
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
