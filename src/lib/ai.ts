'use server';
import ollama from 'ollama';

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/* https://github.com/ollama/ollama-js/blob/60bfed19efa6a89fa0134ca2356498f63bd0e3f4/examples/structured_outputs/structured-outputs.ts */

const model = 'qwen3:1.7b';

const promptSchema = z.object({
    prompt: z.string().describe('A short, non-trivia prompt for a party game where people need to write a short response. This should not be trivia but rather, a prompt that will be funny or interesting to write a ~2 sentence response'),
    example_response: z.string().describe('An example response to the prompt')
});
async function run(model: string): Promise<z.infer<typeof promptSchema>> {
    // Convert the Zod schema to JSON Schema format
    const jsonSchema = zodToJsonSchema(promptSchema);

    /* Can use manually defined schema directly (this is for the example friends schema that was in the example)
    const schema = { 
        'type': 'object', 
        'properties': { 
            'friends': { 
                'type': 'array', 
                'items': { 
                    'type': 'object', 
                    'properties': { 
                        'name': { 'type': 'string' }, 
                        'age': { 'type': 'integer' }, 
                        'is_available': { 'type': 'boolean' } 
                    }, 
                    'required': ['name', 'age', 'is_available'] 
                } 
            } 
        }, 
        'required': ['friends'] 
    }
    */

    const messages = [{
        role: 'user',
        content: 'Generate a prompt for a party game where people need to write a short response. This should not be trivia but rather, a prompt that will be funny or interesting to write a ~2 sentence response'
    }];

    const response = await ollama.chat({
        model: model,
        messages: messages,
        format: jsonSchema, // or format: schema
        options: {
            temperature: 0 // Make responses more deterministic
        }
    });

    // Parse and validate the response
    try {
        const promptResponse = promptSchema.parse(JSON.parse(response.message.content));
        console.log(promptResponse);
        return promptResponse;
    } catch (error) {
        console.error("Generated invalid response:", error);
        throw error;
    }
}

export async function generateStuff(): Promise<z.infer<typeof promptSchema>> {
    try {
        // Enforce a 10s timeout on model generation
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI generation timed out')), 10_000)
        );
        const stuff = await Promise.race([run(model), timeout]) as z.infer<typeof promptSchema>;
        return stuff;
    } catch (error) {
        console.error("Ollama/AI failed, using fallback pair:", error);
        // Fallback pair: return both prompt and example response
        return {
            prompt: "What's the most ridiculous thing you've ever bought?",
            example_response: "I once bought a pet rock with googly eyes glued to it."
        };
    }
}