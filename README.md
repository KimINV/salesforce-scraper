# BRF Scraper (SFDC)

A minimal, local-only Chrome Extension for Salesforce Lightning record detail pages. It adds a floating button “Export BRF JSON” at the bottom-right of the page and saves a structured JSON to your Downloads. No external services or libraries are used.

## What it does
- Runs only on Lightning record detail views: `https://*.lightning.force.com/lightning/r/*/view`
- Extracts:
  - Details: key–value pairs from the Details area (robust selectors; keys unified to camelCase)
  - Chatter: latest N feed items (author, time, text; N=20 by default)
- Triggers a local download: `brf-<recordId>-<timestamp>.json`
- Local-only: no network requests, no external libraries

Note: Brief Items and Sections are currently disabled from the final output per request.

## Install (Load Unpacked)
1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the project directory `brf-scraper/`

## Domain scoping (recommended)
By default, only the following are allowed and matched:
- `host_permissions`: `https://*.lightning.force.com/*`
- `content_scripts.matches`: `https://*.lightning.force.com/lightning/r/*/view`

It is recommended to replace the wildcard domain with your company's subdomain (e.g. `https://doordash.lightning.force.com/*`) and, if needed, restrict to specific object types:
- For example, to match only the Brief object, change `matches` to:
  ```
  "matches": ["https://doordash.lightning.force.com/lightning/r/Brief__c/*/view"]
  ```
- And change `host_permissions` to:
  ```
  "host_permissions": ["https://doordash.lightning.force.com/*"]
  ```

Edit the file: `manifest.json`

## Output format
The exported JSON contains only these top-level keys:
```json
{
  "recordId": "<parsed from URL or empty>",
  "source": { "url": "<current URL>", "timestamp": "<ISO8601>" },
  "details": { "camelCaseField": "value", "figmaLink": "https://..." },
  "chatter": [ { "author": "...", "time": "...", "text": "..." } ]
}
```
- Keys in `details` are unified to camelCase.
- A built-in label map stabilizes common fields (e.g., `Brief ID` → `briefId`).
- For link-like fields (e.g., `figmaLink`, `externalLandingPageLink`), the URL is preferred when available.

## How it works (Architecture & Logic)
- MV3, content-script only (no background worker).
- Files
  - `manifest.json`: MV3 config, match patterns, permissions, icons
  - `content.js`: UI injection, scraping, normalization, export
  - `ui.css`: styles for the floating button and toasts
  - `icons/`: local PNGs

- Lifecycle
  1) Script runs at `document_idle`
  2) Injects a floating button and a toast component
  3) A MutationObserver keeps the button present across Lightning re-renders

- Extraction pipeline
  1) `extractRecordIdFromUrl()` parses record id from `/lightning/r/<object>/<id>/view`
  2) `getLabelValuePairs()` collects label/value using tolerant selectors and container heuristics
  3) `mapPairsToDetails()` applies `FIELD_LABEL_TO_KEY`; otherwise auto-generates camelCase keys via `camelize()`
  4) `extractChatter()` collects latest N feed entries (author/time/text)
  5) Bundle → download as `brf-<recordId>-<timestamp>.json`

- Selector resilience
  - Labels: `.test-id__field-label`, `.slds-form-element__label`, `.slds-item_label`
  - Values: `.test-id__field-value`, `.slds-form-element__static`, `.slds-truncate`, `lightning-formatted-*`, `a[title]`, `a`, `span[title]`
  - Containers: `records-record-layout-item, .slds-form-element, .slds-form__row, .record-layout-item, .slds-grid`
  - Chatter: `.feedContainer, .forceChatterFeed, .chatterFeed, .cuf-feed`

- Normalization
  - `normalizeText()` trims and collapses whitespace
  - `normalizeLabel()` lowercases and strips trailing colon
  - `camelize()` converts arbitrary labels to camelCase

- Error handling
  - Toast summaries for success/failure; detailed logs in console
  - All selector queries are try/catch guarded

## Configuration points
- `CHATTER_MAX` controls number of posts (default 20)
- `FIELD_LABEL_TO_KEY` allows extending label→key mappings (EN/CN)
- Selector arrays can be adjusted if your Lightning skin differs

## Known limitations
- Cannot pierce closed LWC shadow roots; relies on visible light DOM
- Captures only currently visible content; no auto-expansion/pagination
- Scroll/expand sections that are lazy-loaded or collapsed before export

## Re-enabling optional features
- Sections grouping and Brief Items extraction are present in code but disabled from the final payload. Re-enable by wiring them back in `onExportClick()` if needed.

## FAQ & Customization
- If some fields are not captured:
  1) Inspect DOM structure/classes in DevTools Elements
  2) Adjust `LABEL_SELECTORS` / `VALUE_SELECTORS` / `FIELD_CONTAINER_SELECTORS` in `content.js`
  3) Add new mappings to `FIELD_LABEL_TO_KEY`
- Change Chatter count: edit `CHATTER_MAX` in `content.js` (default 20)

## Privacy & Compliance
- No network requests, no uploads, no third-party libs
- Everything runs locally in your browser
