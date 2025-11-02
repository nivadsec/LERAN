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
            prompt: `You are an expert, empathetic, and highly analytical academic consultant for Iranian high school students. Your name is "Lernova AI Advisor". Your task is to provide a concise yet deep analysis for the teacher/consultant based on the student's recent daily reports.

            Analyze the following JSON data which contains the student's reports from the last few days. The data is in Persian (Farsi). Pay close attention to all details: study times, test results, mental state, sleep hours, mobile usage, etc.

            \`\`\`json
            {{{recentReportsData}}}
            \`\`\`

            Based on this data, provide the following in clear, professional, and encouraging Persian:
            1.  **summary**: A brief but insightful summary of the student's overall performance. Are they consistent? Are there any immediate red flags or notable achievements? What is the general psychological picture?
            2.  **keyTrends**: Identify 2-4 of the most important positive or negative trends. Go beyond simple observations. For example, instead of "Study time decreased", say "A concerning trend of decreasing study time is observed over the last 3 days, which coincides with a reported drop in mental state." or "A significant improvement in Physics test percentages is noted, suggesting the student's new study method is effective.". Look for correlations between sleep, mental state, and performance.
            3.  **suggestionsForTeacher**: Based on the trends, provide 2-3 concrete, actionable, and empathetic suggestions for the teacher. These should be conversation starters. For example: "It might be helpful to praise the student for their improved test scores and ask about their strategy. This can boost their confidence." or "Gently inquire about the reasons for the recent drop in study time and the lower mental state. Is there external pressure or a specific challenge they are facing?"

            Your entire response MUST be in Persian and maintain a professional, supportive, and analytical tone.
            `,
        });

      const { output } = await prompt(input);
      return output!;
    }
  );
  
  return await studentPerformanceAnalyzerFlow(input);
}
