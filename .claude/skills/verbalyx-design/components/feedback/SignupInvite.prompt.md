`SignupInvite` goes directly under the editor card, after an anonymous result has been delivered.

```jsx
<SignupInvite anonDaily={300} freeDaily={500} onSignup={…} onDismiss={…} />
<SignupInvite dismissed />
```

- Only one secondary-weight CTA (`soft`). The page already has its primary: the tool button.
- Never render it next to `QuotaPaywall`, the quota `UpsellBanner` or a `LimitNotice` of kind `exhausted`: those already make the same offer.
- Events: `wall_shown` with `{ variant: "inline", reason: "invite" }`, then `wall_dismissed` with `method: "x"` or `"cta"`.
