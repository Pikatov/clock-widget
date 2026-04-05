# Security Policy

Clock Widget is a small local desktop app, so the security surface here is fairly limited.

The app does not require an account, does not talk to a backend, and does not intentionally send user data anywhere. Widget preferences such as time zone, seconds visibility, pinned state, style, and time format are stored locally on the user's machine.

## Reporting a vulnerability

If you find a real security issue, please do not open a public issue with full reproduction details right away.

Instead, report it privately first so there is a chance to review and fix it before the details are public. If there is contact information in the repository profile or release page, use that channel. If not, open a minimal issue without sensitive details and clearly say that you have a private security report to share.

## What is helpful in a report

Please include:
- a short description of the issue
- affected version or commit
- steps to reproduce it
- what the real impact is
- screenshots or logs if they help explain the problem

## Scope

Useful reports generally include things like:
- unintended file access
- code execution paths that should not be possible
- packaging or installer issues with real security impact
- anything that could expose user data or local system data unexpectedly

Things that are usually not security issues for this project:
- UI bugs
- layout glitches
- incorrect time formatting
- visual regressions
- build failures on unsupported environments

## Disclosure

Once an issue is confirmed and fixed, responsible public disclosure is welcome.
