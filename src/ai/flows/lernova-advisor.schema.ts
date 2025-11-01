import { z } from 'zod';

export const LernovaAdvisorInputSchema = z.string().describe("The student's question for the academic advisor.");
export const LernovaAdvisorOutputSchema = z.string().describe("Lernova's response to the student.");

export type LernovaAdvisorInput = z.infer<typeof LernovaAdvisorInputSchema>;
export type LernovaAdvisorOutput = z.infer<typeof LernovaAdvisorOutputSchema>;
