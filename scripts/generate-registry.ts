#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";

// Define the shape of files in the registry
interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

// Define frontmatter keys expected in each MDX/MD file
interface Frontmatter {
  name: string;
  type: string;
  title: string;
  description: string;
  author?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  categories?: string[];
  docs?: string;
  installCommand: string;
  defaultProps: Record<string, any>;
  language: "astro" | "react" | "vue" | "html";
  files: RegistryFile[];
  tailwind?: any;
  cssVars?: any;
  css?: any;
  meta?: Record<string, any>;
}

async function generateRegistry() {
  // 1. Find all MDX/MD entries
  const entries = await fg("src/content/components/*.{md,mdx}", {
    absolute: true,
  });

  // 2. Parse frontmatter and build registry items
  const items = entries.map((file) => {
    const raw = fs.readFileSync(file, "utf-8");
    const { data } = matter(raw);
    const fm = data as Frontmatter;

    // Extract name from file name (without .mdx extension)
    const fileName = path.basename(file);
    const name = fileName.replace(/\.(md|mdx)$/, "");

    // Default author
    const author = fm.author || "Joe Johnson <01johnson.joe@gmail.com>";

    // Generate install command based on name
    const installCommand = `npx shadcn@latest add https://www.compjoenents.com/r/${name}`;

    return {
      name: name, // Use the extracted name
      type: fm.type,
      title: fm.title,
      description: fm.description,
      author: author, // Use the default or provided author
      dependencies: fm.dependencies,
      registryDependencies: fm.registryDependencies,
      categories: fm.categories,
      docs: "www.compjoenents.com/r/" + name,
      installCommand: installCommand, // Use the generated install command
      defaultProps: fm.defaultProps,
      language: fm.language,
      files: fm.files,
      tailwind: fm.tailwind,
      cssVars: fm.cssVars,
      css: fm.css,
      meta: fm.meta,
    };
  });

  // 3. Wrap in ShadCN registry schema
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "compjoenents",
    homepage: "https://www.compjoenents.com",
    items,
  };

  // 4. Determine output path (project root)
  const outPath = path.join(process.cwd(), "registry.json");
  const outDir = path.dirname(outPath);

  // 5. Ensure directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 6. Write file (creates or overwrites)
  fs.writeFileSync(outPath, JSON.stringify(registry, null, 2), {
    encoding: "utf-8",
  });

  console.log(
    `✅ Generated registry.json at ${outPath} with ${items.length} items`
  );
}

generateRegistry().catch((err) => {
  console.error("❌ Failed to generate registry:", err);
  process.exit(1);
});
