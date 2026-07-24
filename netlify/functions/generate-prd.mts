import type { Config, Context } from '@netlify/functions';
import { getAi, json, parseJsonBody, requirePost } from './_shared/http';

export default async (request: Request, _context: Context) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const { surveyData } = await parseJsonBody<{ surveyData?: unknown }>(request);
    if (!surveyData) return json({ error: 'Questionário não informado.' }, 400);

    const ai = getAi();
    if (!ai) return json({ error: 'GEMINI_API_KEY não configurada no Netlify.' }, 503);

    const prompt = `Gere um PRD e uma arquitetura modular com base no questionário:
${JSON.stringify(surveyData, null, 2).slice(0, 30000)}

Retorne JSON estruturado:
{
  "title": "Documento de Requisitos e Arquitetura - Gestão Veicular",
  "version": "1.0.0",
  "executiveSummary": "Resumo executivo",
  "problemStatement": "Problema",
  "userPersonas": ["Persona"],
  "functionalRequirements": [{
    "id": "RF01",
    "title": "Título",
    "description": "Descrição",
    "priority": "P0"
  }],
  "aiAgents": [{
    "name": "Agente",
    "role": "Papel",
    "inputs": "Entradas",
    "outputs": "Saídas"
  }],
  "classDiagramDescription": "Descrição",
  "pwaStrategy": "Estratégia",
  "scalingRoadmap": ["Fase 1"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('generate-prd:', error);
    return json({ error: error instanceof Error ? error.message : 'Erro interno.' }, 500);
  }
};

export const config: Config = {
  path: '/api/ai/generate-prd',
};
