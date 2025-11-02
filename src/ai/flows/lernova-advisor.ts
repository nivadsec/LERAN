'use server';

/**
 * @fileOverview Defines an AI flow for "Lernova", an expert academic advisor.
 *
 * - lernovaAdvisor - The main function to get advice.
 */

import { ai } from '@/ai/genkit';
import { LernovaAdvisorInputSchema, LernovaAdvisorOutputSchema, type LernovaAdvisorInput, type LernovaAdvisorOutput } from './lernova-advisor.schema';


const lernovaAdvisorPrompt = ai.definePrompt({
  name: 'lernovaAdvisorPrompt',
  input: { schema: LernovaAdvisorInputSchema },
  output: { schema: LernovaAdvisorOutputSchema },
  prompt: `{{{persona}}}

Student's question:
{{{question}}}
`,
});

export async function lernovaAdvisor(
  input: LernovaAdvisorInput
): Promise<LernovaAdvisorOutput> {
   const lernovaAdvisorFlow = ai.defineFlow(
    {
      name: 'lernovaAdvisorFlow',
      inputSchema: LernovaAdvisorInputSchema,
      outputSchema: LernovaAdvisorOutputSchema,
    },
    async (flowInput) => {
      const { output } = await lernovaAdvisorPrompt(flowInput);
      return output!;
    }
  );

  return await lernovaAdvisorFlow(input);
}
