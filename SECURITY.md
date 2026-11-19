# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
| < 1.0   | No        |

Security fixes are released for the latest 1.x minor version. Please upgrade to the newest release before reporting.

## Reporting a vulnerability

Please do not open a public issue, discussion or pull request for a security problem.

Report it privately in one of two ways:

- **GitHub (preferred):** go to the repository's **Security** tab and choose **Report a vulnerability**.
- **Email:** tech@radianzz.com

Include:

- the affected version,
- a description of the issue and its impact,
- steps or a minimal config to reproduce it.

We aim to acknowledge reports within 5 business days and to keep you updated until a fix is released. Once a fix is published, we will credit you in the release notes unless you prefer to stay anonymous.

## Scope

Areas of particular interest:

- HTML sanitization of post content (TipTap JSON to HTML, `sanitize-html` allowlist),
- injection through JSON-LD, metadata or Open Graph image generation,
- URL handling in share links, redirects and image sources.

Vulnerabilities in a host site's own content API or deployment are out of scope unless the package causes them.
