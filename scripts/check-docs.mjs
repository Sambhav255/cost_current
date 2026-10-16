import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { log } from 'node:console';

const root = resolve(import.meta.dirname, '..');
const files = [root, resolve(root, 'docs')].flatMap((directory) =>
  readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .map((name) => resolve(directory, name)),
);

function withoutCode(text) {
  return text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
}

function anchors(file) {
  const counts = new Map();
  const result = new Set();
  for (const match of withoutCode(readFileSync(file, 'utf8')).matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const slug = match[1]
      .toLowerCase()
      .replace(/[^\p{L}\p{N}_\-\s]/gu, '')
      .replace(/\s/g, '-');
    const count = counts.get(slug) ?? 0;
    counts.set(slug, count + 1);
    result.add(count ? `${slug}-${count}` : slug);
  }
  return result;
}

const failures = [];
for (const file of files) {
  const source = withoutCode(readFileSync(file, 'utf8'));
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const href = match[1];
    if (/^[a-z][a-z\d+.-]*:/i.test(href)) continue;
    const [relative, fragment] = href.split('#');
    const target = relative ? resolve(dirname(file), decodeURIComponent(relative)) : file;
    if (!existsSync(target)) {
      failures.push(`${file}: missing local target ${href}`);
    } else if (fragment && target.endsWith('.md') && !anchors(target).has(fragment)) {
      failures.push(`${file}: missing heading ${href}`);
    }
  }
}
if (failures.length) throw new Error(failures.join('\n'));
log(`Checked local links and heading anchors in ${files.length} Markdown documents.`);
