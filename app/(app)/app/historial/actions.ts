"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/server";
import { deleteDocument } from "@/lib/documents/store";

/** Deletes one saved document. Scoped to the caller: an id is not a right. */
export async function removeDocument(id: string) {
  const user = await getSession();
  if (!user) return;
  await deleteDocument(id, user.id);
  revalidatePath("/app/historial");
}
