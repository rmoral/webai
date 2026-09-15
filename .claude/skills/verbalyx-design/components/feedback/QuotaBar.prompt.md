Use `QuotaBar` anywhere the user's daily limit matters — the app header area, the editor footer, the account page.

```jsx
<QuotaBar used={235} total={500} plan="Gratis" />
```

Pull `total` from `lib/billing/plans.ts`; never hardcode it. Pro has `wordsPerDay: null` — do not render a bar with a fake ceiling, show the words-used figure as plain text instead.
