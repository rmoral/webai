Use `ScoreGauge` wherever a tool returns a number the user will act on.

```jsx
<ScoreGauge value={72} />
<ScoreGauge value={31} label="Suena a IA en un 69%" />
```

Non-negotiable: **never drop the disclaimer.** The product's own FAQ says no service can guarantee a result against third-party detectors, so the gauge always reads as orientation, never as a verdict. Do not add a "pasa Turnitin" style claim.
