import { getTranslations } from "next-intl/server";

import { Container, PageHeader } from "@/components/layout-primitives";

type Section = { heading: string; body: string };

export async function LegalPage({
  locale,
  namespace,
}: {
  locale: string;
  namespace: "pages.privacy" | "pages.terms";
}) {
  const t = await getTranslations({ locale, namespace });
  const sections = t.raw("sections") as Section[];

  return (
    <>
      <PageHeader kicker={t("updated")} title={t("title")} />
      <Container className="py-16 sm:py-20">
        <div className="measure space-y-12">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-medium">{s.heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
