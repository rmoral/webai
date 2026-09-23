"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";

import { UpsellBanner } from "@/components/billing/upsell-banner";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/events";
import { PLANS } from "@/lib/billing/plans";
import { Link } from "@/lib/i18n/navigation";
import type { ToolId } from "@/lib/ai/tools";

// D5 -- the one moment worth asking an anonymous reader for an account.
//
// Every other offer on these pages answers a refusal: a limit reached, a
// tool that is not theirs, an allowance spent. This one answers a result,
// which is the only time the reader has seen what the account is for. It
// is a card under the editor, never a modal over it, and it does not come
// back once it has been turned down.

/** Not session-scoped, unlike the walls: "no thanks" has to hold tomorrow. */
const DISMISSED = "vbx:invite:dismissed";
/** Counted once per browser session, however many runs it takes. */
const COUNTED = "vbx:invite:shown";

/**
 * Storage that may not be there.
 *
 * Private mode and blocked site data both make these throw on access, not
 * only on write. Every read answers "not remembered" and every write is
 * allowed to fail: the cost is showing the card once more, and the
 * alternative is taking the result down with an exception.
 */
function remembered(store: () => Storage, key: string): boolean {
  try {
    return store().getItem(key) === "1";
  } catch {
    return false;
  }
}

function remember(store: () => Storage, key: string): void {
  try {
    store().setItem(key, "1");
  } catch {
    // Nothing to do, and nothing worth failing for.
  }
}

const local = () => localStorage;
const session = () => sessionStorage;

export function SignupInvite({ tool, next }: { tool: ToolId; next: string }) {
  const t = useTranslations("invite");
  const format = useFormatter();
  const posthog = usePostHog();
  // Read after mount, never during the render: the server has no storage
  // to read, and a card that appears in one and not the other is a
  // hydration error on the page that ranks.
  const [state, setState] = useState<"hidden" | "open" | "dismissed">("hidden");

  useEffect(() => {
    if (remembered(local, DISMISSED)) return;
    setState("open");
    if (remembered(session, COUNTED)) return;
    remember(session, COUNTED);
    track(posthog, "wall_shown", {
      variant: "inline",
      reason: "invite",
      plan: "anonymous",
      tool,
    });
  }, [posthog, tool]);

  const closed = (method: "x" | "cta") =>
    track(posthog, "wall_dismissed", {
      variant: "inline",
      reason: "invite",
      plan: "anonymous",
      tool,
      method,
    });

  if (state === "hidden") return null;

  // Shown until the next run, which unmounts this: the reader gets told
  // where the offer went, once, and never again after that.
  if (state === "dismissed") {
    return (
      <p className="text-muted-foreground text-sm leading-normal">
        {t("dismissed")}
      </p>
    );
  }

  const n = (value: number) => format.number(value);

  return (
    <div data-testid="signup-invite">
      <UpsellBanner
        action={
          <span className="flex items-center gap-2">
            <Button size="sm" variant="soft" asChild>
              <Link
                href={{ pathname: "/signup", query: { next } }}
                onClick={() => closed("cta")}
              >
                {t("cta")}
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                remember(local, DISMISSED);
                closed("x");
                setState("dismissed");
              }}
            >
              {t("dismiss")}
            </Button>
          </span>
        }
      >
        <b className="font-semibold">
          {t("lead", { free: n(PLANS.free.limits.wordsPerDay ?? 0) })}
        </b>
        {t("leadTail", { anon: n(PLANS.anonymous.limits.wordsPerDay ?? 0) })}{" "}
        {t("body")}
      </UpsellBanner>
    </div>
  );
}
