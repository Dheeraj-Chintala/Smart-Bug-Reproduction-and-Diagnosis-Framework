import type { BugInput, DiagnosisResult } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// We default to a sensible model if the user didn't specify, but for this app GPT-4o or Claude 3.5 Sonnet is usually best.
const MODEL = "openai/gpt-4o-mini";

const SYSTEM_PROMPT = `You are an expert, elite senior software engineer and diagnostic AI assistant called the "Smart Bug Diagnosis Assistant".

Your task is to analyze bug reports, error descriptions, and stack traces provided by the user, and respond ONLY with a strictly formatted JSON object. 
You must not include any markdown formatting outside of the JSON block, and you must return ONLY valid, parsable JSON.

If the user input seems completely unrelated to software bugs, errors, or programming (e.g. asking for a recipe or general knowledge), you must gracefully reject it by returning a JSON where \`classification\` is set to "Unrelated Request" and providing a brief explanation in the \`explanation\` field, leaving other fields empty or default.

The JSON output MUST exactly match this structure:
{
  "title": "A short, descriptive title for the bug (max 6 words)",
  "severity": "Must be exactly one of: Low, Medium, High, Critical",
  "classification": "Brief category of the bug (e.g. 'Null Pointer Exception', 'Syntax Error', 'Unrelated Request')",
  "root_cause": "A concise 1-2 sentence explanation of the underlying cause",
  "explanation": "A more detailed technical explanation of why the bug occurs and what it means",
  "suggested_fix": "Code snippet or explicit instructions on how to fix the issue. Use markdown code blocks inside the string if applicable.",
  "reproduction_steps": ["Step 1", "Step 2", "Step 3"],
  "prevention_strategy": "Advice on how to prevent similar bugs in the future",
  "confidence_score": 95 // A number between 0 and 100 representing how confident you are in this diagnosis
}`;

export class AIParsingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AIParsingError";
    }
}

export const analyzeBug = async (input: BugInput): Promise<DiagnosisResult> => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error("OpenRouter API key is missing. Please add it to your .env file as VITE_OPENROUTER_API_KEY.");
    }

    const userPrompt = `
Analyze the following bug report, error message, or stack trace. Generate a title and determine the severity, then provide the full diagnosis:

${input.errorMessage}
`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": window.location.origin,
                "X-Title": "Smart Bug Diagnosis Assistant",
            },
            body: JSON.stringify({
                model: MODEL,
                response_format: { type: "json_object" }, // Ensures some models return JSON
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("No content received from AI.");
        }

        // Clean up potential markdown formatting if the model ignored instructions
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');

        try {
            const parsed = JSON.parse(content) as DiagnosisResult;

            // Basic validation
            if (!parsed.classification || typeof parsed.confidence_score !== 'number' || !parsed.title || !parsed.severity) {
                throw new AIParsingError("AI response missing required fields.");
            }

            return parsed;
        } catch (e) {
            // Auto-formatting fallback attempt if JSON parsing fails
            console.error("Failed to parse JSON directly. Attempting to extract JSON block...", e, content);

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]) as DiagnosisResult;
                } catch (innerE) {
                    throw new AIParsingError("Failed to parse AI response into JSON even after auto-fix strategies.");
                }
            }
            throw new AIParsingError("The AI did not return a valid JSON structure.");
        }
    } catch (error) {
        console.error("Error in analyzeBug:", error);
        throw error;
    }
};
