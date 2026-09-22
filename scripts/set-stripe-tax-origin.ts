import "dotenv/config";
import Stripe from "stripe";

// Sets the head office address Stripe Tax calculates from.
//
// It is not the business address of the account profile: it lives on the
// tax.settings object, separately per mode, and a sandbox starts without
// one. Until it is set, every subscription created with
// `automatic_tax: { enabled: true }` is refused outright -- the checkout
// fails with a 500 and the customer sees a generic apology.
//
// Usage: pnpm stripe:tax-origin   (or the "Set Stripe tax origin" GitHub
// Action, which is the way in from a phone)
//
// The address comes from TAX_* if given, otherwise from the account's own
// profile, which is where it usually already is.

type Address = Stripe.AddressParam;

function fromEnv(): Address | null {
  const {
    TAX_COUNTRY,
    TAX_LINE1,
    TAX_LINE2,
    TAX_CITY,
    TAX_POSTAL_CODE,
    TAX_STATE,
  } = process.env;
  if (!TAX_COUNTRY) return null;
  return {
    country: TAX_COUNTRY,
    ...(TAX_LINE1 ? { line1: TAX_LINE1 } : {}),
    ...(TAX_LINE2 ? { line2: TAX_LINE2 } : {}),
    ...(TAX_CITY ? { city: TAX_CITY } : {}),
    ...(TAX_POSTAL_CODE ? { postal_code: TAX_POSTAL_CODE } : {}),
    ...(TAX_STATE ? { state: TAX_STATE } : {}),
  };
}

/** The address the account already carries, in the order Stripe fills them. */
function fromAccount(account: Stripe.Account): Address | null {
  const candidates = [
    account.company?.address,
    account.individual?.address,
    account.business_profile?.support_address,
  ];
  for (const address of candidates) {
    if (address?.country) {
      return Object.fromEntries(
        Object.entries(address).filter(([, v]) => v != null),
      ) as Address;
    }
  }
  return null;
}

/** Reads both the parameter shape and the one Stripe answers with. */
function describe(address: {
  line1?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
}): string {
  return [address.line1, address.postal_code, address.city, address.country]
    .filter(Boolean)
    .join(", ");
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  // Constructed here rather than at import: the SDK throws its own,
  // unhelpful error on an empty key before any message of ours is read.
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  const stripe = new Stripe(key);

  const before = await stripe.tax.settings.retrieve();
  const mode = before.livemode ? "live" : "test";
  console.log(`· modo: ${mode}`);
  console.log(`· estado de Stripe Tax: ${before.status}`);
  if (before.status_details.pending?.missing_fields?.length) {
    console.log(
      `  · falta: ${before.status_details.pending.missing_fields.join(", ")}`,
    );
  }

  // The account is only read when nothing was passed in: a key without
  // permission to read it should not stop an address given by hand.
  const given = fromEnv();
  const address = given ?? fromAccount(await stripe.accounts.retrieve(null));
  if (!address) {
    throw new Error(
      "No hay dirección: ni en TAX_COUNTRY/TAX_LINE1/… ni en el perfil de la cuenta. " +
        "Lanza la acción rellenando los campos de dirección.",
    );
  }
  console.log(
    `· dirección (${given ? "parámetros" : "perfil de la cuenta"}): ${describe(address)}`,
  );

  const after = await stripe.tax.settings.update({
    head_office: { address },
  });

  console.log(`\n· sede fiscal: ${describe(after.head_office?.address ?? {})}`);
  console.log(`· estado de Stripe Tax: ${after.status}`);
  if (after.status !== "active") {
    const missing = after.status_details.pending?.missing_fields ?? [];
    console.log(
      `  · sigue pendiente${missing.length ? `, falta: ${missing.join(", ")}` : ""}`,
    );
    return;
  }

  // Active only says the calculation will run. With no registration it
  // runs and returns zero, which looks identical to working.
  const registrations = await stripe.tax.registrations.list({
    status: "active",
    limit: 1,
  });
  if (registrations.data.length === 0) {
    console.log(
      "\nOjo: no hay ninguna 'registration' activa, así que Stripe calculará 0 de impuesto. " +
        "El cobro sale, pero sin IVA desglosado hasta que des de alta el país en Tax → Registrations.",
    );
    return;
  }

  console.log("\nListo. El cobro con automatic_tax ya puede calcularse.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
