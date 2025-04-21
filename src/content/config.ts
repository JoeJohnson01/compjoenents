import { defineCollection, z } from "astro:content";

const componentsCollection = defineCollection({
  type: "content",
  schema: z.object({
    // ───── Your existing fields ─────
    title: z.string(),
    description: z.string(),
    componentPath: z.string().optional(), // Made optional
    installCommand: z.string().optional(), // Made optional
    defaultProps: z.record(z.any()).default({}),
    language: z.enum(["astro", "react", "vue", "html"]),

    // ───── ShadCN registry additions ─────
    name: z.string().optional(), // unique slug - now optional
    type: z.string(), // e.g. "registry:component" or "registry:block"
    files: z.array(
      z.object({
        path: z.string(), // where the file lives in your repo
        type: z.string(), // registry file type
        target: z.string().optional(),
      })
    ),
    author: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    registryDependencies: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    tailwind: z.any().optional(),
    cssVars: z.any().optional(),
    css: z.any().optional(),
    meta: z.record(z.any()).optional(),
  }),
});

export const collections = {
  components: componentsCollection,
};
