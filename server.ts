import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper for Gemini AI
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant Route for Vehicle Maintenance & Diagnostics & Schedule Recommendation
  app.post("/api/ai/maintenance-recommendation", async (req, res) => {
    try {
      const { make, model, year, currentKm, mileagePerDay, userNotes } = req.body;
      const ai = getAi();
      
      if (!ai) {
        return res.status(503).json({ 
          error: "GEMINI_API_KEY não configurada no servidor. Usando recomendações padrão baseadas na tabela de fabricante." 
        });
      }

      const prompt = `Você é um especialista sênior em engenharia automotiva e manutenção preventiva para o mercado brasileiro e latino-americano.
Gere um plano de manutenção recomendado para o seguinte veículo:
- Marca/Modelo: ${make || "Veículo Genérico"} ${model || ""}
- Ano: ${year || "Recente"}
- Quilometragem Atual: ${currentKm || 50000} km
- Média rodada por dia: ${mileagePerDay || 30} km/dia
- Observações do proprietário: ${userNotes || "Nenhuma"}

Retorne em formato JSON estrito com a seguinte estrutura:
{
  "summary": "Resumo rápido da saúde estimada do veículo",
  "recommendations": [
    {
      "item": "Nome da peça/serviço (ex: Troca de Óleo e Filtro)",
      "category": "Óleo e Lubrificantes" | "Freios" | "Pneus e Alinhamento" | "Motor e Correias" | "Transmissão" | "Filtros" | "Suspensão",
      "intervalKm": 10000,
      "intervalMonths": 12,
      "estimatedCostBrl": 350,
      "urgency": "alta" | "media" | "baixa",
      "description": "Explicação técnica detalhada",
      "recommendedBrands": ["Marca1", "Marca2"]
    }
  ],
  "estimatedFutureCost6Months": 1200,
  "resaleTip": "Dica especial para valorizar a revenda deste modelo específico"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);
      res.json(data);
    } catch (err: any) {
      console.error("Erro na API Gemini:", err);
      res.status(500).json({ error: err?.message || "Erro interno ao consultar IA" });
    }
  });

  // AI Route for scanning invoices/receipts or text
  app.post("/api/ai/parse-receipt", async (req, res) => {
    try {
      const { invoiceText } = req.body;
      const ai = getAi();

      if (!ai) {
        return res.status(503).json({ error: "Chave Gemini não disponível." });
      }

      const prompt = `Analise a seguinte nota fiscal/comprovante de manutenção de veículo e extraia os dados principais:
Texto/Descrição: "${invoiceText}"

Retorne em formato JSON estrito:
{
  "serviceTitle": "Título do Serviço Principal",
  "category": "Categoria mais adequada",
  "totalCostBrl": 0,
  "mechanicShop": "Nome da oficina/estabelecimento se houver",
  "parts": [
    {
      "partName": "Nome da peça",
      "brand": "Marca",
      "partNumber": "Código/SKU se houver",
      "costBrl": 0,
      "quantity": 1
    }
  ],
  "date": "YYYY-MM-DD"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Erro na análise" });
    }
  });

  // AI Route to generate/customize PRD & Architecture spec
  app.post("/api/ai/generate-prd", async (req, res) => {
    try {
      const { surveyData } = req.body;
      const ai = getAi();

      if (!ai) {
        return res.status(503).json({ error: "Gemini não disponível" });
      }

      const prompt = `Gere uma especificação de PRD (Product Requirements Document) e Arquitetura de Software Modular detalhada com base no seguinte questionário do usuário:
${JSON.stringify(surveyData, null, 2)}

Retorne um JSON estruturado com:
{
  "title": "Documento de Requisitos e Arquitetura - Gestão Veicular",
  "version": "1.0.0",
  "executiveSummary": "Resumo executivo",
  "problemStatement": "Declaração do problema e dores do cliente",
  "userPersonas": ["Persona 1", "Persona 2"],
  "functionalRequirements": [
    { "id": "RF01", "title": "Título", "description": "Descrição", "priority": "P0" }
  ],
  "aiAgents": [
    { "name": "Nome do Agente", "role": "Papel e responsabilidade", "inputs": "Entradas", "outputs": "Saídas" }
  ],
  "classDiagramDescription": "Descrição das classes e relacionamentos",
  "pwaStrategy": "Estratégia PWA e offline",
  "scalingRoadmap": ["Fase 1", "Fase 2", "Fase 3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Erro ao gerar PRD" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
