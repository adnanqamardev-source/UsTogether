import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * E2E Test Report Generator
 * Reads the Playwright JSON report and produces a Markdown summary.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const resultsPath = join(rootDir, 'test-results', 'results.json');

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const remains = (s % 60).toFixed(0);
  return `${m}m ${remains}s`;
}

function buildReport() {
  if (!existsSync(resultsPath)) {
    console.error('No results.json found. Run `npx playwright test --reporter=json,list,html` first.');
    process.exit(1);
  }

  const raw = readFileSync(resultsPath, 'utf8');
  const json = JSON.parse(raw);
  const suites = Array.isArray(json.suites) ? json.suites : [];
  const tests = [];

  function walk(node) {
    const specs = node.specs || [];
    for (const spec of specs) {
      for (const test of spec.tests || []) {
        const result = test.results?.[0];
        tests.push({
          title: spec.title,
          fullTitle: spec.title,
          status: test.status,
          duration: result?.duration || 0,
          error: result?.error?.message || null,
          location: `${spec.file}:${spec.line}`,
          retries: (test.results?.length || 1) - 1,
          screenshot: result?.attachments?.find((a) => a.name === 'screenshot')?.path || null,
          video: result?.attachments?.find((a) => a.name === 'video')?.path || null,
        });
      }
    }
    for (const child of node.suites || []) {
      walk(child);
    }
  }

  for (const suite of suites) walk(suite);

  const passed = tests.filter((t) => t.status === 'passed' || t.status === 'expected').length;
  const failed = tests.filter((t) => t.status === 'failed' || t.status === 'unexpected').length;
  const skipped = tests.filter((t) => t.status === 'skipped').length;
  const flaky = tests.filter((t) => t.retries > 0 && (t.status === 'passed' || t.status === 'expected')).length;
  const total = tests.length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
  const totalDuration = json.stats?.duration ?? tests.reduce((sum, t) => sum + t.duration, 0);

  const lines = [];
  lines.push('# E2E Test Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Status:** ${failed === 0 ? 'PASSING' : 'FAILING'}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Tests | ${total} |`);
  lines.push(`| Passed | ${passed} (${passRate}%) |`);
  lines.push(`| Failed | ${failed} |`);
  lines.push(`| Skipped | ${skipped} |`);
  lines.push(`| Flaky (passed after retry) | ${flaky} |`);
  lines.push(`| Total Duration | ${formatDuration(totalDuration)} |`);
  lines.push('');

  const failedTests = tests.filter((t) => t.status === 'failed');
  if (failedTests.length > 0) {
    lines.push('## Failed Tests');
    lines.push('');
    failedTests.forEach((t, i) => {
      lines.push(`### ${i + 1}. ${t.title}`);
      lines.push('');
      lines.push(`**File:** \`${t.location}\``);
      lines.push(`**Duration:** ${formatDuration(t.duration)}`);
      if (t.error) {
        lines.push('');
        lines.push('```');
        lines.push(t.error);
        lines.push('```');
      }
      lines.push('');
      lines.push('**Artifacts:**');
      if (t.screenshot) lines.push(`- Screenshot: \`${t.screenshot}\``);
      if (t.video) lines.push(`- Video: \`${t.video}\``);
      lines.push('');
    });
  }

  const skippedTests = tests.filter((t) => t.status === 'skipped');
  if (skippedTests.length > 0) {
    lines.push('## Skipped Tests');
    lines.push('');
    skippedTests.forEach((t) => {
      lines.push(`- ${t.title} (\`${t.location}\`)`);
    });
    lines.push('');
  }

  lines.push('## Artifacts');
  lines.push('');
  lines.push('- HTML Report: `playwright-report/index.html`');
  lines.push('- Test Results: `test-results/results.json`');
  lines.push('- Screenshots: `test-results/artifacts/*.png`');
  lines.push('- Videos: `test-results/artifacts/*/video.webm`');
  lines.push('- Traces: `test-results/artifacts/*/trace.zip`');
  lines.push('');

  return lines.join('\n');
}

try {
  const report = buildReport();
  const reportDir = join(rootDir, 'test-results');
  ensureDir(reportDir);
  writeFileSync(join(reportDir, 'e2e-report.md'), report, 'utf8');
  console.log(report);
  console.log('\nReport saved to: test-results/e2e-report.md');
} catch (err) {
  console.error('Failed to generate report:', err.message);
  process.exit(1);
}
