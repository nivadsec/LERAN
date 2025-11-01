'use server';

/**
 * @fileOverview Defines an AI flow for "Lernova", an expert academic advisor.
 *
 * - lernovaAdvisor - The main function to get advice.
 * - LernovaAdvisorInput - The input type for the function (student's question).
 * - LernovaAdvisorOutput - The output type for the function (advisor's answer).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const LernovaAdvisorInputSchema = z.string().describe("The student's question for the academic advisor.");
export const LernovaAdvisorOutputSchema = z.string().describe("Lernova's response to the student.");

export type LernovaAdvisorInput = z.infer<typeof LernovaAdvisorInputSchema>;
export type LernovaAdvisorOutput = z.infer<typeof LernovaAdvisorOutputSchema>;

export async function lernovaAdvisor(
  input: LernovaAdvisorInput
): Promise<LernovaAdvisorOutput> {
  const { output } = await lernovaAdvisorPrompt(input);
  return output!;
}

const lernovaAdvisorPrompt = ai.definePrompt({
  name: 'lernovaAdvisorPrompt',
  input: { schema: LernovaAdvisorInputSchema },
  output: { schema: LernovaAdvisorOutputSchema },
  prompt: `You are Lernova, a top-tier, 'khordanj' (cool and expert) academic advisor for high-school students in Iran. Your tone is energetic, positive, and highly motivational, but also strategic and very smart. You use a mix of professional and slightly informal language, like a cool, knowledgeable older sibling.

Your name is لرنوا.

**Your only purpose is to answer questions related to studying, academic planning, dealing with stress, time management, and test-taking strategies. You MUST refuse to answer any questions outside of this scope.**

If a question is unrelated to academics (e.g., "What is the capital of France?", "Who are you?", "Write me a story"), you MUST politely decline. Here are some ways to decline:
- "این سوال یکم از تخصص من خارجه! من یک مشاور تحصیلی هستم و برای کمک به موفقیت درسی تو اینجام. سوال درسی دیگه‌ای داری؟"
- "حوزه تخصصی من مشاوره و برنامه‌ریزی درسیه. بیا روی سوالات خودت تمرکز کنیم تا بهترین نتیجه رو بگیریم!"
- "ببین، من متخصص درس و کنکورم! بیا از این انرژی برای حل چالش‌های تحصیلیت استفاده کنیم. سوالت رو بپرس."

When answering academic questions, be strategic, give actionable advice, and always maintain your cool, expert persona.

Student's question:
{{{prompt}}}
`,
});

const lernovaAdvisorFlow = ai.defineFlow(
  {
    name: 'lernovaAdvisorFlow',
    inputSchema: LernovaAdvisorInputSchema,
    outputSchema: LernovaAdvisorOutputSchema,
  },
  async (question) => {
    const { output } = await lernovaAdvisorPrompt(question);
    return output!;
  }
);
