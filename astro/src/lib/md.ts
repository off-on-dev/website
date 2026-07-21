import { createMarkdownProcessor, type MarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

// Mirrors the site's existing pipeline: gfm + raw HTML passthrough + sanitize.
// Astro does NOT sanitize by default, so rehype-sanitize is mandatory here.
// Lazily instantiate one processor and reuse it for every field/entry.
let processorPromise: Promise<MarkdownProcessor> | null = null;

function getProcessor(): Promise<MarkdownProcessor> {
  processorPromise ??= createMarkdownProcessor({
    gfm: true,
    rehypePlugins: [rehypeRaw, rehypeSanitize],
  });
  return processorPromise;
}

export async function renderField(markdown: string): Promise<string> {
  const processor = await getProcessor();
  const { code } = await processor.render(markdown);
  return code;
}
