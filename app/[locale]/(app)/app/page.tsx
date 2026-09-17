import { getTranslations } from "next-intl/server";

import { ToolEditor } from "@/components/tools/tool-editor";
import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { requireSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";

// The signed-in area is the editor. Which tool it runs comes from the tab
// strip in the layout; the card grid it replaced said nothing the tabs don't.
export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const t = await getTranslations();
  const user = await requireSession();

  const requested = (await searchParams).tool;
  const tool: ToolId =
    requested && requested in TOOLS && TOOLS[requested as ToolId].live
      ? (requested as ToolId)
      : "humanize";

  const subscriber = await getSubscriber(user.id).catch(() => null);

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t(`tools.${tool}.name`)}
      </h1>
      {subscriber && subscriber.topupWords > 0 && (
        <p className="text-muted-foreground mt-1 text-sm">
          {t("app.topup", { words: subscriber.topupWords })}
        </p>
      )}
      <div className="mt-6">
        <ToolEditor tool={tool} plan={subscriber?.plan.id} />
      </div>
    </main>
  );
}
