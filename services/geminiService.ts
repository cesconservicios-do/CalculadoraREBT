import { BudgetItem } from '../types';

const REQUEST_TIMEOUT_MS = 15000;

// La clave de Gemini ya no vive en el cliente (ver api/suggest-budget.ts),
// así que no hay forma de comprobar de antemano si el servidor la tiene
// configurada. Se deja el asistente siempre disponible y cualquier fallo
// de configuración se reporta como error normal de la llamada.
export function isGeminiConfigured(): boolean {
  return true;
}

export async function suggestBudgetItems(tipo: string, descripcionAdicional: string): Promise<BudgetItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/suggest-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, descripcionAdicional }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => null) as { items?: BudgetItem[]; error?: string } | null;

    if (!response.ok) {
      throw new Error(data?.error || 'No se pudo obtener sugerencias de la IA.');
    }

    return data?.items ?? [];
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('La solicitud a Gemini ha superado el tiempo de espera (15s).');
    }
    if (err instanceof Error) throw err;
    throw new Error('No se pudo obtener sugerencias de la IA. Inténtalo de nuevo.');
  } finally {
    clearTimeout(timeoutId);
  }
}
