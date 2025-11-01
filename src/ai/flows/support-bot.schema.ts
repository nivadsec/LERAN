import { z } from 'zod';

export const SupportBotInputSchema = z.string().describe("The user's question about the Lernova panel or website.");
export const SupportBotOutputSchema = z.string().describe("The support bot's response.");

export type SupportBotInput = z.infer<typeof SupportBotInputSchema>;
export type SupportBotOutput = z.infer<typeof SupportBotOutputSchema>;
