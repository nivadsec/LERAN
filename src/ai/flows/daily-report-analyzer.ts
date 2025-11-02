'use server';

/**
 * @fileOverview This file defines an AI flow for analyzing a single daily report of a student.
 *
 * - analyzeSingleDailyReport - The main function to initiate the analysis.
 * - DailyReportAnalysisInput - The input type for the function.
 * - DailyReportAnalysisOutput - The output type representing the AI's analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DailyReportAnalysisInputSchema = z.object({
  reportData: z.string().describe('A JSON string representing a single daily report for a student. It includes study time, test performance, mental state, etc., for that specific day.'),
});

const DailyReportAnalysisOutputSchema = z.object({
  dailySummary: z.string().describe('A brief, overall summary of the student\'s performance for this specific day.'),
  positivePoints: z.array(z.string()).describe('A list of specific positive achievements or good practices from the day.'),
  improvementAreas: z.array(z.string()).describe('A list of actionable suggestions for improvement based on the day\'s data.'),
});

export type DailyReportAnalysisInput = z.infer<typeof DailyReportAnalysisInputSchema>;
export type DailyReportAnalysisOutput = z.infer<typeof DailyReportAnalysisOutputSchema>;

export async function analyzeSingleDailyReport(
  input: DailyReportAnalysisInput
): Promise<DailyReportAnalysisOutput> {
  
  const dailyReportAnalyzerFlow = ai.defineFlow(
    {
      name: 'dailyReportAnalyzerFlow',
      inputSchema: DailyReportAnalysisInputSchema,
      outputSchema: DailyReportAnalysisOutputSchema,
    },
    async (input) => {
        
        const prompt = ai.definePrompt({
            name: 'dailyReportAnalysisPrompt',
            input: { schema: DailyReportAnalysisInputSchema },
            output: { schema: DailyReportAnalysisOutputSchema },
            prompt: `You are an expert academic consultant analyzing a student's single daily report. Your tone is analytical, supportive, and focused on providing concrete feedback for that specific day.

            Analyze the following JSON data which represents one daily report:

            \`\`\`json
            {{{reportData}}}
            \`\`\`

            Based ONLY on the data for this single day, provide the following in clear, concise Persian:
            1.  **dailySummary**: A brief summary of the day's performance. Was it a productive day? How was the student's overall state?
            2.  **positivePoints**: Identify 2-3 specific positive points. For example, "Excellent percentage in the Physics test shows good grasp of the topic," or "Good balance between study time and rest."
            3.  **improvementAreas**: Identify 2-3 concrete areas for improvement based on the day's data. For example, "The high amount of wasted time (wastedHours) might be impacting the total study duration. It's worth exploring the reasons," or "While total study time is good, the low test percentage in Math suggests a need to review study methods for that subject."

            Your entire response MUST be in Persian. Focus only on the provided day's report.
            `,
        });

      const { output } = await prompt(input);
      return output!;
    }
  );
  
  return await dailyReportAnalyzerFlow(input);
}
