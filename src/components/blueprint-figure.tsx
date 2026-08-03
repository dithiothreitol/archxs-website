import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Frames an illustration the way a drawing sheet frames a figure: registration
 * marks in the corners, a mono caption underneath, a faint grid behind. Also
 * degrades honestly — with no `src` it renders the empty frame, so a missing
 * generated asset never collapses the layout.
 */
export function BlueprintFigure({
  src,
  alt,
  caption,
  figureNo,
  priority = false,
  className,
  aspect = "aspect-[16/10]",
  sizes,
}: {
  src?: string;
  alt: string;
  caption?: string;
  figureNo?: string;
  priority?: boolean;
  className?: string;
  aspect?: string;
  sizes?: string;
}) {
  return (
    <figure className={cn("group", className)}>
      <div
        className={cn(
          "reg-marks relative overflow-hidden border border-border bg-muted/40",
          aspect,
        )}
      >
        <div className="blueprint-grid absolute inset-0 opacity-70" />
        {src && (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes ?? "(max-width: 768px) 100vw, 640px"}
            // Light: multiply drops the illustration's paper onto ours.
            // Dark: invert + hue-rotate turns the same drawing into a true
            // blueprint negative instead of a glaring white rectangle.
            className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.015] dark:mix-blend-normal dark:opacity-95 dark:invert dark:hue-rotate-180"
          />
        )}
        {/* Paper-side vignette: unifies generated art with the page ground. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent" />
      </div>
      {(caption || figureNo) && (
        <figcaption className="mt-3 flex gap-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
          {figureNo && <span className="text-redline/80">{figureNo}</span>}
          {caption && <span className="flex-1">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
