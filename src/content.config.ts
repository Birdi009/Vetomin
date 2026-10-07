import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    description: z.string(),
    year: z.number(),
    services: z.array(z.string()),
    industry: z.string(),
    outcome: z.string(),
    projectType: z.string(),
    element: z.enum(['water','wood','earth','metal','fire']),
    route: z.string(),
    role: z.string(),
    timeframe: z.string(),
    metric: z.string(),
    metricLabel: z.string(),
    cta: z.string(),
    order: z.number()
  })
});
export const collections = { projects };