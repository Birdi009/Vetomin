# AWS deployment: S3 + CloudFront

Recommended production route: private S3 origin → CloudFront with Origin Access Control (OAC). Keep S3 Block Public Access enabled.

1. Create an S3 bucket and upload the site files.
2. Create a CloudFront distribution with the S3 bucket as its origin.
3. Create/attach OAC and grant the distribution read access in the bucket policy.
4. Set `index.html` as the default root object.
5. For a custom domain, attach an ACM certificate and point Route 53/DNS to CloudFront.
6. Add billing alerts. AWS is metered infrastructure and is not guaranteed to remain free.

For GitHub Actions → AWS, prefer GitHub OIDC and short-lived AWS credentials over long-lived access keys.