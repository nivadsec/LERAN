'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-academic-plan.ts';
import '@/ai/flows/ai-self-assessment.ts';
import '@/ai/flows/extract-subjects-from-text.ts';
import '@/ai/flows/lernova-advisor.ts';
import '@/ai/flows/support-bot.ts';
import '@/ai/flows/student-performance-analyzer.ts';
import '@/ai/flows/daily-report-analyzer.ts';
