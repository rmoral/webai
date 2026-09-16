import * as Sentry from "@sentry/nextjs";
import { and, desc, eq } from "drizzle-orm";

import type { ToolId } from "@/lib/ai/tools";
import type { Plan } from "@/lib/billing/plans";
import { getDb } from "@/lib/db/client";
import { documents } from "@/lib/db/schema";
import { decryptText, encryptText } from "@/lib/security/crypto";

// Saved documents for the paid plans. Every piece of user text crosses
// encryptText on the way in and decryptText on the way out, so this module
// is the only place that touches the plaintext -- SECURITY.md requires the
// column never to hold it.
//
// Free and anonymous text is never written here at all: the gate is the
// plan's own `history` limit, not a check repeated at each call site.

/** Titles are shown in a list, so keep them short and single-line. */
function titleFrom(text: string): string {
  const line = text.trim().replace(/\s+/g, " ");
  return line.length > 70 ? `${line.slice(0, 69)}…` : line;
}

export interface SavedDocument {
  id: string;
  tool: ToolId;
  title: string;
  mode: string | null;
  createdAt: Date;
}

/**
 * Stores one result. Never throws: losing a history entry must not cost the
 * user the answer they already have on screen, and this runs after the
 * response has been streamed.
 */
export async function saveDocument(input: {
  userId: string;
  plan: Plan;
  tool: ToolId;
  mode?: string;
  inputText: string;
  outputText: string;
}): Promise<void> {
  if (!input.plan.limits.history) return;
  try {
    await getDb()
      .insert(documents)
      .values({
        userId: input.userId,
        tool: input.tool,
        title: encryptText(titleFrom(input.inputText)),
        inputText: encryptText(input.inputText),
        outputText: encryptText(input.outputText),
        mode: input.mode ?? null,
      });
  } catch (error) {
    Sentry.captureException(error);
  }
}

/** A title that cannot be read must not take the page down with it. */
function readTitle(stored: string | null): string {
  if (!stored) return "Sin título";
  try {
    return decryptText(stored);
  } catch {
    return "No se puede descifrar";
  }
}

export async function listDocuments(
  userId: string,
  limit = 50,
): Promise<SavedDocument[]> {
  const rows = await getDb()
    .select({
      id: documents.id,
      tool: documents.tool,
      title: documents.title,
      mode: documents.mode,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt))
    .limit(limit);

  return rows.map((row) => ({ ...row, title: readTitle(row.title) }));
}

/** Scoped by user id as well as document id: an id is not an authorisation. */
export async function getDocument(id: string, userId: string) {
  const [row] = await getDb()
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .limit(1);
  if (!row) return null;

  return {
    id: row.id,
    tool: row.tool,
    mode: row.mode,
    createdAt: row.createdAt,
    title: readTitle(row.title),
    inputText: decryptText(row.inputText),
    outputText: decryptText(row.outputText),
  };
}

export async function deleteDocument(id: string, userId: string) {
  await getDb()
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));
}
