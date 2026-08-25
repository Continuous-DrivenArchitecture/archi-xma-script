# Security Policy

## Supported versions

Only the latest GitHub Release is supported with security fixes (this
repository does not publish to npm — see README.md). Patch releases are cut
automatically from `main` (see CONTRIBUTING.md) — keep the downloaded
`archi-xma-script.bundle.cjs`/`convert-to-xma.ajs` pair updated to the
latest release to receive fixes promptly.

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Report it privately using GitHub's Private Vulnerability Reporting for this
repository: open the repository's **Security** tab → **Advisories** →
**Report a vulnerability**. This is a GitHub platform feature that does not
require a separate contact address.

When filing a report, include:

- the affected release version and how it was obtained;
- a minimal reproduction;
- the impact you observed or suspect.

## What happens next

1. The maintainer acknowledges the report and triages it.
2. A fix is prepared and released as a patch version through the normal,
   automated release pipeline (see CONTRIBUTING.md).
3. The fix ships with release notes referencing the issue; a GitHub Security
   Advisory is published once the fix is available, and the issue is
   disclosed publicly only after coordination with the reporter.
