# Quiet Compass

Quiet Compass is a static-first, Astro-powered portfolio/business template built around calm wayfinding, editorial asymmetry, adaptive elemental themes, and restrained interaction.

The current implementation includes the full advanced systems layer described in the research blueprint: native page transitions, shared project continuity, dynamic compass orientation, animated route paths, command-palette search, URL-persistent filtering, MDX case studies, responsive AVIF/WebP media, installable PWA support, accessibility/performance test gates, and an AWS serverless production architecture.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run check
npm run build
```

## Main architecture

- Astro + TypeScript + semantic CSS
- MDX project content with validated schemas
- Pagefind static search
- Native View Transitions and progressive browser APIs
- Fine-pointer-only magnetic/tilt/cursor-preview interactions
- Reduced-motion art direction
- Responsive AVIF/WebP project imagery generated at build time
- Automatic Open Graph cards
- JSON-LD, canonicals and sitemap generation
- PWA manifest + service worker
- GitHub Actions CI/CD
- Playwright + axe + Lighthouse quality gates
- Optional AWS CDK production stack: private S3, CloudFront OAC, API Gateway, Lambda, SES, Route53/ACM

## Cloud configuration

Copy `.env.example` for front-end configuration. The contact form and privacy-conscious analytics become live when the CDK stack has been deployed and its API outputs are provided as:

```
PUBLIC_CONTACT_ENDPOINT=https://.../contact
PUBLIC_ANALYTICS_ENDPOINT=https://.../analytics
```

The AWS stack intentionally does **not** invent credentials, DNS ownership, email identities, or production addresses. SES must have a verified sender identity before contact email delivery can succeed.

## GitHub Pages

Settings → Pages → Source: **GitHub Actions**.

The Pages workflow installs dependencies, runs Astro checks, builds the static site, generates the Pagefind index, and publishes `dist/`.

## AWS production

See `infra/` for the CDK stack. Typical deployment:

```bash
cd infra
npm install
npx cdk bootstrap
npx cdk deploy \
  -c contactTo=hello@example.com \
  -c sesFrom=website@example.com \
  -c domainName=example.com \
  -c hostedZoneName=example.com
```

For PR preview URLs, set repository variables `AWS_ROLE_ARN`, `AWS_REGION`, `PREVIEW_BUCKET`, and `PREVIEW_BASE_URL`.

## Advanced systems

See [docs/ADVANCED_SYSTEMS.md](docs/ADVANCED_SYSTEMS.md) for the implementation map covering all 70 requested techniques.

## License

MIT — see LICENSE.
