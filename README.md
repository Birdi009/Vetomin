# Quiet Compass

An independent digital studio in development, presented through three original concept studies. This edition implements the supplied experience-upgrade plan without inventing clients, user-study results, a team biography or external service configuration.

## Run locally

Use Node 22 and Python 3. Run `npm install`, `npm run build`, then `npm run dev` or `npm run preview`. The build creates responsive AVIF/WebP interface artifacts, a Pagefind index, `release.json`, a scoped/versioned service worker and a correct sitemap reference.

Local hosting uses `/`. GitHub Pages explicitly builds at `/Vetomin/`. `PUBLIC_BASE_PATH` supports both; internal URLs must go through `src/lib/urls.mjs` / `withBase` from `src/lib/site.ts`.

## Quality gates

```
npm run test:unit
npm run check
npm run build
npm run audit:build
npx playwright install --with-deps chromium webkit
npm run test:a11y
npm run test:visual
npm run test:smoke
npx playwright test tests/service-worker.spec.ts --project=desktop
npm run lhci
cd infra && npm install && npm run build
```

The browser suite covers desktop Chromium, Pixel-profile Chromium and iPhone-profile WebKit. Tests crawl the generated URLs and responsive assets, verify actual image decoding, exercise complete visitor journeys, check filter visibility, search success/failure, keyboard focus, local recommendation, comparison, contact error recovery and no-JavaScript navigation. Reflow assertions cover 320–1920px including short landscape. Accessibility assertions fail on all Axe violations in both themes. Service-worker tests cover cache ownership, version changes and offline recovery; live browser tests exercise normal online/offline return.

Screenshot capture is review evidence, not automatically proof of visual quality. Optional `VISUAL_BASELINES=1` must only be used with human-reviewed baselines. No baseline is silently approved by a deployment.

## Content

Atlas has eight reproducible artifacts; Fieldnote and Threshold have four each. All are original vector interface studies with synthetic example content. Cases disclose assumptions, alternatives and unperformed research. Journal articles have dedicated routes and reading times computed from actual text. The About page can display a verified owner name/biography through the optional public variables; empty values do not create a fictional identity.

## Integrations

No credentials belong in frontend variables. Contact and analytics stay off when their public endpoints are blank. The contact page explains that status before someone fills the form and offers local copying/saving. Optional measurement requires explicit opt-in and respects DNT/GPC. It excludes form contents and search strings.

See [release and integration runbook](docs/RELEASE_RUNBOOK.md), [implementation status](docs/IMPLEMENTATION_STATUS.md) and [human validation protocol](docs/VALIDATION_PROTOCOL.md). AWS files are integration code, not evidence that infrastructure or SES identities have been provisioned. An inquiry is not end-to-end validated until an actual test reaches the authorized recipient.

## Release discipline

PR checks must pass at the final commit. The Pages workflow repeats build and browser gates before publishing, then verifies the actual deployment URL and exact release commit. A successful build alone is not a successful release. A green automated suite is not a 9/10 user-experience certificate.
