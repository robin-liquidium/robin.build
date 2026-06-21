"use client";

import { cn } from "@/lib/utils";

interface ImageViewerAppProps {
  className?: string;
  fileName: string;
  src: string;
}

export default function ImageViewerApp({
  className,
  fileName,
  src,
}: ImageViewerAppProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="border-b border-border/80 px-2.5 py-1.5 text-xs font-medium md:px-3 md:py-2 md:text-sm">
        {fileName}
      </div>
      <div className="grid flex-1 place-items-center overflow-auto p-2 md:p-3">
        <img
          src={src}
          alt={fileName}
          className="max-w-full h-auto rounded-md border border-border/70 shadow-sm"
        />
      </div>
    </div>
  );
}
