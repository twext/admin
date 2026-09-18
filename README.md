# Twext Admin

> An admin CLI for managing a TwextHub instance — accounts, extensions, moderation, tokens, sessions, and legal documents

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Highlights](#highlights)
- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Feedback and Contributing](#feedback-and-contributing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Highlights

- Moderate the review queue: `approve`, `reject`, `yank`, and `queue`
- Manage accounts: promote/demote roles, change passwords, delete users, list sessions and automation tokens
- Inspect the registry: extension details, versions, downloads, stats, and product metadata
- Update legal documents: publish new Terms of Service and Privacy Policy versions
- Points at the public TwextHub at `https://twexts.sdisk.us/api/v0` by default; override with `-u`

## Overview

Twext Admin talks to the TwextHub API. Sessions are stored as a bearer token in `.twext-admin-token` under your user configuration directory (`~/.config` on Linux, `~/Library/Application Support` on macOS, `%APPDATA%` on Windows), so logging in works from anywhere; most operations require a session on an admin account, and the API rejects automation tokens for admin work.

## Installation

Install globally to use the `twext-admin` command anywhere:

```bash
npm install -g @twext/admin
```

Or run directly from a checkout:

```bash
node src/cli.js --help
```

Requires Node.js 24 or newer.

## Usage

Run `twext-admin` with no arguments to open an interactive menu that walks through the commands below.

First log in with an admin account:

```bash
twext-admin auth login <namespace>
```

It prompts for the password with the terminal echo turned off (or reads a line of standard input when piped). The 7-day session token is saved to `.twext-admin-token` in your user configuration directory; subsequent commands reuse it until it expires or you log out (`twext-admin auth logout`).

Moderating the review queue:

```bash
twext-admin queue
twext-admin approve @someone/my-extension 1.2.0
twext-admin reject @someone/my-extension 1.2.0 --reason "Uses a blocked API"
twext-admin yank @someone/my-extension 1.2.0
```

Managing accounts:

```bash
twext-admin users list
twext-admin users get someone
twext-admin users update someone --role admin
twext-admin users delete someone
twext-admin tokens list
twext-admin sessions list --namespace someone
```

Inspecting and cleaning up extensions:

```bash
twext-admin extensions list
twext-admin search "cloud variables"
twext-admin extensions get @someone/my-extension
twext-admin download @someone/my-extension 1.2.0 -o ./my-extension.js
twext-admin extensions delete @someone/my-extension
```

Legal documents and health:

```bash
# reads Markdown from stdin, then Ctrl+D (or pipe it in)
twext-admin terms update
twext-admin terms
twext-admin stats
twext-admin meta
```

Most list commands take `--limit` and `--cursor` for pagination. Point the CLI at a different instance with `-u, --url`:

```bash
twext-admin -u https://staging.example.com/api/v0 stats
```

## Feedback and Contributing

Bug reports and feature requests go in [issues](https://github.com/twext/admin/issues). Contributions are welcome — open an issue first if the change is bigger than a typo fix.
