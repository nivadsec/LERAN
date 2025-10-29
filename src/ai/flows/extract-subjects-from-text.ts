'use server';

/**
 * @fileOverview This file defines an AI flow to extract subjects and their study durations from a given text.
 *
 * - extractSubjectsFromText - The main function to initiate the extraction.
 * - ExtractSubjectsInput - The input type for the function.
 * - ExtractSubjectsOutput - The output type representing the structured list of subjects.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractSubjectsInputSchema = z.string().describe('A block of text describing daily study activities.');

const SubjectSchema = z.object({
  subject: z.string().describe("The name of the academic subject studied, e.g., 'ریاضی', 'فیزیک', 'زیست شناسی'."),
  duration: z.number().describe("The estimated duration of study for the subject in hours. If not specified, estimate based on the text."),
});

const ExtractSubjectsOutputSchema = z.object({
  subjects: z.array(SubjectSchema).describe('A list of subjects and the time spent on each.'),
});

export type ExtractSubjectsInput = z.infer<typeof ExtractSubjectsInputSchema>;
export type ExtractSubjectsOutput = z.infer<typeof ExtractSubjectsOutputSchema>;

export async function extractSubjectsFromText(
  input: ExtractSubjectsInput
): Promise<ExtractSubjectsOutput> {
  return extractSubjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractSubjectsPrompt',
  input: { schema: ExtractSubjectsInputSchema },
  output: { schema: ExtractSubjectsOutputSchema },
  prompt: `You are an expert at analyzing a student's daily report text and extracting the subjects they studied and for how long.
The text is in Persian.

Analyze the following text and identify all the academic subjects mentioned and estimate the duration in hours spent on each.

Example:
Text: "امروز ۲ ساعت ریاضی خواندم و بعد از ظهر هم کمی روی پروژه شیمی کار کردم که حدود ۱.۵ ساعت طول کشید. شب هم یک ساعت زبان انگلیسی مطالعه داشتم."
Output:
{
  "subjects": [
    { "subject": "ریاضی", "duration": 2 },
    { "subject": "شیمی", "duration": 1.5 },
    { "subject": "زبان انگلیسی", "duration": 1 }
  ]
}

If no duration is specified, make a reasonable estimation based on the context. If no subjects are mentioned, return an empty list.

Text to analyze:
{{{prompt}}}
`,
});


const extractSubjectsFlow = ai.defineFlow(
  {
    name: 'extractSubjectsFlow',
    inputSchema: ExtractSubjectsInputSchema,
    outputSchema: ExtractSubjectsOutputSchema,
  },
  async (text) => {
    if (!text.trim()) {
        return { subjects: [] };
    }
    const { output } = await prompt(text);
    return output!;
  }
);
