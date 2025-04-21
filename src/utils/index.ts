import { FlowDiagram } from "@/components/flow-diagram";

type ComponentsMap = {
  [key: string]: any;
};

export const components: ComponentsMap = {
  Flow: FlowDiagram,
  "flow-diagram": FlowDiagram,
};

export function getFilePathForLanguage(
  files: { path: string }[],
  language: string
): string | undefined {
  if (!files || !files.length) return undefined;

  // Map language to file extension
  const extensionMap: Record<string, string[]> = {
    react: [".tsx", ".jsx", ".js"],
    vue: [".vue"],
    astro: [".astro"],
    html: [".html"],
  };

  const extensions = extensionMap[language] || [];

  // Find the first file with a matching extension
  for (const extension of extensions) {
    const matchingFile = files.find((file) => file.path.endsWith(extension));
    if (matchingFile) return matchingFile.path;
  }

  // If no matching file found, return the first file path
  return files[0]?.path;
}
