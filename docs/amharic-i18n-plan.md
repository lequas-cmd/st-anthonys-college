# Amharic i18n plan for Saint Anthony's public website

## Audit summary

### Routing, layout, and app shell
- Route definitions are centralized in [frontend/src/routes/AppRoutes.tsx](../frontend/src/routes/AppRoutes.tsx). Public pages are mounted at root paths like `/`, `/about`, `/programs`, `/admissions`, `/student-life`, `/news-events`, `/resources`, `/contact`, and `/search`; the 404 route is the `SimpleInfo` stub for `Page not found`.
- The public header and navigation are defined in [frontend/src/components/common/Header.tsx](../frontend/src/components/common/Header.tsx). The navigation is a static array of labels and path strings, and the language selector is currently disabled with `aria-label="Language selector"` and text `EN`.
- The public footer is defined in [frontend/src/components/common/Footer.tsx](../frontend/src/components/common/Footer.tsx), with static copy such as “Practical education, technical skills, and opportunities for a changing world.” and section headings such as “Academic resources” and “College information”.
- The shared page shell is in [frontend/src/components/common/Content.tsx](../frontend/src/components/common/Content.tsx), where `PageIntro` renders `eyebrow`, `title`, and `description` text as static props.
- The API layer is centralized in [frontend/src/services/api.ts](../frontend/src/services/api.ts): all requests go through a single `fetch` wrapper that attaches `Authorization: Bearer ...` when a token exists and throws a message on non-OK responses.

### Hardcoded user-facing strings and metadata currently verified
- Public home page and static content: [frontend/src/pages/public/HomeContent.tsx](../frontend/src/pages/public/HomeContent.tsx), [frontend/src/pages/public/About.tsx](../frontend/src/pages/public/About.tsx), [frontend/src/pages/public/Admissions.tsx](../frontend/src/pages/public/Admissions.tsx), [frontend/src/pages/public/HowToApply.tsx](../frontend/src/pages/public/HowToApply.tsx), [frontend/src/pages/public/StudentLife.tsx](../frontend/src/pages/public/StudentLife.tsx), [frontend/src/pages/public/Resources.tsx](../frontend/src/pages/public/Resources.tsx), [frontend/src/pages/public/Contact.tsx](../frontend/src/pages/public/Contact.tsx), [frontend/src/pages/public/Search.tsx](../frontend/src/pages/public/Search.tsx).
- Form and validation strings: [frontend/src/pages/public/Portal.tsx](../frontend/src/pages/public/Portal.tsx) contains validation and error messages such as “Enter your username and password to continue.”, “Invalid username or password…”, as well as labels like “College Username”, “Password”, and `aria-label` text for show/hide password.
- Accessibility and image alt text: [frontend/src/components/common/Brand.tsx](../frontend/src/components/common/Brand.tsx) includes `alt="Saint Anthony's Technical and Vocational College logo"`; [frontend/src/pages/public/HomeContent.tsx](../frontend/src/pages/public/HomeContent.tsx) includes alt text such as “Ethiopian Catholic Church Logo”, “CRS Ethiopia Logo”, and “Students learning practical technical skills in a workshop”.
- 404/error placeholder text: [frontend/src/routes/AppRoutes.tsx](../frontend/src/routes/AppRoutes.tsx) defines `SimpleInfo` with title “Page not found” and placeholder copy “Official content for this page has not yet been supplied. Replace this text with verified institutional information.”
- Metadata: I verified no explicit per-page `document.title`, `meta name="description"`, or `html lang` handling in the public route files. The present page shell uses JSX content only; metadata update logic is unverified.

### Static vs dynamic content
- Static content is embedded directly in JSX and arrays: [frontend/src/pages/public/HomeContent.tsx](../frontend/src/pages/public/HomeContent.tsx), [frontend/src/components/common/Header.tsx](../frontend/src/components/common/Header.tsx), [frontend/src/components/common/Footer.tsx](../frontend/src/components/common/Footer.tsx), [frontend/src/pages/public/Portal.tsx](../frontend/src/pages/public/Portal.tsx), [frontend/src/pages/public/Contact.tsx](../frontend/src/pages/public/Contact.tsx), and the `SimpleInfo` fallback in [frontend/src/routes/AppRoutes.tsx](../frontend/src/routes/AppRoutes.tsx).
- Dynamic content is fetched from the backend through [frontend/src/pages/public/Home.tsx](../frontend/src/pages/public/Home.tsx), [frontend/src/pages/public/Programs.tsx](../frontend/src/pages/public/Programs.tsx), [frontend/src/pages/public/ProgramDetail.tsx](../frontend/src/pages/public/ProgramDetail.tsx), [frontend/src/pages/public/NewsEvents.tsx](../frontend/src/pages/public/NewsEvents.tsx), [frontend/src/pages/public/NewsDetail.tsx](../frontend/src/pages/public/NewsDetail.tsx), and [frontend/src/pages/public/Announcements.tsx](../frontend/src/pages/public/Announcements.tsx).
- Backend routes serving public content: [backend/src/modules/programs/programs.routes.js](../backend/src/modules/programs/programs.routes.js), [backend/src/modules/news/news.routes.js](../backend/src/modules/news/news.routes.js), [backend/src/modules/events/events.routes.js](../backend/src/modules/events/events.routes.js), and [backend/src/modules/announcements/announcements.routes.js](../backend/src/modules/announcements/announcements.routes.js). These endpoints return `title`, `summary`, `body`, `category`, `slug`, `image_url`, `published_at`, and related fields; the public frontend consumes them as JSON.

### Fonts and CSS compatibility risks with Ethiopic script
- The design tokens define the default public-site type scale in [frontend/src/styles/tokens.css](../frontend/src/styles/tokens.css): `--sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;` and `--serif: "Newsreader", Georgia, "Times New Roman", serif;`.
- The public typography stylesheet in [frontend/src/styles/public/typography.css](../frontend/src/styles/public/typography.css) applies strong negative letter-spacing and a Latin-oriented heading rhythm (`letter-spacing: -0.04em;`), which is not a good fit for Ethiopic script without font tuning and a font fallback that supports Ge'ez glyph shaping.
- No Ethiopic-specific font stack or `@font-face` declarations are currently loaded. All public pages rely on the same English-first font setup in [frontend/src/styles/tokens.css](../frontend/src/styles/tokens.css) plus unmodified `text-wrap: balance` behavior in the global styles. That means line-height, letter spacing, and page rhythm need deliberate tuning for Amharic.
- The CSS currently uses large negative tracking and serif/sans pairing designed for Latin text; Ethiopic has no italics or case distinctions, so italic and uppercase treatments should degrade gracefully rather than being relied on. This is a verified CSS constraint.

## Step 2: Decision-based plan

### 1) i18n library
- Recommendation: lightweight custom locale dictionaries with a tiny `useLocale` helper, no extra dependency.
- One-line reason: the team is small and the repo already has a basic route and fetch pattern; `react-i18next` would add setup without clear payoff.
- Main rejected alternative: `react-i18next`.

### 2) URL strategy
- Recommendation: use `/am/...` prefixed routes with English at `/` as the default.
- One-line reason: explicit, SEO-friendly, and easy to keep aligned with the current route structure without a subdomain or query-string split.
- Main rejected alternative: query-string or subdomain locale switching (`?lang=am`, `am.example.com`).

### 3) Translation file structure
- Recommendation: per-feature namespaces in JSON, using dot-notation keys such as `home.hero.title` and `programs.filters.all`.
- One-line reason: it keeps translation review manageable for a small team and scales without over-engineering.
- Main rejected alternative: one giant `en.json` / `am.json` file with no namespaces.

### 4) Typography for Ethiopic
- Recommendation: self-host Noto Sans Ethiopic and Noto Serif Ethiopic (or equivalent), use `font-display: swap`, subset the used glyphs, and add a dedicated font stack for Amharic.
- One-line reason: the current site is English-first and needs explicit Ge'ez support rather than a generic `sans-serif` fallback.
- Main rejected alternative: relying on browser defaults or a single generic system stack.
- Additional rule: keep serif/sans pairing, but neutralize negative letter-spacing and avoid any dependence on italic or uppercase styling, since Ethiopic has no case and no italics.

### 5) Layout resilience
- Recommendation: use locale-aware wrapping rules, responsive nav stacking, and mobile-safe button labels rather than fixed widths.
- One-line reason: Amharic text can expand and reflow differently, so the layout must accept longer strings without clipping or overflow.
- Main rejected alternative: keeping the current rigid fixed-width layout with no locale-specific adjustments.

### 6) Language switcher
- Recommendation: keep the toggle in the public header and mobile menu, label it “English” / “አማርኛ”, persist state by URL first and `localStorage` second, and ensure proper `aria-label` and `aria-pressed` support.
- One-line reason: the current header already has a disabled locale button, so this is a low-risk integration point.
- Main rejected alternative: toggling only in local storage and not in the URL.

### 7) Document-level i18n
- Recommendation: set `html lang`, update per-language titles and meta descriptions, and emit canonical/Hreflang links for both routes.
- One-line reason: a bilingual launch needs correct SEO and assistive-technology metadata from day one.
- Main rejected alternative: no per-page metadata or language tagging.

### 8) Locale formatting
- Recommendation: keep Gregorian dates as the default UI standard, with Ethiopian-calendar support only if the project owner explicitly requests it later.
- One-line reason: the public site is not a legal registry, and full Ethiopian calendar conversion would add complexity before the bilingual launch.
- Main rejected alternative: converting the entire site to Ethiopian-calendar dates immediately.

### 9) Dynamic content
- Recommendation: add a `lang` API parameter to content endpoints and use a `requested -> fallback-to-English` rule for missing translations.
- One-line reason: it keeps the current Node backend compatible without forcing a database restructure before scope approval.
- Main rejected alternative: breaking schema changes or duplicating content rows without approval.

### 10) Translation workflow
- Recommendation: keep the source language as English JSON, require native Amharic review, clearly mark placeholders as “placeholder, needs native review”, and use a short review checklist for sign-off.
- One-line reason: a small team needs clear ownership and explicit translation review, not ad hoc editing in JSX.
- Main rejected alternative: inline untranslated strings or untranslated machine text directly in components.

### 11) Accessibility and search
- Recommendation: ensure the language switcher is announced to screen readers, keep all form/UI labels locale-aware, and treat search indexing as bilingual by matching both English and Amharic content fields.
- One-line reason: bilingual accessibility and search quality matter just as much as visual translation.
- Main rejected alternative: visible text only, with no ARIA or language metadata.

### 12) Testing
- Recommendation: run a focused visual and functional QA pass for both languages on mobile, tablet, and desktop, then validate route behavior, SEO metadata, and font rendering.
- One-line reason: typography and layout regressions are the most likely failure mode in bilingual launch work.
- Main rejected alternative: desktop-only QA with no bilingual or SEO checks.

## Step 3: Deliverables

### Target file structure
```text
frontend/
  src/
    app/
      i18n/
        locale.ts
        dictionaries/
          en/common.json
          en/header.json
          en/home.json
          am/common.json
          am/header.json
          am/home.json
    components/
      common/
        Header.tsx
        Footer.tsx
        Layout.tsx
      navigation/
      ui/
    features/
      home/
      about/
      programs/
      admissions/
      student-life/
      contact/
      search/
    styles/
      tokens.css
      public/
        typography.css
      fonts/
        amharic.css
    routes/
      AppRoutes.tsx
    services/
      api.ts
```

### Phased implementation roadmap
- Phase 1 foundation — S effort
  - Tasks: add locale helper, route-aware language detection, `/am` public route support, and URL/localStorage persistence.
  - Acceptance criteria: English stays default; `/am` paths render correctly; navigation keeps the selected locale on refresh.
- Phase 2 static pages — M effort
  - Tasks: move header/footer/home/about/forms/search/404 strings into locale JSON; update `aria-label` and alt text.
  - Acceptance criteria: all public static text is locale-driven and behaves correctly on mobile and desktop.
- Phase 3 dynamic content — M/L effort
  - Tasks: add `lang` query support to content endpoints and use English fallback for missing translations.
  - Acceptance criteria: lists/detail pages render cleanly in both languages without backend restructuring.
- Phase 4 SEO/QA — S/M effort
  - Tasks: verify `html lang`, canonical and Hreflang links, page metadata, and visual QA.
  - Acceptance criteria: site passes bilingual SEO and accessibility checks before sign-off.

### Confirmed project decisions
- Scope: public website only for the initial bilingual launch.
- Calendar requirement: Ethiopian calendar is required in the public site experience, with Gregorian dates kept only as a fallback or secondary display when needed.
- Translation owner: the project owner is the native Amharic reviewer and final quality approver.

### Risks and open questions
- Which public pages are institutionally sensitive enough to require an extra legal/communications sign-off beyond the native-language review?
- Are there approved program names or institutional labels that must remain in English for legal or official reasons even in the Amharic version?
- Will the backend team support a `lang` parameter for dynamic content during the first bilingual launch, or should that wait until a later phase?
- What is the exact target release schedule for the first public bilingual version, and is the Ethiopian calendar display expected in both static content and dynamic content modules?

### Sample translation JSON structure
> Amharic values below are placeholder copy only and require native review before production use.

```json
{
  "common": {
    "siteName": "Saint Anthony's Technical and Vocational College",
    "languageToggle": "English / አማርኛ"
  },
  "header": {
    "about": "About",
    "about_am": "ስለ ኮሌጁ (placeholder, needs native review)",
    "portal": "Portal login",
    "portal_am": "ፖርታል መግቢያ (placeholder, needs native review)"
  },
  "home": {
    "heroTitle": "Technical Education for Practical Futures.",
    "heroTitle_am": "የቴክኒካል ትምህርት ለተግባራዊ የወደፊት ዕድሎች (placeholder, needs native review)",
    "ctaPrograms": "Explore our programs",
    "ctaPrograms_am": "ፕሮግራሞችን ያስሱ (placeholder, needs native review)"
  },
  "contact": {
    "title": "Contact",
    "title_am": "አግኙን (placeholder, needs native review)",
    "info": "Get in touch with the college office.",
    "info_am": "ከኮሌጁ ቢሮ ጋር ያገኙት (placeholder, needs native review)"
  }
}
```

## Recommendation
The simplest professional path for this team is a route-prefixed bilingual public site built on small locale dictionaries, URL-first language switching, an Ethiopian-calendar-aware formatting layer, and a dedicated Ethiopic font stack. It keeps English as the default, respects the current frontend/backend architecture, and avoids backend restructuring or extra libraries before the project owner approves scope. With the confirmed launch scope and calendar requirement, the implementation should prioritize the public site, then handle dynamic content and wider portal coverage only after the first bilingual release passes review.
