# Research 2 Page Design

## Purpose and Scope

Create `pages/research2.html` as a new research-agenda page for Yutian Tang's academic website. The existing `pages/research.html` and all unrelated pages remain unchanged. The new page must let a visitor identify the central research problem, distinctive technical approach, supporting evidence, and collaboration routes within thirty seconds.

The page will remain a static HTML document using the repository's existing Bootstrap, shared navigation, footer, typography, JavaScript, and dark-blue accent. Page-specific styling will be scoped inside `research2.html` so the experiment cannot alter other pages or require a dependency.

## Research Position

The single research identity is **Secure and Verifiable Agentic Software Engineering**. The thesis is that artificial intelligence systems increasingly generate, modify, test, repair, and operate software, so the important question is whether their outputs and actions can be trusted in real environments. The agenda combines program analysis, software security, empirical software engineering, mobile ecosystem analysis, and large-language-model-based automation.

The first viewport will contain the page title, a concise thesis paragraph, and the core question: when should artificial-intelligence-generated software be trusted, tested, or rejected?

## Information Architecture

The page contains these sections in order:

1. **Research Agenda** — title, thesis, core question, and links to full publications and projects.
2. **Three Core Research Questions** — exactly three prominent question panels. Each uses the same internal order: research problem, technical approach, selected evidence. Each includes at most three evidence items.
3. **Research Foundations** — program analysis and semantic validation; runtime governance and software ecosystem security; empirical measurement and benchmark design.
4. **Application and Validation Environments** — mobile and Android ecosystems; computational and developer workflows. These are validation environments rather than parallel research identities.
5. **Research Architecture** — an accessible HTML/CSS causal flow from user intent and context through analysis, controlled execution, evidence, evaluation, and either trusted deployment or explicit rejection, ending in public confidence and reduced fear.
6. **Selected Research Programmes** — three compact programme cards, each with an objective, methods, verified assets, and a restrained next-frontier sentence.
7. **Public Confidence and Reduced Fear** — a concrete account of how auditability, explicit permissions, reconstructable evidence, and rejectable unsafe outputs reduce uncertainty and hidden harms.
8. **Collaboration** — selected collaboration areas and descriptive links to projects, publications, supervision, and contact information.

## Existing Content Mapping

- “Theme 1” material on program reasoning, testing, repair, benchmarks, agent security, workflow reliability, and cost-aware deployment moves into the three research questions, foundations, and programmes.
- “Theme 2” material moves into the mobile and Android validation environment and supplies selected software-supply-chain evidence.
- “Theme 3” material becomes evidence for empirical measurement and the computational/developer workflow environment.
- “Core capability”, “Valuable asset to add”, “Top”, informal planning language, repeated assets, and the exhaustive publication inventory are removed from the new page.
- Full publication and project inventories remain available through descriptive links to the existing pages.

## Visual System and Components

The layout is editorial and restrained: a full-width content column within the existing Bootstrap container, generous vertical spacing, one dark-blue accent, light neutral borders, and no gradients, decorative illustrations, icon set, or animation.

The three research questions are the strongest elements after the title. They use numbered labels, a left accent rule, clear subheadings, and an open layout rather than dense nested cards. Foundations and programmes use compact, consistent panels. Evidence items use short linked or unlinked rows depending on whether a verified destination exists.

The research architecture uses a semantic ordered list. Desktop presents a connected horizontal sequence where space permits; tablet and mobile stack the steps vertically with a directional border. An adjacent accessible text description states that trust is produced by analysis, controlled execution, evidence, and evaluation rather than assumed.

## Content and Factual Rules

All prose uses concise British English. The page will not claim publications, projects, systems, datasets, grants, collaborators, awards, or results that cannot be verified on the website or in the repository. Names, venues, and years are copied from the existing publications or projects pages. Unverified working titles may be omitted or described without asserting a completed artefact.

No evidence item is repeated unless the duplication is necessary to connect one programme to one question. Where the prompt names an asset that lacks a reliable link, the text remains factual and avoids implying a publication status.

## Metadata and Accessibility

The document title, canonical URL, Open Graph title/URL, and meta description will identify `research2.html` and the secure and verifiable agentic software engineering agenda. Existing analytics and shared scripts are preserved if present.

The page has one `h1`, sequential semantic headings, landmarks, a keyboard-operable Bootstrap navigation, visible focus styles, descriptive anchors, sufficient contrast, and no information conveyed by colour alone. The architecture includes an explicit accessible description. Responsive CSS prevents horizontal overflow at desktop, tablet, and mobile widths.

## Verification

Verification will include:

- HTML structure and heading-order checks.
- Exactly three core research questions and the required internal structure for each.
- Scans for prohibited labels, duplicated evidence, placeholder or planning language, and an incorrect canonical URL.
- Internal-link existence checks and HTTP checks for relevant external links.
- Desktop and mobile browser rendering, overflow checks, navigation interaction, and screenshots.
- Keyboard focus and basic accessibility checks.
- A final factual comparison against the existing research, publications, and projects pages.

Because this repository is the published static site and has no package/build configuration, there is no production build command or generated `docs/` output. Validation therefore targets the final static HTML directly.
