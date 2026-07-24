import type { Config, Context } from '@netlify/functions';
import { getAi, json, parseJsonBody, requirePost } from './_shared/http';

export default async (request: Request, _context: Context) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const { invoiceText } = await parseJsonBody<{ invoiceText?: string }>(request);
    if (!invoiceText?.trim()) return json({ error: 'Informe o texto do comprovante.' }, 400);

    const ai = getAi();
    if (!ai) return json({ error: 'GEMINI_API_KEY não configurada no Netlify.' }, 503);

    const prompt = `Analise o comprovante de manutenção abaixo e retorne JSON estrito.
Texto: ${JSON.stringify(invoiceText.slice(0, 20000))}

Formato:
{
  "serviceTitle": "Serviço principal",
  "category": "Categoria",
  "totalCostBrl": 0,
  "mechanicShop": "Oficina",
  "parts": [{
    "partName": "Peça",
    "brand": "Marca",
    "partNumber": "Código",
    "costBrl": 0,
    "quantity": 1
  }],
  "date": "YYYY-MM-DD"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('parse-receipt:', error);
    return json({ error: error instanceof Error ? error.message : 'Erro interno.' }, 500);
  }
};

export const config: Config = {
  path: '/api/ai/parse-receipt',
};
