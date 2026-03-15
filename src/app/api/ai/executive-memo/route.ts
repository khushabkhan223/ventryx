import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExecutiveMemoPayload } from '@/lib/types';

export async function POST(request: NextRequest) {
    // --- Auth + Pro check ---
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll() { /* read-only in API route */ },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single();

    if (!profile?.is_pro) {
        return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    // --- API key check ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'AI service not configured. Contact administrator.' },
            { status: 503 }
        );
    }

    // --- Parse payload ---
    let payload: ExecutiveMemoPayload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // --- Build prompt ---
    const systemPrompt = buildSystemPrompt(payload);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
            },
        });

        const text = result.response.text();

        return NextResponse.json({ memo: text });
    } catch (err) {
        console.error('Gemini API error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to generate executive memo: ${message}` },
            { status: 500 }
        );
    }
}

function buildSystemPrompt(p: ExecutiveMemoPayload): string {
    const scenarioLines = p.scenarioSummary
        .map(s => `  - ${s.label}: Break-even M${s.breakEvenMonth ?? 'N/A'}, Runway ${s.runwayMonths ? `M${s.runwayMonths}` : 'Sustainable'}, LTV:CAC ${s.ltvCacRatio}x`)
        .join('\n');

    return `You are a senior financial analyst writing an Executive Decision Memo for a startup idea validation.

RULES — STRICTLY ENFORCED:
- Write in a serious, analytical tone. No motivational language. No hype.
- Reference the EXACT numeric values provided below. Do not invent or approximate.
- If viability index is below 40, clearly recommend reworking the idea before any scaling.
- If LTV:CAC ratio is below 1.0, explicitly warn against paid customer acquisition.
- If runway months is less than break-even month, highlight capital risk prominently.
- Do NOT soften negative conclusions. Deliver uncomfortable truths directly.
- Do NOT use phrases like "exciting opportunity", "great potential", "promising start".
- Do NOT provide generic startup advice. Be specific to the computed data.
- Structure the output exactly as the 7 sections below.

COMPUTED DATA:
- Viability Index: ${p.viabilityIndex}/100
- Weakest Assumption: ${p.weakestAssumption.category} (score: ${p.weakestAssumption.score}/100)
- Strongest Assumption: ${p.strongestAssumption.category} (score: ${p.strongestAssumption.score}/100)
- Category Scores: ${Object.entries(p.categoryScores).map(([k, v]) => `${k}: ${v}/100`).join(', ')}
- Risk Flags: ${p.riskFlags.length > 0 ? p.riskFlags.map(f => `[${f.severity}] ${f.message}`).join('; ') : 'None'}
- Break-Even Month: ${p.breakEvenMonth ?? 'Not projected within 24 months'}
- Runway Months: ${p.runwayMonths ? `Month ${p.runwayMonths} (capital depleted)` : 'Sustainable (break-even before depletion)'}
- LTV:CAC Ratio: ${p.ltvCacRatio}x (${p.ltvCacLabel})
- Monthly Churn Rate: ${p.churnRate}%
- Capital Required to Break-Even: $${p.capitalRequired.toLocaleString()}
- Capital Efficiency Score: ${p.capitalEfficiencyScore} (${p.capitalEfficiencyLabel})
- Scenario Analysis:
${scenarioLines}

OUTPUT STRUCTURE (use these exact headings):

## 1. Executive Summary
3-5 paragraphs. State the viability index, overall recommendation, and key financial metrics.

## 2. Market & Problem Assessment
Evaluate the problem-market fit based on category scores.

## 3. Financial Risk Analysis
Analyze LTV:CAC ratio, churn rate, and their implications. Reference the exact band classification.

## 4. Capital Efficiency & Runway Assessment
Discuss capital efficiency score, runway months vs break-even, and capital requirements.

## 5. Primary Vulnerability
Identify the weakest assumption and explain its structural risk to the business model.

## 6. Recommended Validation Actions
Provide 3-5 specific, actionable validation steps tied to the identified weaknesses. No generic advice.

## 7. Final Recommendation
One paragraph. Direct, honest assessment. Reference the viability index and key risk factors. Do not hedge.`;
}
