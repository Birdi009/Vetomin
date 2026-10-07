# Release and integration runbook

## Publish the static experience

1. Work on a branch; review the complete diff and final-head Quality gates, including the separate root-path build.
2. Inspect desktop/mobile/dark screenshots and generated concept artifacts. Capture is not approval; do not enable screenshot baselines without reviewing them.
3. Merge only after the final checks pass. Keep the existing Pages environment protection. Do not bypass protection by renaming environments or pushing unverified master changes.
4. Wait for build, deploy and Verify live experience to succeed. The last job uses the deploy-pages URL and compares `release.json.commit` to the expected SHA, then checks full routes, assets and journeys.
5. Confirm on a real iPhone. New/revisited tabs, portrait/landscape, Menu, projects, comparison, search, dark mode and brief controls all matter.
6. Record the run URL, exact commit, image review and remaining external/manual tests in the PR. Never report only a green build as a complete deployment.

## Enable real contact delivery

No credentials or identity values are supplied here. Use an AWS account and SES identities controlled by the owner, or an authorized endpoint implementing the documented request/response contract.

For the repository's AWS path: review the CDK changes and cost/permission implications; use existing authenticated AWS CLI credentials outside this repository; verify an allowed SES sender identity and the authorized recipient as required by the actual account/sandbox state. Use the correct region and inspect the identity ARN used in the contact function policy. A domain-verified sender may require a domain identity ARN rather than an individually verified mailbox. Do not assume either verification exists.

Deploy the reviewed stack only after approval. `domainName` and `hostedZoneName` are optional and must refer to actual controlled resources. CloudFront certificates require the appropriate region; do not create DNS records for a domain that is not controlled by the owner. `enableDashboard=true` opts into the optional CloudWatch dashboard and its costs.

Capture the actual `ContactEndpoint` output. In repository Settings → Secrets and variables → Actions → Variables, set `PUBLIC_CONTACT_ENDPOINT` to that HTTPS URL. Optionally set `PUBLIC_CONTACT_EMAIL` to an owner-approved public address. These values are embedded publicly; never use them for API credentials. The Pages build already reads these variables. Publish again through the normal gates.

Submit a clearly labeled, authorized test inquiry and verify receipt in the actual inbox. HTTP `ok:true` means SES accepted the message, not that the recipient received it. Record delivery evidence without retaining private message content in public artifacts. Keep no-server local brief fallback until this step is complete.

Server contract: JSON or URL-encoded POST; fields `name`, `email`, `project`, `timing`, `message`, optional honeypot `website`, optional `startedAt`. JSON success is HTTP200 `{ "ok": true, "message": "..." }`; invalid fields are HTTP400 with an errors map. Rate limits return429; unconfigured delivery503; unconfirmed email acceptance502. Native form requests receive readable HTML. Origin must match `ALLOWED_ORIGIN` exactly.

## Enable optional measurement

Set `PUBLIC_ANALYTICS_ENDPOINT` only to the reviewed endpoint. Events are off by default and only sent after opt-in, subject to DNT/GPC. Do not put sensitive data in event details. The backend discards unknown fields and paths. The optional CDK dashboard shows p75 and sample counts split by device; an empty or tiny sample is not field validation.

Engineering targets: p75 LCP≤2.0s, INP≤150ms, CLS≤0.05. External good thresholds are 2.5s/200ms/0.1. Lab medians gate performance≥90, accessibility100, SEO≥95, LCP≤2.5s and CLS≤0.1; aim higher, but do not confuse Lighthouse with field INP or representative visitor satisfaction.

## Roll back safely

Do not delete the live site or remove environment protections. Revert the upgrade merge through a reviewed PR, run the same compatible gates and republish. Keep the known-good commit recorded. For a server integration failure, blank its public endpoint variable and publish a new static release so the clear local-brief mode returns. Never roll back by exposing private credentials in browser code.

A service-worker build fingerprint changes with generated HTML. Confirm a new release is fetched online and the update notice does not discard a drafted inquiry. Offline-cache updates are limited to this application scope; other sites on the same GitHub Pages origin must not lose their caches.
