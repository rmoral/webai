`LimitNotice` sits inside the editor card, between the panels and the action row. Render one at a time.

```jsx
<LimitNotice kind="overflow" submitted={923} ceiling={300} />
<LimitNotice kind="partial" plan="anonymous" submitted={280} remaining={200} />
<LimitNotice kind="exhausted" plan="free" dailyLimit={500} resetsIn="5 h" />
<LimitNotice kind="detector" plan="free" submitted={280} remaining={200} />
```

Which kind to render (`processable = min(words, ceiling, remaining)`):
1. `remaining === 0` → `exhausted`
2. tool is `detect` and `remaining < min(words, ceiling)` → `detector`
3. `remaining < min(words, ceiling)` → `partial`
4. `words > ceiling` → `overflow`
5. otherwise nothing

Dim from word `processable + 1` in the input mirror (except for `detector` and `exhausted`, where nothing runs and nothing is dimmed). Pair it with `RunCost` next to the button.
