# Human acceptance: do not pre-check these boxes

Automated gates and the actual report are produced by CI. The following evidence must be collected separately before declaring the upgrade 9+/10 or WCAG-conformant.

## Device and input matrix

- [ ] Physical iPhone Safari: homepage → Menu → Work → Atlas → comparison → Contact.
- [ ] Physical iPhone VoiceOver: same journey; names, order, form errors, status and focus intelligible.
- [ ] Desktop keyboard and VoiceOver or NVDA: all destinations and stateful controls operable.
- [ ] 200% text resize and 400% browser zoom; 320 CSS px reflow without unintended two-axis scrolling.
- [ ] Portrait widths 320, 360, 375, 390, 393, 430; 844×390 landscape; tablet 768/820/1024; desktop 1280/1440/1480/1920.
- [ ] Light/dark, system-theme change, reduced-motion change, forced colors, offline return and online recovery.
- [ ] Focus not covered by sticky header/menu/dialog; comfortable custom targets; native comparison alternatives.
- [ ] Slow network and script/search failure still allow reading/navigation.

## Human rounds

Round 1: representative visitors, no coaching. Ask what the site does, who it is for, find a fitting project, explain its change, find the person/practice, and prepare/send an inquiry as configured. Record task outcomes, repeated hesitation, and observed errors; do not invent participants or percentages.

Revise repeated confusion. Round 2 uses fresh participants. For first impression, briefly show the opening, hide it, and ask what it offers and what action is available. For delight, ask what was memorable, unnecessary, and worth showing someone else. A font preference alone is not proof of useful interaction.

## Publication and service evidence

- [ ] Final PR checks passed without suppressed failures; screenshots reviewed.
- [ ] Production release.json.sha equals the merge SHA, every emitted route/asset works, smoke suite passes.
- [ ] A real authorized inquiry is accepted and received by the configured recipient; no false delivery claim based on mocks.
- [ ] Retention, privacy, actual service offerings and About identity approved by owner.
- [ ] Enough field data collected: analyze p75 separately for mobile/desktop. Good boundaries LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; internal aims 2.0s/150ms/0.05. Lab results do not prove these percentiles.

References: https://www.w3.org/TR/WCAG22/ , https://web.dev/articles/vitals , https://playwright.dev/docs/test-accessibility
