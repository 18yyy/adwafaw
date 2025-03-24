import Redis from "ioredis";

const redis = new Redis("redis://default:uppWWa9noVGK8TiGl96o5PAjztJ4pHWW@redis-10876.c256.us-east-1-2.ec2.redns.redis-cloud.com:10876"); // URL do Redis definida na variável de ambiente

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Espera receber: quantidade, custo e valor
        const { quantidade, custo, valor } = req.body;
        if (quantidade == null || custo == null || valor == null) {
            return res.status(400).json({ error: "Quantidade, custo e valor são obrigatórios." });
        }

        // Cria uma chave única para a venda com data/hora
        const id = `venda:${Date.now()}`;
        const venda = {
            quantidade: Number(quantidade),
            custo: Number(custo), // Custo total da transação
            valor: Number(valor), // Valor total recebido
            timestamp: Date.now()
        };

        // Armazena a venda com expiração de 12 horas (43200 segundos)
        await redis.setex(id, 43200, JSON.stringify(venda));

        return res.status(201).json({ message: "Venda registrada com sucesso!", id });
    } else if (req.method === 'GET') {
        // Busca todas as vendas
        const keys = await redis.keys("venda:*");
        const vendasRaw = await Promise.all(keys.map(key => redis.get(key)));
        const vendas = vendasRaw.map(value => JSON.parse(value));

        return res.status(200).json(vendas);
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
