// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview AI agent that generates a personalized academic plan for students.
 *
 * - generateAcademicPlan - A function that generates an academic plan.
 * - GenerateAcademicPlanInput - The input type for the generateAcademicPlan function.
 * - GenerateAcademicPlanOutput - The return type for the generateAcademicPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAcademicPlanInputSchema = z.object({
  selfAssessment: z
    .string()
    .describe(
      'A detailed self-assessment by the student, including strengths, weaknesses, learning style, and interests.'
    ),
  academicGoals: z
    .string()
    .describe(
      'The students academic goals, including target GPA, desired courses, and career aspirations.'
    ),
});
export type GenerateAcademicPlanInput = z.infer<typeof GenerateAcademicPlanInputSchema>;

const GenerateAcademicPlanOutputSchema = z.object({
  academicPlan: z
    .string()
    .describe(
      'A detailed academic plan, including specific steps, timelines, and resources, tailored to the students self-assessment and goals.'
    ),
});
export type GenerateAcademicPlanOutput = z.infer<typeof GenerateAcademicPlanOutputSchema>;

export async function generateAcademicPlan(
  input: GenerateAcademicPlanInput
): Promise<GenerateAcademicPlanOutput> {
  return generateAcademicPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAcademicPlanPrompt',
  input: {schema: GenerateAcademicPlanInputSchema},
  output: {schema: GenerateAcademicPlanOutputSchema},
  prompt: `You are an expert academic advisor. Generate a personalized academic plan for the student based on their self-assessment and goals. Provide specific steps, timelines, and resources.

Self-Assessment: {{{selfAssessment}}}
Academic Goals: {{{academicGoals}}}

Academic Plan:`,
});

const generateAcademicPlanFlow = ai.defineFlow(
  {
    name: 'generateAcademicPlanFlow',
    inputSchema: GenerateAcademicPlanInputSchema,
    outputSchema: GenerateAcademicPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
