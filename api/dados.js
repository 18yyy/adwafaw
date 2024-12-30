import admin from 'firebase-admin';

// Inicializar o Firebase Admin com as credenciais do seu projeto
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: "https://hamburgueria-69d7a.firebaseio.com"
    });
} else {
    admin.app(); // Usar a instância já inicializada
}

const db = admin.firestore(); // Inicializa o Firestore

// Função do handler para processar as requisições
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
            console.error("Erro ao adicionar dados no Firestore:", error); // Log de erro
            return res.status(500).json({ error: "Erro ao adicionar dados no Firestore." });
        }
    } else if (req.method === 'GET') {
        // Retorna todos os dados
        try {
            const snapshot = await dadosCollection.get();
            const dados = snapshot.docs.map(doc => doc.data()); // Pega os dados dos documentos
            return res.status(200).json(dados);
        } catch (error) {
            console.error("Erro ao buscar dados no Firestore:", error); // Log de erro
            return res.status(500).json({ error: "Erro ao buscar dados no Firestore." });
        }
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
