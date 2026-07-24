import type { Config, Context } from '@netlify/functions';
import { getAi, json, parseJsonBody, requirePost } from './_shared/http';

type MaintenanceRequest = {
  make?: string;
  model?: string;
  year?: string | number;
  currentKm?: number;
  mileagePerDay?: number;
  userNotes?: string;
};

export default async (request: Request, _context: Context) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const { make, model, year, currentKm, mileagePerDay, userNotes } =
      await parseJsonBody<MaintenanceRequest>(request);
    const ai = getAi();
    if (!ai) {
      return json({ error: 'GEMINI_API_KEY não configurada no Netlify.' }, 503);
    }

    const prompt = `Você é um especialista sênior em engenharia automotiva e manutenção preventiva para o mercado brasileiro e latino-americano.
Gere um plano de manutenção recomendado para:
- Marca/Modelo: ${make || 'Veículo Genérico'} ${model || ''}
- Ano: ${year || 'Recente'}
- Quilometragem Atual: ${currentKm || 50000} km
- Média rodada por dia: ${mileagePerDay || 30} km/dia
- Observações: ${userNotes || 'Nenhuma'}

Retorne JSON estrito:
{
  "summary": "Resumo da saúde estimada",
  "recommendations": [{
    "item": "Nome do serviço",
    "category": "Categoria",
    "intervalKm": 10000,
    "intervalMonths": 12,
    "estimatedCostBrl": 350,
    "urgency": "alta",
    "description": "Explicação técnica",
    "recommendedBrands": ["Marca1"]
  }],
  "estimatedFutureCost6Months": 1200,
  "resaleTip": "Dica de valorização"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('maintenance-recommendation:', error);
    return json({ error: error instanceof Error ? error.message : 'Erro interno.' }, 500);
  }
};

export const config: Config = {
  path: '/api/ai/maintenance-recommendation',
};
