import { PRICES, TRIAL, formatUsd } from "@/lib/billing/plans";

/**
 * Pre-purchase disclosure required before collecting payment details
 * (study §6.1): no charge today, the exact date and amount of the first
 * charge, and how to cancel. Kept here so the wording cannot drift between
 * the pricing page and the paywall.
 */
export function trialDisclosure(now = new Date()): string {
  const chargeDate = new Date(now);
  chargeDate.setDate(chargeDate.getDate() + TRIAL.days);
  const formatted = chargeDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const unlimited = formatUsd(PRICES.unlimited.monthly.amount);
  const pro = formatUsd(PRICES.pro.monthly.amount);

  return `Hoy no se te cobra nada. El ${formatted}, al terminar los ${TRIAL.days} días de prueba, se te cobrarán ${unlimited}/mes salvo que canceles antes. Puedes cancelar o cambiar a Pro (${pro}/mes) en dos clics desde tu cuenta.`;
}
