import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type DocumentPageProps = {
  title: string;
  eyebrow: string;
  updatedAt: string;
  children: ReactNode;
};

/** Renders a quiet legal/document page for personal utility routes. */
export function DocumentPage({
  title,
  eyebrow,
  updatedAt,
  children,
}: DocumentPageProps) {
  return (
    <main className="min-h-screen px-5 py-16 sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          robin.build
        </Link>
        <header className="mt-10 border-b pb-8">
          <p className="font-mono text-sm text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Last updated: {updatedAt}
          </p>
        </header>
        <div className="mt-10 space-y-5 text-base leading-7 text-muted-foreground [&_a]:text-foreground [&_h2]:pt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-normal [&_h2]:text-foreground [&_p]:max-w-2xl">
          {children}
        </div>
      </article>
    </main>
  );
}
