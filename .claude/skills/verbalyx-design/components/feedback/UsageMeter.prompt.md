`UsageMeter` is the balance in the /app header. One per page, left of the nav links.

```jsx
<UsageMeter plan="free" used={280} limit={500} resetsIn="5 h" />
<UsageMeter plan="pro" used={12400} limit={60000} renewsOn="14 de octubre" topup={25000} />
<UsageMeter plan="trial" trialEndsOn="26 de septiembre" trialAmount="29,99 US$" />
<UsageMeter plan="unlimited" />
<UsageMeter plan="free" used={500} limit={500} compact />   // mobile
```

Rules
- The trigger is a `<button>`: hover and focus open the tooltip on desktop, tap toggles it on mobile.
- Only `sm` buttons, never the filled brand variant — the tool's run button is the page's one primary.
- «Se recargan en…» is time remaining, not a clock time: the daily key rolls over at 00:00 UTC.
- Ilimitado shows no bar. Its 500.000 soft cap is abuse control, not something to show.
