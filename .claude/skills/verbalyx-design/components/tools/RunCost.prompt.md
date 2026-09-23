`RunCost` goes in the editor's action row, right after the run button.

```jsx
<RunCost words={923} ceiling={300} remaining={200} />
<RunCost words={142} ceiling={300} remaining={358} />
<RunCost words={280} ceiling={300} remaining={200} detector />
<RunCost words={600} ceiling={3000} remaining={null} />   // balance unknown: omitted
```

Never guess `remaining`. In /app it comes from the layout's `peekWords`; on the static landings it stays `null` until the first response brings `x-words-remaining`.
