"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * Static hosting means no server of our own, so submissions go to a form
 * relay. Without a configured key the component says so plainly and falls back
 * to email — it never pretends to have sent something.
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export function ContactForm() {
  const t = useTranslations("pages.contact.form");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  if (!ACCESS_KEY) {
    return (
      <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
        {t("fallback")}
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const data = new FormData(event.currentTarget);
    data.append("access_key", ACCESS_KEY as string);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      setState(res.ok ? "sent" : "error");
      if (res.ok) event.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="border-t border-redline/60 pt-4 text-sm leading-relaxed">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot — bots fill it, people never see it. */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="sheet-label">
            {t("name")}
          </Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="sheet-label">
            {t("email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="org" className="sheet-label">
          {t("org")}
        </Label>
        <Input id="org" name="organisation" autoComplete="organization" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="sheet-label">
          {t("message")}
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={state === "sending"} className="rounded-none">
          {state === "sending" ? t("sending") : t("submit")}
        </Button>
        {state === "error" && (
          <p className="text-sm text-destructive">
            {t("error")}{" "}
            <a href={`mailto:${SITE_CONFIG.email}`} className="underline">
              {SITE_CONFIG.email}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
