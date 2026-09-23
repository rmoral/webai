---
name: verbalyx-design
description: Use this skill to generate well-branded interfaces and assets for Verbalyx, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for protoyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Implementing the September 2026 billing redesign

If the user asks you to implement the registration, paywall, pricing or payment flow in the `webai` repository, read `IMPLEMENTACION/README.md` first and follow the phases in order. `IMPLEMENTACION/07-COPY.md` holds every Spanish string verbatim — never write your own copy. Five rules are non-negotiable: the 3-day trial exists only on Unlimited monthly; payment happens inside the site with an embedded Stripe Payment Element, never a redirect; the AI detector never shows a percentage; legal disclosure is 14px in-flow on a tinted surface; and nothing may promise that text evades detectors.
