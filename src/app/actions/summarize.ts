"use server";

import { summarizeIncidentReport } from "@/ai/flows/summarize-incident-reports";
import { z } from "zod";

const schema = z.string();

export async function summarizeIncidentAction(incidentReport: string) {
    const validatedReport = schema.safeParse(incidentReport);

    if (!validatedReport.success) {
        return { error: "Invalid input" };
    }

    try {
        const result = await summarizeIncidentReport({ incidentReport: validatedReport.data });
        return { summary: result.summary };
    } catch (e) {
        console.error(e);
        return { error: "Failed to generate summary." };
    }
}
