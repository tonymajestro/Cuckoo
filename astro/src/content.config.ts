import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

const games = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/games" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      dateString: z.string(),
      winners: z.array(z.string()),
      images: z.array(image()),
    }),
});

export const collections = { games };
