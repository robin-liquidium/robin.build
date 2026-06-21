import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface DockProps {
  className?: string;
  items: DockItem[];
  compact?: boolean;
}

/** Describes one launchable action in the desktop dock. */
interface DockItem {
  icon: LucideIcon;
  label: string;
  ariaLabel?: string;
  onClick?: () => void;
}

interface DockIconButtonProps extends DockItem {
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

const floatingAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
    },
  },
};

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  ({ icon: Icon, label, ariaLabel, onClick, className, compact }, ref) => {
    return (
      <motion.button
        type="button"
        aria-label={ariaLabel ?? label}
        ref={ref}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          "relative group rounded-lg",
          compact ? "p-2" : "p-3",
          "hover:bg-secondary transition-colors",
          className,
        )}
      >
        <Icon
          className={cn("text-foreground", compact ? "h-5 w-5" : "h-5 w-5")}
        />
        <span
          className={cn(
            "absolute -top-8 left-1/2 -translate-x-1/2",
            "px-2 py-1 rounded text-xs",
            "bg-popover text-popover-foreground",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity whitespace-nowrap pointer-events-none",
          )}
        >
          {label}
        </span>
      </motion.button>
    );
  },
);
DockIconButton.displayName = "DockIconButton";

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className, compact = false }, ref) => {
    const outerH = compact ? "h-[4.5rem]" : "h-64";
    const innerH = compact ? "h-[4.5rem]" : "h-64";
    return (
      <div
        ref={ref}
        className={cn(
          "w-full flex items-center justify-center p-2",
          outerH,
          className,
        )}
      >
        <div
          className={cn(
            "w-full max-w-4xl rounded-2xl flex items-center justify-center relative",
            innerH,
          )}
        >
          <motion.div
            initial="initial"
            animate="animate"
            variants={floatingAnimation}
            className={cn(
              "flex items-center gap-1 p-2 rounded-2xl",
              "backdrop-blur-lg border shadow-lg",
              "bg-background/90 border-border",
              "hover:shadow-xl transition-shadow duration-300",
            )}
          >
            {items.map((item) => (
              <DockIconButton key={item.label} {...item} compact={compact} />
            ))}
          </motion.div>
        </div>
      </div>
    );
  },
);
Dock.displayName = "Dock";

export { Dock };
