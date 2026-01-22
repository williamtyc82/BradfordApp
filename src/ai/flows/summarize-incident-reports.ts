'use server';
/**
 * @fileOverview An AI agent that summarizes incident reports.
 *
 * - summarizeIncidentReport - A function that handles the summarization of incident reports.
 * - SummarizeIncidentReportInput - The input type for the summarizeIncidentReport function.
 * - SummarizeIncidentReportOutput - The return type for the summarizeIncidentReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentReportInputSchema = z.object({
  incidentReport: z.string().describe('The incident report to summarize.'),
});
export type SummarizeIncidentReportInput = z.infer<typeof SummarizeIncidentReportInputSchema>;

const SummarizeIncidentReportOutputSchema = z.object({
  summary: z.string().describe('A short summary of the incident report.'),
});
export type SummarizeIncidentReportOutput = z.infer<typeof SummarizeIncidentReportOutputSchema>;

export async function summarizeIncidentReport(input: SummarizeIncidentReportInput): Promise<SummarizeIncidentReportOutput> {
  return summarizeIncidentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncidentReportPrompt',
  input: {schema: SummarizeIncidentReportInputSchema},
  output: {schema: SummarizeIncidentReportOutputSchema},
  prompt: `You are an expert summarizer of incident reports.

  Please provide a concise summary of the following incident report:

  {{incidentReport}}`,
});

const summarizeIncidentReportFlow = ai.defineFlow(
  {
    name: 'summarizeIncidentReportFlow',
    inputSchema: SummarizeIncidentReportInputSchema,
    outputSchema: SummarizeIncidentReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
