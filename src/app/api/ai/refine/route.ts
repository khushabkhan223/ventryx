import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const SECTION_PROMPTS: Record<string, string> = {
    problem: `You are a startup validation expert. The user has written a problem statement for their startup idea. 
Provide a refined, clearer version of their problem statement and 2-3 specific suggestions to make it more compelling. 
Focus on clarity, specificity, and impact. Keep the same intent but sharpen the language.`,

    segment: `You are a market analysis expert. The user has described their target segment. 
Suggest improvements to make their target description more specific and actionable. 
Include suggestions for better audience definition and distribution channels.`,

    pricing: `You are a pricing strategy expert. Based on the user's pricing description, 
suggest refinements to their pricing model and value proposition language. 
Focus on making the value justification clearer and more compelling.`,

    competitive: `You are a competitive strategy expert. The user has described their key differentiator. 
Suggest ways to sharpen their positioning statement and identify stronger differentiation angles. 
Be specific and actionable.`,

    revenue: `You are a financial modeling expert. Based on the user's revenue assumptions, 
provide suggestions for validating these numbers and potential risks to watch for.`,

    experiment: `You are a lean startup expert. Review the user's validation experiment plan 
and suggest improvements to make it more rigorous, cost-effective, and conclusive.`,
};

export async function POST(request: NextRequest) {
    // Check if AI is configured
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'AI service not configured. Set GEMINI_API_KEY in environment variables.' },
            { status: 503 }
        );
    }

    try {
        const { section, input, context } = await request.json();

        if (!section || !input) {
            return NextResponse.json(
                { error: 'Missing required fields: section, input' },
                { status: 400 }
            );
        }

        const systemPrompt = SECTION_PROMPTS[section] ?? SECTION_PROMPTS['problem'];

        const prompt = `${systemPrompt}

User input:
${input}

${context ? `Additional context: ${context}` : ''}

Respond in JSON format:
{
  "refinement": "improved version of their text",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                    responseMimeType: 'application/json',
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return NextResponse.json(
                { error: 'AI service returned an error' },
                { status: 502 }
            );
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return NextResponse.json(
                { error: 'Empty response from AI service' },
                { status: 502 }
            );
        }

        // Parse the JSON response from Gemini
        const parsed = JSON.parse(text);

        return NextResponse.json({
            refinement: parsed.refinement ?? '',
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        });
    } catch (error) {
        console.error('AI refine error:', error);
        return NextResponse.json(
            { error: 'Failed to process AI refinement request' },
            { status: 500 }
        );
    }
}
