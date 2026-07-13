# Research2 Original-Style Alignment Design

## Goal

Retain the research agenda and semantic structure of `pages/research2.html` while aligning its typography, content width, spacing, and section treatment with the established visual language of `pages/research.html`.

## Scope

- Do not modify `pages/research.html`.
- Do not rewrite or remove the three core research questions or later research-agenda sections.
- Reuse the site's existing Bootstrap layout and the typography rules in `assets/css/sslab.css`.
- Keep accessibility metadata, semantic HTML, responsive navigation, canonical metadata, and existing links.

## Approved Visual Direction

### Page frame

- Change the main content column from `col-sm-12` to the original page's `col-sm-9` width.
- Keep the existing site container, navigation, footer, and responsive collapse behaviour.
- Present the page as a conventional single-column academic research page rather than a full-width editorial landing page.

### Typography

- Use the inherited Georgia / Times New Roman serif stack for page content.
- Use the original site's heading scale: approximately 30px for second-level headings, 24px for third-level headings, and 18px for fourth-level headings.
- Replace the oversized hero title with the standard `entry-title` treatment used by `research.html`.
- Use the original body size and line height; retain Arial only where the site already uses it for navigation.

### Sections and spacing

- Remove card-like borders, large coloured panels, oversized padding, multi-column programme grids, and large display-style spacing.
- Use the original `.research-section` pattern for major groups: modest bottom spacing and a light divider.
- Use the original `.research-subsection` pattern for nested material: a thin pale left border, small indentation, and compact vertical spacing.
- Keep the core question distinguishable through restrained emphasis rather than a large callout panel.

### Research architecture

- Preserve all six stages and their order.
- Render the architecture as a compact academic sequence within the normal content column.
- Use a single-column or naturally wrapping presentation that remains legible on mobile, without large cards or decorative effects.

### Responsive behaviour

- At desktop widths, match the original nine-column reading measure.
- On mobile, allow Bootstrap's column to expand naturally to full width.
- Avoid horizontal scrolling and retain readable heading and list spacing.

## Verification

- Confirm `pages/research.html` has no diff.
- Re-run the research2 structural contract tests.
- Verify the page at desktop and mobile widths in a real browser.
- Confirm the mobile navigation toggle, internal links, and six-stage architecture still work.
- Compare the resulting page visually with the typography, width, and indentation of `research.html`.

