'use server';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const promptSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A short, non-trivia prompt for a party game where people need to write a short response. This should not be trivia but rather, a prompt that will be funny or interesting to write a ~2 sentence response'
    ),
  example_response: z
    .string()
    .describe('An example response to the prompt'),
});

async function run(model: string): Promise<z.infer<typeof promptSchema>> {
  const schema = {
    type: 'object',
    properties: {
      prompt: { type: 'string' },
      example_response: { type: 'string' },
    },
    required: ['prompt', 'example_response'],
    additionalProperties: false,
  } as const;

  const response = await groq.chat.completions.create({
    model,
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content:
          'Return only JSON matching the provided schema. Generate a fun, non-trivia party-game prompt and a short example response.',
      },
      {
        role: 'user',
        content:
          'Generate a prompt for a party game where people need to write a short response. It should be funny or interesting and suitable for ~2 sentence responses. Provide fields prompt and example_response.',
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'prompt_pair',
        schema,
      },
    },
  });

  const content = response.choices?.[0]?.message?.content ?? '{}';
  const parsed = promptSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error('Failed to parse AI response');
  }
  return parsed.data;
}

export async function generateStuff(): Promise<z.infer<typeof promptSchema>> {
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), 10_000)
    );
    const result = (await Promise.race([
      run(model),
      timeout,
    ])) as z.infer<typeof promptSchema>;
    return result;
  } catch (error) {
    console.error('Groq SDK failed, using fallback pair:', error);
    return {
      prompt: "What's the most ridiculous thing you've ever bought?",
      example_response: 'I once bought a pet rock with googly eyes glued to it.',
    };
  }
}