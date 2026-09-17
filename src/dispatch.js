import { loginCommand, logoutCommand, meCommand } from './commands/auth.js';
import { usersCommand } from './commands/users.js';
import { extensionsCommand, searchCommand } from './commands/extensions.js';
import { queueCommand, approveCommand, rejectCommand } from './commands/moderation.js';
import { versionsCommand, yankCommand, downloadCommand } from './commands/versions.js';
import { tokensCommand } from './commands/tokens.js';
import { sessionsCommand } from './commands/sessions.js';
import { termsCommand, privacyCommand } from './commands/legal.js';
import { statsCommand, metaCommand } from './commands/status.js';

export function helpText(product) {
  return `${product.name} ${product.version} — ${product.tagline}

Run '${product.command}' with no arguments to start the interactive menu, or use subcommands:

Usage: ${product.command} <command> [options]

Commands:
  auth           Log in, log out, or view the current account
  users          List, view, update, or delete accounts
  extensions     List, view, or delete published extensions
  search         Search published extensions
  queue          Show the pending moderation review queue
  approve        Approve a pending version
  reject         Reject a pending version
  versions       Get version metadata
  yank           Yank (unlist) a version
  download       Download a compiled extension
  tokens         Manage automation tokens
  sessions       Manage login sessions
  terms          View or update the Terms of Service
  privacy        View or update the Privacy Policy
  stats          Show registry-wide counters
  meta           Show TwextHub product info
  help           Show this help

Options:
  -u, --url <url>   Override the TwextHub API URL (default: ${product.defaults.apiBase})
  -h, --help        Show help
  -v, --version     Print the version

Run '${product.command} <command> --help' for command-specific help.`;
}

export async function dispatch(product, log, positionals, values) {
  const command = positionals[0] ?? 'help';
  try {
    switch (command) {
      case 'help':
        console.log(helpText(product));
        return 0;
      case 'auth':
        return authDispatch(product, log, positionals[1], positionals.slice(2));
      case 'users':
        return usersCommand(product, log, positionals[1], positionals.slice(2), values);
      case 'extensions':
        return extensionsCommand(product, log, positionals[1], positionals.slice(2), values);
      case 'search':
        return searchCommand(product, log, positionals.slice(1), values);
      case 'queue':
      case 'moderation':
        return queueCommand(product, log, values);
      case 'approve':
        return approveCommand(product, log, positionals.slice(1), values);
      case 'reject':
        return rejectCommand(product, log, positionals.slice(1), values);
      case 'versions':
        return versionsCommand(product, log, positionals.slice(1), values);
      case 'yank':
        return yankCommand(product, log, positionals.slice(1));
      case 'download':
        return downloadCommand(product, log, positionals.slice(1), values);
      case 'tokens':
        return tokensCommand(product, log, positionals[1], positionals.slice(2), values);
      case 'sessions':
        return sessionsCommand(product, log, positionals[1], positionals.slice(2), values);
      case 'terms':
        return termsCommand(product, log, positionals[1]);
      case 'privacy':
        return privacyCommand(product, log, positionals[1]);
      case 'stats':
        return statsCommand(product, log);
      case 'meta':
        return metaCommand(product, log);
      default:
        log.error(`Unknown command "${command}"`);
        console.log(helpText(product));
        return 1;
    }
  } catch (err) {
    log.error(err.message ?? String(err));
    return 1;
  }
}

function authHelp(product) {
  return `Usage: ${product.command} auth <subcommand>

Subcommands:
  login <namespace> <password>   Log in and save the session token
  logout                         Revoke the current session and clear the saved token
  me                             Show the currently authenticated account`;
}

function authDispatch(product, log, sub, rest) {
  switch (sub) {
    case 'login':
      return loginCommand(product, log, rest);
    case 'logout':
      return logoutCommand(product, log);
    case 'me':
      return meCommand(product, log);
    default:
      console.log(authHelp(product));
      return sub ? 1 : 0;
  }
}
