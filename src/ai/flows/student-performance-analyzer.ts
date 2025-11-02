'use server';

/**
 * @fileOverview This file defines an AI flow for analyzing a student's performance based on their recent daily reports.
 *
 * - analyzeStudentPerformance - The main function to initiate the analysis.
 * - StudentPerformanceAnalysisInput - The input type for the function.
 * - StudentPerformanceAnalysisOutput - The output type representing the AI's analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StudentPerformanceAnalysisInputSchema = z.object({
  recentReportsData: z.string().describe('A JSON string representing an array of the student\'s most recent daily reports. Each report includes study time, test performance, and mental state.'),
});

const StudentPerformanceAnalysisOutputSchema = z.object({
  summary: z.string().describe('A brief, overall summary of the student\'s performance and general state based on the provided reports.'),
  keyTrends: z.array(z.string()).describe('A list of notable positive or negative trends, such as declining study hours, improving test scores, or consistent low mental state.'),
  suggestionsForTeacher: z.array(z.string()).describe('A list of actionable suggestions for the teacher or consultant to help the student, based on the identified trends.'),
});

export type StudentPerformanceAnalysisInput = z.infer<typeof StudentPerformanceAnalysisInputSchema>;
export type StudentPerformanceAnalysisOutput = z.infer<typeof StudentPerformanceAnalysisOutputSchema>;

export async function analyzeStudentPerformance(
  input: StudentPerformanceAnalysisInput
): Promise<StudentPerformanceAnalysisOutput> {

  const studentPerformanceAnalyzerFlow = ai.defineFlow(
    {
      name: 'studentPerformanceAnalyzerFlow',
      inputSchema: StudentPerformanceAnalysisInputSchema,
      outputSchema: StudentPerformanceAnalysisOutputSchema,
    },
    async (input) => {
        
        const prompt = ai.definePrompt({
            name: 'studentPerformancePrompt',
            input: { schema: StudentPerformanceAnalysisInputSchema },
            output: { schema: StudentPerformanceAnalysisOutputSchema },
            prompt: `You are an expert academic consultant analyzing a student's recent performance reports. The data is in Persian (Farsi). Your task is to provide a concise and actionable analysis for the teacher/consultant.

            Analyze the following JSON data which contains the student's reports from the last few days:
            \`\`\`json
            {{{recentReportsData}}}
            \`\`\`

            Based on this data, provide the following in clear, professional, and encouraging Persian:
            1.  **summary**: A brief summary of the student's overall performance. Are they consistent? Are there any immediate red flags?
            2.  **keyTrends**: Identify 2-3 most important positive or negative trends. For example: "Trend of decreasing study time over the last 3 days," or "Mental state has been consistently low," or "Significant improvement in test percentages."
            3.  **suggestionsForTeacher**: Based on the trends, provide 2-3 concrete, actionable suggestions for the teacher. For example: "Discuss the reasons for the recent drop in study time with the student," or "Praise the student for their improved test scores and ask about their new strategy."

            Your entire response MUST be in Persian.
            `,
        });

      const { output } = await prompt(input);
      return output!;
    }
  );
  
  return await studentPerformanceAnalyzerFlow(input);
}
