import { cn } from "@/lib/utils";

// In-context upgrade offer. `quota` is the tone used once the allowance is
// spent; `brand` is the softer one shown before that.
export function UpsellBanner({
  tone = "brand",
  title,
  action,
  className,
  children,
}: {
  tone?: "brand" | "quota";
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-xl border px-6 py-4",
        tone === "quota"
          ? "border-danger-line bg-danger-soft"
          : "border-brand-line bg-brand-soft",
        className,
      )}
    >
      <p
        className={cn(
          "flex-1 basis-80 text-sm leading-normal",
          tone === "quota" ? "text-danger-ink" : "text-brand-ink",
        )}
      >
        {title && <b className="font-semibold">{title} </b>}
        {children}
      </p>
      {action}
    </div>
  );
}
