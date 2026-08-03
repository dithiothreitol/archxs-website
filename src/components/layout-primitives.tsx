import { cn } from "@/lib/utils";

/** Page-width container. One width for the whole site — drawings share a frame. */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/**
 * A section of the page, labelled like a sheet in a drawing set (A-03 …).
 * The label is decoration with a purpose: it tells the reader the page was
 * laid out by someone, in an order, for a reason.
 */
export function Section({
  children,
  sheet,
  label,
  className,
  id,
  bordered = true,
}: {
  children: React.ReactNode;
  sheet?: string;
  label?: string;
  className?: string;
  id?: string;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 sm:py-24",
        bordered && "border-t border-border",
        className,
      )}
    >
      <Container>
        {(sheet || label) && (
          <div className="mb-10 flex items-baseline gap-4">
            {sheet && <span className="sheet-label">{sheet}</span>}
            {label && (
              <>
                <span className="h-px flex-1 bg-border" />
                <span className="sheet-label">{label}</span>
              </>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

/** Standard page opener: kicker, title, and one paragraph that can stand alone. */
export function PageHeader({
  kicker,
  title,
  lead,
  meta,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  meta?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div className="blueprint-grid blueprint-grid-fade absolute inset-0 -z-10" />
      <Container className="py-16 sm:py-20">
        {kicker && <p className="sheet-label mb-5">{kicker}</p>}
        <h1 className="max-w-3xl text-balance text-4xl leading-[1.08] sm:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="measure mt-6 text-lg leading-relaxed text-muted-foreground">
            {lead}
          </p>
        )}
        {meta && <div className="mt-8">{meta}</div>}
      </Container>
    </header>
  );
}

/** Long-form typography for MDX bodies and legal pages. */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "measure text-[1.0625rem] leading-[1.75]",
        "[&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:leading-snug",
        "[&_h3]:mt-9 [&_h3]:text-lg [&_h3]:font-medium",
        "[&_p]:mt-5 [&_p]:text-foreground/90",
        "[&_ul]:mt-5 [&_ul]:space-y-2 [&_ul]:pl-0 [&_ol]:mt-5 [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_li]:relative [&_ul>li]:pl-5",
        // List markers as drafting ticks, not bullets
        "[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.7em] [&_ul>li]:before:h-px [&_ul>li]:before:w-2.5 [&_ul>li]:before:bg-redline/70",
        "[&_ol]:list-decimal [&_ol>li]:pl-1",
        "[&_strong]:font-medium [&_strong]:text-foreground",
        "[&_a]:underline [&_a]:decoration-redline/50 [&_a]:decoration-1 [&_a]:underline-offset-4 hover:[&_a]:decoration-redline",
        "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
        "[&_blockquote]:my-7 [&_blockquote]:border-l [&_blockquote]:border-redline/60 [&_blockquote]:pl-5 [&_blockquote]:text-muted-foreground",
        "[&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:border-b [&_th]:border-border [&_th]:pb-2 [&_th]:text-left [&_th]:font-mono [&_th]:text-[0.6875rem] [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-muted-foreground",
        "[&_td]:border-b [&_td]:border-border/60 [&_td]:py-2.5 [&_td]:pr-4 [&_td]:align-top",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Metric readout: mono value over a small caption, as on a drawing schedule. */
export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border pt-3">
      <p className="font-mono text-sm text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{label}</p>
    </div>
  );
}
