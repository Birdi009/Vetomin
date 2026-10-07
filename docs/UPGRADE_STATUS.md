# Quiet Compass upgrade: implementation and evidence

This implementation follows the supplied upgrade plan. A code change is not a 9/10 certification. This document separates deliverables from external activation and human evidence.

## Implemented in the upgrade branch

- Central URL contract used by all primary pages, navigation, project links, media, search, manifest, service-worker registration and metadata. Builds test both `/` and `/Vetomin/`.
- Real card visibility filtering and visible results counts; query-state restoration.
- Visible content with missing JavaScript. Native mobile Menu works before enhancement; search remains supplemental.
- Responsive media sizing, controlled typography, no double hero padding, equal Method columns, short-landscape treatment and light/dark tokens.
- Local, explanatory project recommendations with shareable intent state.
- Original before/after concept interface reconstructions, named comparison states, keyboard range, textual alternatives and project-specific decision maps.
- Expanded concept narratives and design artifacts. The work is explicitly conceptual, not client evidence, real research, or business performance.
- Three dedicated journal essays and computed approximate reading durations.
- Clearer About and secondary Colophon; personal biography is deliberately not invented.
- Contact-field validation, busy state, timeout/error preservation, explicit unconfigured state, local draft/copy/text-save. Build injection for owner-supplied public contact/analytics endpoints.
- Optional, opt-in web-vitals sharing with DNT/GPC support and no inquiry fields or search strings.
- Scope/version-isolated service-worker caches, network-first HTML, fresh release marker, no inquiry/search caching.
- Build-time internal reference/fragment/media checks and size budgets; full browser smoke against the published URL with exact expected commit.
- Expanded Chromium/Pixel/WebKit journeys, light/dark Axe, viewport checks, JavaScript-off checks, offline recovery, search failure and interaction tests.
- Multiple Lighthouse samples with enforced thresholds, not a promise of field percentiles.

## Cannot honestly be marked complete by source changes

| Plan requirement | External input or evidence needed | Safe behavior until then |
|---|---|---|
| Live inquiry delivery | Existing or authorized AWS account, SES sender/recipient verification and actual ContactEndpoint; delivery test witnessed at recipient | Site openly states delivery is unavailable; draft remains local |
| Real-user performance | Configured AnalyticsEndpoint, opt-in visitors, sufficient samples and mobile/desktop p75 analysis | No field metrics or 9/10 performance grade claimed |
| Real client proof | Owner-approved real artifacts, consent to publish, sourced outcome measurements | Original concepts labeled as such throughout |
| Human About biography | Owner-approved name, public bio, actual offered services and any portrait | No invented team, personal credentials or client roster |
| Accessibility certification | Physical iPhone/VoiceOver, desktop AT, keyboard/zoom testing and recorded results | Implemented practices described without certification |
| 9+/10 in all subjective dimensions | Two rounds of representative-user/design evaluation | No fabricated score uplift or task-success results |

## Validation protocol

CI must pass on the final head before merge. Review screenshots and failures; do not raise thresholds or remove coverage merely to get green. Deployment must publish the same SHA and then pass the full live smoke suite. Test queries and contact submissions must never send real visitor information. Mocked service tests demonstrate client behavior, not mail delivery.

Record the real run URL, commit, browser results and Lighthouse samples in the PR. Existing findings are historical until rechecked against that artifact. Human checks remain unchecked until actually done.

## Release and rollback

Keep the existing GitHub Pages environment protections. Never disable approval, branch restrictions or test gates to force a release. If a new run waits, inspect the run/environment rather than applying unrelated CSS.

Rollback by reverting this upgrade merge through a PR, running the same gates, and deploying that revert. Do not force-push `master`. The worker version is stamped with the build SHA; verify returning-client navigation after rollback as well as first-load navigation.

Previous known release before this upgrade: a7e6d945aaf88472121e17eccdc7b45b73256205 (PR #5). That is a recovery reference, not a statement that it was defect-free.
