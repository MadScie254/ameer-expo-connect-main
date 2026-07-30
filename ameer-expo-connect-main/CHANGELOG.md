# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Basic SEO files (`robots.txt` and `sitemap.xml`).
- Confirmation emails to registrants using Resend.
- Submission abuse throttling for registration and exhibitor lead endpoints.
- Retry path for failed or timed-out VIP payments.
- Security hardening migration (RLS policies and function permissions).
- VIP pass payment flow via Pesapal integration.
- Language Switcher on the registration form.

### Changed

- Refactored `Hero` and `Footer` components to extract external URLs to constants.
- Updated registration flow to correctly use Supabase and handle Pesapal UUID mismatches.

### Fixed

- Fixed eslint dependency version conflict.
- Fixed registration confirmation polling by resolving the ID discrepancy (UUID vs Reference Code).
- Replaced broken remote image references with locally hosted assets.
- Removed unused `@libsql/client` dependencies.
