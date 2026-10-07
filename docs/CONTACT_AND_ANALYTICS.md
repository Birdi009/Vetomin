# Activate existing services without inventing configuration

The UI is safe with no endpoint: it explicitly offers a local draft, not a nonfunctional Send button. No credentials belong in PUBLIC variables or browser code.

## Live contact prerequisites

The existing infrastructure in `infra/` needs an owner-authorized AWS account and region. Confirm the real SES sender identity and recipient and the account's SES sending restrictions. Domain verification and production access are external facts: do not assume them. CDK deployment may incur charges and must use the actual authorized account. Do not replace missing values with sample addresses or fabricated ARNs.

After an authorized infrastructure deployment, take the actual `ContactEndpoint` output. In repository Actions variables, set `PUBLIC_CONTACT_ENDPOINT` to that public HTTPS URL. Pages now injects that variable into its build. To require operational configuration before publishing, set `REQUIRE_LIVE_CONTACT=true`; a missing endpoint then fails the build. An endpoint present is not proof of delivery: submit an explicitly authorized test and confirm it reaches the recipient. This step is not performed by production smoke tests.

Set ALLOWED_ORIGIN to the real browser origin (for current Pages, https://birdi009.github.io, no /Vetomin path). Keep server validation and SES permission bounds. On service errors, the browser preserves text and offers save/copy. A response means service acceptance, not proof that a human read the message.

## Optional performance telemetry

Use the actual `AnalyticsEndpoint` output as `PUBLIC_ANALYTICS_ENDPOINT`. The browser does not send until the visitor opts in on Privacy & accessibility; DNT/GPC suppress it. No names, emails, inquiry contents, or search strings belong in analytics. Paths exclude query strings. The static host may have its own request logging, which this code does not control.

Collect LCP, INP and CLS with page path and device class, then evaluate mobile and desktop p75 only after enough representative traffic exists. Internal targets are goals, not current measured results. Retention and access policy need owner review before collection starts.

No AWS deployment, identity verification, credentials, domain ownership, or successful live mail delivery is claimed by this repository change.
