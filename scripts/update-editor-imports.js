#!/usr/bin/env node

/**
 * Updates docs/public/editor/editor.js esm.sh import URLs from
 * docs/public/editor/package.json versions and resolves the pinned
 * esm.sh build number (vN) for each package, guaranteeing immutable URLs.
 *
 * Run after updating package.json versions (e.g. after a Dependabot PR):
 *
 *   node scripts/update-editor-imports.js
 *
 * The script rewrites only the esm.sh import lines in editor.js; all other
 * code is left untouched.
 *
 * Requirements: Node.js 18+ (uses native fetch).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PKG_PATH = path.join(__dirname, '../docs/public/editor/package.json');
const EDITOR_PATH = path.join(__dirname, '../docs/public/editor/editor.js');

// The shared state version that all packages must agree on (prevents
// duplicate-instance issues).  Always matches @codemirror/state in package.json.
const DEPS_PACKAGE = '@codemirror/state';

/**
 * Resolves the pinned esm.sh build URL for a given package + version.
 * esm.sh redirects bare package URLs to a versioned build URL of the form
 * https://esm.sh/v{N}/package@version, which is content-addressable and
 * immutable.
 *
 * @param {string} pkg - Package specifier, e.g. "@codemirror/state" or "codemirror"
 * @param {string} version - Exact semver version, e.g. "6.6.0"
 * @param {string} [depsParam] - Optional ?deps= query value, e.g. "@codemirror/state@6.6.0"
 * @returns {Promise<string>} Pinned import URL
 */
async function getPinnedUrl(pkg, version, depsParam) {
  const qs = depsParam ? `?deps=${encodeURIComponent(depsParam)}` : '';
  const url = `https://esm.sh/${pkg}@${version}${qs}`;

  let res;
  try {
    // Follow only the first redirect to extract the esm.sh build version (vN).
    res = await fetch(url, { redirect: 'manual' });
  } catch (err) {
    throw new Error(`Failed to fetch ${url} for ${pkg}@${version}: ${err.message}`);
  }

  const location = res.headers.get('location');
  if (!location) {
    throw new Error(`No redirect for ${url} (status ${res.status}) — expected esm.sh to redirect to a pinned build URL`);
  }

  // location is either an absolute URL or a path like /v136/@codemirror/state@6.6.0/...
  // Extract the vN segment.
  const match = location.match(/\/(v\d+)\//);
  if (!match) {
    throw new Error(`Unexpected redirect location for ${pkg}@${version}: ${location}`);
  }
  const buildVersion = match[1]; // e.g. "v136"

  // Construct the stable module URL (without the trailing /es2022/... file path).
  const pinnedUrl = `https://esm.sh/${buildVersion}/${pkg}@${version}${qs}`;
  console.log(`  ${pkg}@${version} → ${pinnedUrl}`);
  return pinnedUrl;
}

async function main() {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  const deps = pkg.dependencies;

  const stateVersion = deps[DEPS_PACKAGE];
  if (!stateVersion) {
    throw new Error(`${DEPS_PACKAGE} not found in ${PKG_PATH}`);
  }

  // The ?deps= value pinned across all imports to prevent duplicate instances.
  const depsParam = `${DEPS_PACKAGE}@${stateVersion}`;

  console.log('Resolving pinned esm.sh build URLs...');

  // Map each package to its pinned URL.  codemirror (the meta-package) needs
  // the ?deps= param so its transitive @codemirror/view pull the right state.
  const pinned = {
    codemirror: await getPinnedUrl('codemirror', deps['codemirror'], depsParam),
    '@codemirror/state': await getPinnedUrl('@codemirror/state', stateVersion),
    '@codemirror/view': await getPinnedUrl('@codemirror/view', deps['@codemirror/view'], depsParam),
    '@codemirror/lang-yaml': await getPinnedUrl('@codemirror/lang-yaml', deps['@codemirror/lang-yaml'], depsParam),
    '@codemirror/lang-markdown': await getPinnedUrl('@codemirror/lang-markdown', deps['@codemirror/lang-markdown'], depsParam),
    '@codemirror/language': await getPinnedUrl('@codemirror/language', deps['@codemirror/language'], depsParam),
    '@codemirror/theme-one-dark': await getPinnedUrl('@codemirror/theme-one-dark', deps['@codemirror/theme-one-dark'], depsParam),
  };

  // Read editor.js and replace only the esm.sh import lines.
  let source = fs.readFileSync(EDITOR_PATH, 'utf8');

  // Build a lookup map: exact package name → new pinned URL.
  // Scoped packages (@codemirror/*) are matched before the bare 'codemirror'
  // to avoid the bare package name accidentally matching inside scoped names.
  const entries = [
    // Scoped packages first (more specific)
    ['@codemirror/state', pinned['@codemirror/state']],
    ['@codemirror/view', pinned['@codemirror/view']],
    ['@codemirror/lang-yaml', pinned['@codemirror/lang-yaml']],
    ['@codemirror/lang-markdown', pinned['@codemirror/lang-markdown']],
    ['@codemirror/language', pinned['@codemirror/language']],
    ['@codemirror/theme-one-dark', pinned['@codemirror/theme-one-dark']],
    // Bare package last (least specific)
    ['codemirror', pinned['codemirror']],
  ];

  // Replace only import-statement URLs: `from 'https://esm.sh/...'`
  source = source.replace(
    /(\bfrom\s+')(https:\/\/esm\.sh\/[^']+)(')/g,
    (match, before, oldUrl, after) => {
      for (const [pkgName, newUrl] of entries) {
        // Match the exact package specifier in the URL path (not a substring of another name).
        // Use a regex so "codemirror" doesn't match "@codemirror/...".
        const escapedPkg = pkgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pkgPattern = new RegExp(`/(?:v\\d+/)?${escapedPkg}@`);
        if (pkgPattern.test(oldUrl)) {
          return `${before}${newUrl}${after}`;
        }
      }
      return match; // Unknown URL — leave unchanged
    },
  );

  fs.writeFileSync(EDITOR_PATH, source, 'utf8');
  console.log(`\nUpdated ${EDITOR_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
