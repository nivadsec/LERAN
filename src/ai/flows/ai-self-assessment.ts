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
    .string()
    .describe('A summary of the student’s academic strengths.'),
  weaknesses: z
    .string()
    .describe('A summary of the student’s academic weaknesses.'),
  successPlan: z
    .string()
    .describe(
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
  prompt: `You are an AI assistant designed to evaluate student's academic strengths and weaknesses and create an academic success plan.

  Evaluate the student based on the following data:
  Student Data: {{{studentData}}}
  Academic Goals: {{{academicGoals}}}

  Provide a detailed academic success plan tailored to the student, including recommended study strategies, resources, and a timeline for achieving their goals.
  The output should include strengths, weaknesses and a success plan, all in text format.
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
