import type { BlogPost } from "@/lib/blog";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <div className="space-y-6">
      {post.content.map((block, blockIndex) => {
        const blockKey = `${post.slug}-${block.type}-${blockIndex}`;

        if (block.type === "heading") {
          return (
            <h2
              className="mt-8 text-2xl font-semibold tracking-normal text-foreground"
              key={blockKey}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              className="list-disc space-y-2 pl-5 text-base leading-7 text-foreground/80"
              key={blockKey}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${blockKey}-item-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              className="overflow-x-auto rounded-md border border-border bg-muted/50 p-4 text-sm leading-6 text-foreground"
              key={blockKey}
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        return (
          <p className="text-base leading-7 text-foreground/80" key={blockKey}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
