# Research2 Original-Style Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `pages/research2.html` with the typography and single-column academic layout of `pages/research.html` without changing the original page or the new research agenda's content.

**Architecture:** Keep the existing semantic HTML and content classes, but replace the editorial landing-page CSS with compact overrides that reuse the site's Georgia typography, Bootstrap nine-column content width, and `.research-section` / `.research-subsection` visual language. Preserve the six-stage architecture as an ordered academic sequence and retain responsive navigation.

**Tech Stack:** Static HTML5, existing Bootstrap 3, existing `theme/css/style.css`, existing `assets/css/sslab.css`, Python `unittest`, in-app browser QA.

## Global Constraints

- Do not modify `pages/research.html`.
- Do not rewrite or remove the three core research questions or later research-agenda sections.
- Use `col-sm-9`, inherited Georgia body typography, and the original heading scale.
- Remove full-width editorial cards, large coloured panels, and multi-column programme layouts.
- Preserve metadata, links, semantic structure, mobile navigation, and all six architecture stages.
- Do not include unrelated `.DS_Store` changes in commits.

---

### Task 1: Add original-style layout contract checks

**Files:**
- Modify: `/Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`
- Test: `/Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`

**Interfaces:**
- Consumes: the HTML text at `pages/research2.html`.
- Produces: assertions for `col-sm-9`, `entry-title`, inherited typography, and removal of the oversized editorial layout.

- [ ] **Step 1: Write failing layout assertions**

Add a test that requires `class="col-sm-9"`, `class="entry-title"`, `font-size: 30px` for page `h2`, single-column `.panel-grid`, and rejects the old `clamp(3.2rem, 5vw, 5.4rem)` hero title.

- [ ] **Step 2: Run the test and verify failure**

Run: `python3 /Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`

Expected: one new layout-alignment test fails against the current `col-sm-12` editorial layout.

### Task 2: Align page typography and layout

**Files:**
- Modify: `pages/research2.html`

**Interfaces:**
- Consumes: the existing semantic content and shared site styles.
- Produces: an original-site-aligned research page with unchanged agenda content.

- [ ] **Step 1: Replace page-scoped editorial CSS**

Use compact page-scoped CSS that inherits Georgia typography, applies 30px / 24px / 18px heading sizes, uses light section dividers and two-pixel subsection borders, makes all content grids one column, and presents architecture steps as a restrained ordered list.

- [ ] **Step 2: Restore the original page frame**

Change the content wrapper to `<div class="col-sm-9">` and the main heading to `<h1 class="entry-title">`.

- [ ] **Step 3: Run contract tests**

Run: `python3 /Users/yutian.tang/Documents/Codex/2026-07-13/k/work/test_research2.py`

Expected: all structure and layout tests pass.

### Task 3: Browser verification and delivery

**Files:**
- Verify: `pages/research2.html`
- Verify unchanged: `pages/research.html`

**Interfaces:**
- Consumes: the completed static page.
- Produces: desktop/mobile visual evidence and a focused Git commit.

- [ ] **Step 1: Run static verification**

Run `git diff --check`, confirm `git diff -- pages/research.html` is empty, and rerun the Python contract suite.

- [ ] **Step 2: Verify in a real browser**

At desktop and 390px mobile widths, confirm original-style typography, nine-column desktop measure, natural mobile width, no horizontal overflow, six architecture stages, and a working mobile navigation toggle.

- [ ] **Step 3: Commit only the intended page**

Run:

```bash
git add -- pages/research2.html
git commit -m "Align research2 with original site styling" -- pages/research2.html
```

