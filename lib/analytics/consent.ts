// What the visitor allowed, and how Google is told about it.
//
// Two purposes, because the cookie policy names two: analytics (PostHog,
// and GA4 once it is consented to) and advertising (Google). Everything
// strictly necessary -- the session cookie, the interface preferences --
// is outside this: it is what makes the service work, and asking about it
// would be asking a question with one answer.
//
// Consent Mode v2 is four signals rather than two. A banner that only
// moves `analytics_storage` and `ad_storage` is a v1 implementation: it
// passes a casual look and Google still withholds remarketing and
// conversion measurement in the EEA. The mapping below is the whole
// difference, so it is written once and read by both the runtime and the
// script that runs before it.

declare global {
  interface Window {
    /** Defined by CONSENT_BOOTSTRAP, before anything Google loads. */
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const CONSENT_KEY = "vbx:consent";

/**
 * Bumped when the purposes change.
 *
 * A stored answer to a different question is not an answer. Raising this
 * makes every visitor be asked again, which is the point.
 */
export const CONSENT_VERSION = 1;

export interface Consent {
  analytics: boolean;
  ads: boolean;
}

export const DENIED: Consent = { analytics: false, ads: false };
export const GRANTED: Consent = { analytics: true, ads: true };

/** Which Google signals each purpose governs. The one source for both. */
const SIGNALS: Record<keyof Consent, readonly string[]> = {
  analytics: ["analytics_storage"],
  ads: ["ad_storage", "ad_user_data", "ad_personalization"],
};

export function consentSignals(consent: Consent): Record<string, string> {
  const out: Record<string, string> = {};
  for (const purpose of Object.keys(SIGNALS) as (keyof Consent)[]) {
    for (const signal of SIGNALS[purpose]) {
      out[signal] = consent[purpose] ? "granted" : "denied";
    }
  }
  return out;
}

export function readConsent(): Consent | null {
  try {
    const stored = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null");
    if (!stored || stored.v !== CONSENT_VERSION) return null;
    return { analytics: !!stored.analytics, ads: !!stored.ads };
  } catch {
    // Private mode, or storage denied. No stored answer means we ask.
    return null;
  }
}

export function writeConsent(consent: Consent): void {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ v: CONSENT_VERSION, ...consent, at: Date.now() }),
    );
  } catch {
    // The choice still applies to this visit; it just will not be
    // remembered. Failing here would take the page down over a banner.
  }
}

/**
 * The script that has to run before Google's tag does.
 *
 * Consent Mode's contract is that the defaults are declared *before* the
 * tag loads. Set afterwards, the first hit of every visit goes out under
 * whatever Google assumes, which in the EEA is the hit that matters.
 *
 * It reads the stored answer itself rather than waiting for React: a
 * returning visitor who already said yes must not spend the first render
 * of every page being counted as a refusal.
 *
 * Denied does not mean silent. The tag still sends cookieless pings, which
 * is what lets Google model the conversions it is not allowed to observe --
 * and that modelling is the reason to implement v2 rather than simply
 * withholding the tag until someone clicks.
 */
export const CONSENT_BOOTSTRAP = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
window.gtag=gtag;
var c={analytics:false,ads:false};
try{
  var s=JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_KEY)})||'null');
  if(s&&s.v===${CONSENT_VERSION}){c.analytics=!!s.analytics;c.ads=!!s.ads}
}catch(e){}
gtag('consent','default',Object.assign(
  ${JSON.stringify(consentSignals(DENIED))},
  {functionality_storage:'granted',security_storage:'granted'},
  ${JSON.stringify(SIGNALS)}.analytics.reduce(function(a,k){a[k]=c.analytics?'granted':'denied';return a},{}),
  ${JSON.stringify(SIGNALS)}.ads.reduce(function(a,k){a[k]=c.ads?'granted':'denied';return a},{})
));
`.trim();
