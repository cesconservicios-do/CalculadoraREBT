import { GoogleGenerativeAI } from '@google/generative-ai';

// Tipos mínimos propios en vez de @vercel/node: evita arrastrar dependencias
// transitivas (ajv/path-to-regexp/undici) que npm audit marca como vulnerables
// solo para dos interfaces que ya sabemos que Vercel provee en runtime.
interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

// Alias estable de Google que siempre apunta al modelo "flash" vigente,
// en vez de fijar una versión concreta que Google puede deprecar sin aviso
// (así fue como "gemini-1.5-flash" dejó de funcionar).
const MODEL_NAME = 'gemini-flash-latest';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_DESCRIPTION_LENGTH = 300;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('La solicitud a Gemini ha superado el tiempo de espera (15s).')), ms)
    )
  ]);
}

function extractJsonArray(text: string): unknown[] {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('La respuesta de la IA no contiene un array JSON válido.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY no configurada en el servidor.' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
    | { tipo?: unknown; descripcionAdicional?: unknown }
    | undefined;

  const tipo = body?.tipo;
  if (!tipo || typeof tipo !== 'string') {
    res.status(400).json({ error: 'El campo "tipo" es obligatorio.' });
    return;
  }

  const descripcionAdicional = typeof body?.descripcionAdicional === 'string'
    ? body.descripcionAdicional.slice(0, MAX_DESCRIPTION_LENGTH)
    : '';

  const prompt = `Eres un electricista profesional español con 20 años de experiencia. Para una ${tipo} en ${descripcionAdicional || 'una vivienda estándar'}, sugiere entre 5 y 8 partidas de presupuesto habituales en España. Cada partida debe ser un trabajo o conjunto de materiales+mano de obra, NO precios unitarios. Responde SOLO con un array JSON con objetos {descripcion: string, unidades: number, precioOrientativo: number}. Los precios deben ser orientativos reales del mercado español 2024-2025. No incluyas texto adicional.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await withTimeout(model.generateContent(prompt), REQUEST_TIMEOUT_MS);
    const text = result.response.text();
    const parsed = extractJsonArray(text) as Array<{ descripcion: string; unidades: number; precioOrientativo: number }>;

    const items = parsed.map((item, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      description: item.descripcion,
      units: Number(item.unidades) || 1,
      unitPrice: Number(item.precioOrientativo) || 0
    }));

    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'No se pudo obtener sugerencias de la IA.' });
  }
}
