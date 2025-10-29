'use server';

/**
 * @fileOverview This file defines the AI self-assessment flow for students.
 *
 * - aiSelfAssessment - The main function to initiate the self-assessment process.
 * - AISelfAssessmentInput - The input type for the aiSelfAssessment function.
 * - AISelfAssessmentOutput - The output type representing the assessment results and success plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISelfAssessmentInputSchema = z.object({
  studentData: z
    .string()
    .describe(
      'Detailed information about the student, including their academic history, current performance, learning style, and any specific challenges they face.'
    ),
  academicGoals: z
    .string()
    .describe(
      'The student’s specific academic goals, such as target grades, desired universities, or career aspirations.'
    ),
});
export type AISelfAssessmentInput = z.infer<typeof AISelfAssessmentInputSchema>;

const AISelfAssessmentOutputSchema = z.object({
  strengths: z
    .array(z.string())
    .describe('A list of the student’s academic strengths.'),
  weaknesses: z
    .array(z.string())
    .describe('A list of the student’s academic weaknesses.'),
  successPlan: z.object({
    title: z.string().describe("The title of the academic success plan."),
    steps: z.array(z.object({
        step: z.number(),
        title: z.string().describe("The title of the step."),
        description: z.string().describe("A detailed description of the step."),
        duration: z.string().describe("The estimated duration to complete the step (e.g., '2 weeks').")
    })).describe("A list of steps to achieve the academic goals.")
  }).describe(
      'A detailed academic success plan tailored to the student, including recommended study strategies, resources, and a timeline for achieving their goals.'
    ),
});
export type AISelfAssessmentOutput = z.infer<typeof AISelfAssessmentOutputSchema>;

export async function aiSelfAssessment(
  input: AISelfAssessmentInput
): Promise<AISelfAssessmentOutput> {
  return aiSelfAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSelfAssessmentPrompt',
  input: {schema: AISelfAssessmentInputSchema},
  output: {schema: AISelfAssessmentOutputSchema},
  prompt: `You are an AI assistant designed to evaluate a student's academic profile and create a personalized success plan.

  Analyze the student based on the following data:
  - Student Data: {{{studentData}}}
  - Academic Goals: {{{academicGoals}}}

  Your response must be structured and include the following sections:
  1.  **Strengths**: Identify and list the student's key academic strengths.
  2.  **Weaknesses**: Identify and list the student's key academic weaknesses.
  3.  **Success Plan**: Create a detailed, step-by-step academic success plan. The plan should have a main title and a series of steps. Each step must include a title, a detailed description of the action required, and an estimated duration.
  `,
});

const aiSelfAssessmentFlow = ai.defineFlow(
  {
    name: 'aiSelfAssessmentFlow',
    inputSchema: AISelfAssessmentInputSchema,
    outputSchema: AISelfAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
