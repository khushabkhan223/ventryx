/* ========================================
   Ventryx — AI Abstraction Layer
   Provider-agnostic, server-side only
   ======================================== */

import type { AIRefineRequest, AIRefineResponse } from './types';

/**
 * Check if AI is available (API key configured)
 */
export function isAIAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
}

/**
 * Call the AI refine endpoint from the client.
 * This goes through the Next.js API route, keeping keys server-side.
 */
export async function refineWithAI(
    request: AIRefineRequest
): Promise<AIRefineResponse> {
    const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'AI service unavailable' }));
        throw new Error(error.error ?? 'AI refinement failed');
    }

    return res.json();
}
