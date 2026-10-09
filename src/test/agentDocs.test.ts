import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const publicDir = path.resolve(rootDir, 'public');

describe('AI Agent Documentation & Discovery Test Suite', () => {
  it('TC-AGENT-01: robots.txt exists and explicitly allows LLM endpoints and bots', () => {
    const robotsPath = path.resolve(publicDir, 'robots.txt');
    assert.ok(fs.existsSync(robotsPath), 'robots.txt must exist in public directory');
    const content = fs.readFileSync(robotsPath, 'utf-8');
    assert.ok(content.includes('Allow: /llms.txt'));
    assert.ok(content.includes('Allow: /llms-full.txt'));
    assert.ok(content.includes('User-agent: GPTBot'));
    assert.ok(content.includes('User-agent: ClaudeBot'));
    assert.ok(content.includes('User-agent: PerplexityBot'));
  });

  it('TC-AGENT-02: llms.txt follows standard specification with summary and links', () => {
    const llmsPath = path.resolve(publicDir, 'llms.txt');
    assert.ok(fs.existsSync(llmsPath), 'llms.txt must exist in public directory');
    const content = fs.readFileSync(llmsPath, 'utf-8');
    assert.ok(content.startsWith('# Photon: Only Field'));
    assert.ok(content.includes('/llms-full.txt'));
    assert.ok(content.includes('/docs/theory-vi.md'));
    assert.ok(content.includes('/docs/theory-en.md'));
    assert.ok(content.includes('Fock state'));
    assert.ok(content.includes('Casimir'));
    assert.ok(!content.includes('undefined'), 'llms.txt must not contain undefined');
  });

  it('TC-AGENT-03: llms-full.txt contains detailed formulas, misconceptions, and timeline', () => {
    const fullPath = path.resolve(publicDir, 'llms-full.txt');
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert.ok(content.includes('E = h\\nu = \\hbar\\omega'));
    assert.ok(content.includes('K_{\\max} = h\\nu - \\Phi'));
    assert.ok(content.includes('Mach-Zehnder'));
    assert.ok(content.includes('Robert Jaffe') || content.includes('Casimir'));
    assert.ok(content.includes('PART I: VIETNAMESE THEORETICAL DOCUMENTATION'));
    assert.ok(content.includes('PART II: ENGLISH THEORETICAL DOCUMENTATION'));
    assert.ok(!content.includes('undefined'), 'llms-full.txt must not contain undefined');
  });

  it('TC-AGENT-04: Specialized theory markdown files exist in docs/', () => {
    const viPath = path.resolve(publicDir, 'docs/theory-vi.md');
    const enPath = path.resolve(publicDir, 'docs/theory-en.md');
    assert.ok(fs.existsSync(viPath), 'docs/theory-vi.md must exist');
    assert.ok(fs.existsSync(enPath), 'docs/theory-en.md must exist');
    const viContent = fs.readFileSync(viPath, 'utf-8');
    const enContent = fs.readFileSync(enPath, 'utf-8');
    assert.ok(viContent.length > 5000, 'Vietnamese theory file should have rich content');
    assert.ok(enContent.length > 5000, 'English theory file should have rich content');
  });

  it('TC-AGENT-05: sitemap.xml includes root and all documentation endpoints', () => {
    const sitemapPath = path.resolve(publicDir, 'sitemap.xml');
    assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist');
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    assert.ok(content.includes('<loc>https://photon-only-field.pages.dev/</loc>'));
    assert.ok(content.includes('<loc>https://photon-only-field.pages.dev/llms.txt</loc>'));
    assert.ok(content.includes('<loc>https://photon-only-field.pages.dev/llms-full.txt</loc>'));
  });

  it('TC-AGENT-06: Semantic HTML fallback contains all sections including modern critiques, deep dive, and tour', () => {
    const distHtmlPath = path.resolve(rootDir, 'dist/index.html');
    assert.ok(fs.existsSync(distHtmlPath), 'dist/index.html must exist');
    const content = fs.readFileSync(distHtmlPath, 'utf-8');

    // Section 1: QFT Core
    assert.ok(content.includes('id="ai-qft-core"'));
    // Section 2: Myths
    assert.ok(content.includes('id="ai-myths"'));
    // Section 3: Virtual Labs
    assert.ok(content.includes('id="ai-labs"'));
    assert.ok(content.includes('Mach-Zehnder'));
    assert.ok(content.includes('Hamiltonian: H = ℏ·ω·(a†a + 1/2)'));
    // Section 4: Timeline
    assert.ok(content.includes('id="ai-timeline"'));
    // Section 5: Deep Dive & 3-Paradigm Table
    assert.ok(content.includes('id="ai-deep-dive"'));
    // Section 6: Modern Perspectives & 4 Critique Pillars
    assert.ok(content.includes('id="ai-modern-perspectives"'));
    assert.ok(content.includes('Steven Weinberg'));
    assert.ok(content.includes('Robert Jaffe'));
    assert.ok(content.includes('Lamb & Scully') || content.includes('Lamb'));
    assert.ok(content.includes('Antibunching') || content.includes('chống chùm photon'));
    // Section 7: Tour
    assert.ok(content.includes('id="ai-tour"'));
    // Section 8: English summary
    assert.ok(content.includes('id="ai-english-summary"'));
  });

  it('TC-AGENT-07: Schema.org JSON-LD contains comprehensive FAQ with modern critiques', () => {
    const distHtmlPath = path.resolve(rootDir, 'dist/index.html');
    const content = fs.readFileSync(distHtmlPath, 'utf-8');
    assert.ok(content.includes('"@type": "FAQPage"'));
    assert.ok(content.includes('Robert Jaffe'));
    assert.ok(content.includes('Willis Lamb & Marlan Scully'));
    assert.ok(content.includes('Steven Weinberg'));
    assert.ok(content.includes('Newton-Wigner'));
  });
});

