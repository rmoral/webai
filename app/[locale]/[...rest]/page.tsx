import { notFound } from "next/navigation";

// A path that matches no route still has to land inside the [locale] tree,
// or Next answers with its own bare 404: a page with no header, no language
// and no way back. This catch-all is what routes an unknown URL into
// app/[locale]/not-found.tsx, in the language it was reached from.
export default function CatchAll() {
  notFound();
}
