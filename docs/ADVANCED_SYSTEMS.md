# Quiet Compass Advanced Systems

This branch implements the full 70-item advanced brief as one layered system. The rule is still: **experimentation behaves like punctuation**.

## Signature systems

1. Shared-element page transitions using native cross-document View Transitions and unique project title/media identities.
2. Dynamic compass orientation driven by visible route sections.
3. Animated SVG routes with reduced-motion fallbacks.
4. Case-study storytelling with route timelines, before/after comparison, system maps and outcome signals.
5. Adaptive Water / Wood / Earth / Metal / Fire section environments.
6. Command palette plus Pagefind static search.
7. URL-persistent project filtering and remembered intent preferences.
8. Semantic microinteractions: directional arrows, magnetic CTAs, restrained tilt, route activation, contextual cursor previews.

## Complete capability map

| # | Technique | Implementation |
|---|---|---|
|1|Scroll-driven storytelling|IntersectionObserver section state plus CSS view-timeline typography/route animation|
|2|Semantic micro-animations|Arrow travel, route activation, magnetic CTA, card settlement|
|3|View Transitions API|Cross-document `@view-transition`|
|4|Shared-element transitions|Unique `project-title-*` and `project-media-*` names|
|5|Dynamic route/compass|Section bearing data drives compass needle|
|6|Animated SVG paths|Dash-progress routes with reduced-motion completion|
|7|Variable typography|Fraunces Variable + Inter Variable|
|8|Kinetic typography|Hero and scroll-word axis/spacing motion|
|9|Fluid responsive layout|clamp(), intrinsic sizing, CSS Grid|
|10|Container queries|Project-card typography/layout responds to component width|
|11|Bento layouts|Capabilities, journal and evidence modules|
|12|Intentional asymmetry|Offset project cards and editorial grid variants|
|13|Magnetic interactions|Fine-pointer CTAs only|
|14|Cursor-aware previews|Fine-pointer contextual preview surface|
|15|3D perspective cards|Fine-pointer micro-tilt|
|16|Depth without heavy 3D|Layering, masks, shadow, perspective|
|17|WebGL/Three.js|Lazy feature-flagged compass ring|
|18|Procedural graphics|Build-generated project landscapes|
|19|CSS masks/clipping|Project/media and before-after clipping|
|20|Adaptive elemental theme|Root section element state|
|21|Automatic light/dark|System mode + persisted explicit override|
|22|Ambient UI|Element-driven ambient orb and tokens|
|23|Command palette|Accessible native dialog, ⌘K/Ctrl+K|
|24|Intelligent search|Pagefind static index|
|25|Progressive filtering|Service filters|
|26|URL-persistent filtering|Query-string state + local preference memory|
|27|Case-study timelines|Discover → Define → Design → Deliver → Outcome|
|28|Before/after|Range-controlled comparison with text fallback|
|29|Interactive diagrams|Keyboard-operable node controls + live description|
|30|Data visualization|Accessible outcome signal bars + text value|
|31|Personalized paths|Explicit intent selection reorders recommendations|
|32|Context-sensitive CTAs|Frontmatter CTA per project|
|33|Local preference memory|theme, intent, filters|
|34|Progressive enhancement|Semantic MPA first; JS layers on|
|35|IntersectionObserver activation|Reveals, route state, WebGL lazy start|
|36|Partial hydration/islands|Astro static output; only progressive client script runs|
|37|Predictive prefetch|Pointer/focus prefetch + speculation rules|
|38|Responsive AVIF/WebP|Sharp-generated 640/1280 images + picture/srcset|
|39|Blur-up/LQIP|Inline SVG placeholder behind project media|
|40|content-visibility|Deferred long case-study regions|
|41|Service worker caching|Static shell/runtime cache|
|42|Installable PWA|Manifest, icon, service worker|
|43|Skeleton states|Search loading skeleton|
|44|Optimistic UI|Immediate theme/filter/intent state|
|45|Reduced-motion mode|Static completed routes, no tilt/magnetic/cursor preview|
|46|Keyboard-first|Native controls/dialogs/range/filters|
|47|Focus management|Modal focus, Escape, focus restoration|
|48|ARIA live feedback|Search/filter/form/diagram statuses|
|49|Contact backend|Real JSON POST client|
|50|API Gateway + Lambda|CDK HTTP API + Lambda|
|51|Serverless email|SES SendEmail from Lambda|
|52|Spam/rate limits|Honeypot, validation, link heuristic, timing, API throttles|
|53|Headless CMS|Optional build-time JSON feed via `CMS_FEED_URL`|
|54|Git-based CMS|MDX projects in Git|
|55|MDX case studies|Astro MDX project entries|
|56|Structured schemas|Astro content collection validation|
|57|Automatic OG cards|Sharp-generated per-route PNGs|
|58|JSON-LD|WebSite + project BreadcrumbList|
|59|Sitemap/canonicals|Astro sitemap + canonical metadata|
|60|Privacy analytics|Optional first-party endpoint, no names/emails/message content|
|61|Core Web Vitals|web-vitals CLS/INP/LCP reporting|
|62|Lighthouse automation|Lighthouse CI budgets|
|63|Accessibility automation|Playwright + axe|
|64|Visual regression|Playwright screenshot artifacts + optional committed baselines|
|65|GitHub Actions CI/CD|Build/check/test/deploy workflows|
|66|Preview deployments|Optional AWS PR-prefix previews|
|67|CloudFront CDN|CDK distribution|
|68|Private S3 + OAC|Blocked public bucket + CloudFront OAC origin|
|69|Infrastructure as Code|AWS CDK stack for hosting/API/DNS/cert|
|70|Feature flags|Environment-controlled WebGL and endpoint configuration|

## Credentials/configuration that must be supplied

The repository intentionally does not invent AWS credentials, SES identities, DNS ownership or production email addresses. To activate cloud features, configure the CDK context values and GitHub repository variables documented in `.env.example` and the infrastructure README. SES sender verification is required before production email can succeed.
