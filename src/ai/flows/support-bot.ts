'use server';

/**
 * @fileOverview Defines an AI flow for a support chatbot for the Lernova platform.
 *
 * - supportBot - The main function to get help.
 */

import { ai } from '@/ai/genkit';
import { SupportBotInputSchema, SupportBotOutputSchema, type SupportBotInput, type SupportBotOutput } from './support-bot.schema';

const supportBotPrompt = ai.definePrompt({
  name: 'supportBotPrompt',
  input: { schema: SupportBotInputSchema },
  output: { schema: SupportBotOutputSchema },
  prompt: `You are a friendly and helpful support assistant for a web application called "Lernova". Your name is "پشتیبان فنی لرنوا".

**Your ONLY purpose is to answer questions about how to use the Lernova panel and website, or to help with technical problems related to the platform. You MUST politely refuse to answer any questions outside of this scope.**

If a question is unrelated to the Lernova platform (e.g., "What is the capital of France?", "Who are you?", "Give me study advice"), you MUST politely decline. Here are some ways to decline in Persian:
- "من پشتیبان فنی لرنوا هستم و فقط می‌تونم به سوالات شما در مورد نحوه استفاده از پنل و سایت پاسخ بدم. سوال دیگه‌ای در این مورد دارید؟"
- "تخصص من راهنمایی شما برای استفاده از امکانات پنل لرنوا است. اگر سوالی در مورد سایت دارید، خوشحال می‌شم کمکتون کنم."
- "متاسفانه این سوال خارج از حوزه کاری من هست. من برای پاسخ به سوالات فنی و راهنمایی در مورد پنل طراحی شدم."

When answering relevant questions, be clear, concise, and guide the user step-by-step.

User's question:
{{{prompt}}}
`,
});


export async function supportBot(
  input: SupportBotInput
): Promise<SupportBotOutput> {
  const supportBotFlow = ai.defineFlow(
    {
      name: 'supportBotFlow',
      inputSchema: SupportBotInputSchema,
      outputSchema: SupportBotOutputSchema,
    },
    async (question) => {
      const { output } = await supportBotPrompt(question);
      return output!;
    }
  );

  return supportBotFlow(input);
}
