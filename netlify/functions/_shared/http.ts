import { GoogleGenAI } from '@google/genai';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export const requirePost = (request: Request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405);
  }
  return null;
};

export const getAi = () => {
  const apiKey = Netlify.env.get('GEMINI_API_KEY');
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
};

export const parseJsonBody = async <T>(request: Request): Promise<T> => {
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > 1_000_000) {
    throw new Error('O conteúdo enviado excede o limite permitido.');
  }
  return request.json() as Promise<T>;
};
