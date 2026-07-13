# Research 2 Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and verify a new `pages/research2.html` that presents Yutian Tang's work as one secure and verifiable agentic software engineering agenda without changing `pages/research.html`.

**Architecture:** Build one static HTML document that reuses the site's Bootstrap navigation, shared stylesheet, footer, JavaScript, and serif identity. Keep the new editorial layout and responsive rules in a page-scoped `<style>` block; use semantic sections, repeated question/programme structures, and an ordered-list HTML/CSS research architecture.

**Tech Stack:** HTML5, CSS3, Bootstrap 3, existing jQuery/Bootstrap scripts, Python 3 standard-library contract tests, browser rendering.

## Global Constraints

- Do not modify `pages/research.html` or unrelated pages.
- Do not add a frontend framework, package, external chart library, image asset, gradient, animation, or dependency.
- Use one `h1`, exactly three core questions, British English, descriptive anchors, verified names/venues/years, and no unverified results.
- Use the existing `#003366` accent, white background, Georgia content typography, existing navigation, and existing footer pattern.
- Keep the first viewport focused on the agenda, thesis, and core question.
- Make the architecture readable as a horizontal sequence on wide screens and a vertical sequence on narrow screens.
- Preserve the user's unrelated working-tree changes.

---

### Task 1: Add a failing page contract

**Files:**
- Create: `/Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`
- Test: `/Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`

**Interfaces:**
- Consumes: `/Users/yutian.tang/Documents/GitHub/host/pages/research2.html` when it exists.
- Produces: a repeatable `unittest` contract for content, metadata, headings, internal links, and prohibited labels.

- [ ] **Step 1: Write the failing contract test**

```python
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

PAGE = Path('/Users/yutian.tang/Documents/GitHub/host/pages/research2.html')

class ResearchParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headings, self.links, self.ids, self.meta = [], [], set(), {}
        self._heading = None
        self._parts = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in {'h1', 'h2', 'h3', 'h4'}:
            self._heading, self._parts = tag, []
        if tag == 'a' and values.get('href'):
            self.links.append(values['href'])
        if values.get('id'):
            self.ids.add(values['id'])
        if tag == 'meta' and values.get('name'):
            self.meta[values['name']] = values.get('content', '')
    def handle_data(self, data):
        if self._heading:
            self._parts.append(data)
    def handle_endtag(self, tag):
        if tag == self._heading:
            self.headings.append((tag, ' '.join(''.join(self._parts).split())))
            self._heading, self._parts = None, []

class Research2Contract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = PAGE.read_text(encoding='utf-8')
        cls.parser = ResearchParser()
        cls.parser.feed(cls.html)
        cls.text = ' '.join(re.sub(r'<[^>]+>', ' ', cls.html).split())

    def test_identity_and_three_questions(self):
        self.assertEqual(self.text.count('Secure and Verifiable Agentic Software Engineering'), 2)
        self.assertEqual(len(re.findall(r'class="research-question"', self.html)), 3)
        self.assertIn('When should AI generated software be trusted?', self.text)
        self.assertIn('Whose intent should control an AI agent’s permissions?', self.text)
        self.assertIn('What evidence is required to hold AI assisted software systems accountable?', self.text)

    def test_metadata_and_heading_contract(self):
        self.assertEqual(sum(tag == 'h1' for tag, _ in self.parser.headings), 1)
        self.assertIn('secure and verifiable agentic software engineering', self.parser.meta['description'].lower())
        self.assertIn('https://www.chrisyttang.org/pages/research2.html', self.html)

    def test_required_structure_and_prohibited_labels(self):
        for section in ('research-questions', 'foundations', 'environments', 'architecture', 'programmes', 'public-confidence', 'collaboration'):
            self.assertIn(section, self.parser.ids)
        for phrase in ('Valuable asset to add', 'Core capability', '>Top<', 'Theme 1', 'Theme 2', 'Theme 3'):
            self.assertNotIn(phrase, self.html)

    def test_each_question_has_required_internal_structure(self):
        for block in re.findall(r'<article class="research-question".*?</article>', self.html, re.S):
            self.assertIn('Research problem', block)
            self.assertIn('Technical approach', block)
            self.assertIn('Selected evidence', block)
            self.assertLessEqual(len(re.findall(r'<li', block)), 3)

    def test_internal_links_exist(self):
        for href in self.parser.links:
            if href.startswith(('#', 'http:', 'https:', 'mailto:')):
                continue
            self.assertTrue((PAGE.parent / href.split('#')[0]).exists(), href)

if __name__ == '__main__':
    unittest.main(verbosity=2)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python3 /Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`

Expected: error with `FileNotFoundError` because `pages/research2.html` does not exist.

### Task 2: Implement the semantic research-agenda page

**Files:**
- Create: `pages/research2.html`
- Test: `/Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`

**Interfaces:**
- Consumes: existing `theme/css/bootstrap.min.css`, `theme/css/font-awesome.min.css`, `theme/css/style.css`, `assets/css/sslab.css`, `theme/js/jquery.min.js`, `theme/js/bootstrap.min.js`, `assets/js/custom.js`, and existing page URLs.
- Produces: a standalone public page at `/pages/research2.html` with section IDs used by the contract test and fragment navigation.

- [ ] **Step 1: Add the document shell and metadata**

Use the existing navigation/footer markup and these exact metadata values:

```html
<title>Secure and Verifiable Agentic Software Engineering - Yutian Tang</title>
<link rel="canonical" href="https://www.chrisyttang.org/pages/research2.html">
<meta name="description" content="Yutian Tang’s research agenda in secure and verifiable agentic software engineering, spanning semantic validation, runtime governance, software ecosystem security, and empirical evaluation.">
<meta property="og:title" content="Secure and Verifiable Agentic Software Engineering">
<meta property="og:url" content="https://www.chrisyttang.org/pages/research2.html">
```

- [ ] **Step 2: Add the agenda and exactly three research-question articles**

Use this component contract for the first article and repeat the same structure for the other two approved questions:

```html
<article class="research-question" aria-labelledby="question-N-title">
  <p class="question-number" aria-hidden="true">01</p>
  <h3 id="question-1-title">When should AI generated software be trusted?</h3>
  <div class="question-detail">
    <h4>Research problem</h4>
    <p>Syntactically correct code can still contain behavioural defects, compatibility failures, security vulnerabilities, weak tests, or incorrect assumptions about its operating environment.</p>
    <h4>Technical approach</h4>
    <p>We combine static and dynamic analysis, taint and configuration analysis, software testing, and large-language-model-assisted reasoning to determine whether generated code and patches behave as intended.</p>
    <h4>Selected evidence</h4>
    <ul class="evidence-list">
      <li>Artemis — OOPSLA 2025</li>
      <li>LLM-CompDroid — TOSEM 2025</li>
      <li>Beyond Coverage — OOPSLA 2026</li>
    </ul>
  </div>
</article>
```

The second article uses “Whose intent should control an AI agent’s permissions?” with MCP-SandboxScan (CoRR 2026), FuseChain (CoRR 2026), and *A Systematic Study on Real-world Android App Bundles* (TSE 2025). The third uses “What evidence is required to hold AI assisted software systems accountable?” with SecBenchLLM, LLM EcoBench Lite, and *Characterizing Large Language Model Agentic Workflows: A Study on N8n Ecosystem*; the first two are described as ongoing benchmark projects rather than completed publications.

- [ ] **Step 3: Add foundations, environments, architecture, programmes, public-confidence, and collaboration sections**

Use semantic `section`, `article`, `h2`, `h3`, paragraph, and list elements. Build the causal flow as an ordered list with exactly these six steps:

```html
<ol class="architecture-flow" aria-label="Research architecture from intent to public confidence">
  <li><strong>User Intent and Software Context</strong></li>
  <li><strong>Semantic Analysis and Permission Reasoning</strong></li>
  <li><strong>Controlled Execution and Runtime Monitoring</strong></li>
  <li><strong>Evidence Collection and Empirical Evaluation</strong></li>
  <li><strong>Trusted Deployment or Explicit Rejection</strong></li>
  <li><strong>Public Confidence and Reduced Fear</strong></li>
</ol>
```

- [ ] **Step 4: Add the scoped visual system and responsive rules**

Define page variables under `.research-page`, retain a true white background and `#003366` accent, use open editorial sections, bordered question panels, compact foundation/programme panels, `:focus-visible` styling, `overflow-wrap`, and a breakpoint at `767px` that converts multi-column areas and the architecture flow to one column.

- [ ] **Step 5: Run the contract test to verify it passes**

Run: `python3 /Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`

Expected: `Ran 5 tests` and `OK`.

### Task 3: Validate rendering, accessibility, and links

**Files:**
- Verify: `pages/research2.html`
- Create temporarily: screenshots under `/Users/yutian.tang/Documents/Codex/2026-07-13/k/work/`

**Interfaces:**
- Consumes: the final static page through a local HTTP server.
- Produces: desktop/mobile screenshots, link and overflow evidence, and a final fidelity ledger.

- [ ] **Step 1: Run static checks**

Run the Python contract, `git diff --check`, an internal-link checker, and scans for duplicate evidence, prohibited labels, invalid heading order, incorrect canonical URLs, and placeholder text. Expected: all commands exit zero.

- [ ] **Step 2: Render and inspect desktop**

Serve the repository with `python3 -m http.server 4173`, open `http://127.0.0.1:4173/pages/research2.html`, capture at `1440x1000`, inspect first-viewport hierarchy, full-page rhythm, navigation, typography, palette, spacing, and architecture.

- [ ] **Step 3: Render and inspect mobile**

Capture at `390x844`, verify the Bootstrap navigation toggle, one-column question/programme panels, vertically stacked architecture, readable type, visible focus, and `scrollWidth <= innerWidth`.

- [ ] **Step 4: Record fidelity and acceptance evidence**

Compare the desktop and mobile renders against the accepted design specification and record at least five concrete checks: copy and section order, first viewport, typography, palette, container model, responsive architecture, and navigation behaviour. Fix any discrepancy and repeat the relevant checks.

- [ ] **Step 5: Commit the implemented page**

```bash
git add pages/research2.html
git commit -m "Add secure agentic software research agenda"
```
