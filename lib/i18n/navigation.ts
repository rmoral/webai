import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Locale-aware replacements for next/link and next/navigation. Importing
// these instead of the Next originals is what keeps every href on the
// localised path: <Link href="/detect"> renders /detector-de-ia in Spanish
// and /en/ai-detector in English, from the one table in routing.ts.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
