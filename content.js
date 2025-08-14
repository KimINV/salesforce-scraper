(() => {
  const CHATTER_MAX = 20;

  const LABEL_SELECTORS = [
    ".test-id__field-label",
    ".slds-form-element__label",
    ".slds-item_label"
  ];

  const VALUE_SELECTORS = [
    ".test-id__field-value",
    ".slds-form-element__static",
    ".slds-truncate",
    "lightning-formatted-text",
    "lightning-formatted-number",
    "lightning-formatted-date-time",
    "lightning-formatted-url",
    "lightning-formatted-rich-text",
    "a[title]",
    "a",
    "span[title]"
  ];

  const FIELD_CONTAINER_SELECTORS = [
    "records-record-layout-item",
    ".slds-form-element",
    ".slds-form__row",
    ".record-layout-item",
    ".slds-grid"
  ];

  const BRIEF_CARD_CONTAINER_SELECTORS = [
    ".slds-card",
    ".forceRelatedListSingleContainer",
    ".relatedListContainer"
  ];

  const CHATTER_CONTAINER_SELECTORS = [
    ".feedContainer",
    ".forceChatterFeed",
    ".chatterFeed",
    ".cuf-feed"
  ];

  // Section title heuristics
  const SECTION_TITLE_SELECTORS = [
    ".slds-section__title",
    ".slds-section__title-action",
    ".slds-card__header",
    ".slds-card__header-title",
    ".slds-page-header__title",
    ".slds-text-heading_small",
    ".slds-text-heading_medium",
    ".slds-text-title",
    "[role='heading']",
    "h2",
    "h3",
    ".test-id__header-label",
    "span[title]"
  ];

  const SECTION_TITLE_TO_KEY = buildSectionTitleMap();
  const FIELD_KEY_TO_SECTION = buildFieldKeyToSectionMap();
  const SECTION_SCHEMAS = buildSectionSchemas();
  let CACHED_HEADERS = null;

  const FIELD_LABEL_TO_KEY = buildFieldLabelMap();

  function buildFieldLabelMap() {
    const map = new Map();
    const pairs = [
      ["Brief ID", "briefId"],
      ["BRF ID", "briefId"],
      ["Campaign Program", "campaignProgram"],
      ["Campaign Name", "campaignName"],
      ["Account", "account"],
      ["Opportunity Name", "opportunityName"],
      ["Opportunity Owner", "opportunityOwner"],
      ["Account Owner", "accountOwner"],
      ["Primary Vertical", "primaryVertical"],
      ["Configuration", "configuration"],
      ["Stage", "stage"],
      ["Start Date", "startDate"],
      ["End Date", "endDate"],
      ["Business ID List", "businessIdList"],
      ["Store ID List", "storeIdList"],
      ["Asset Review Status", "assetReviewStatus"],
      ["DD Team to Have CC’d on Reporting", "ddTeamCcOnReporting"],
      ["DD Team CC on Reporting", "ddTeamCcOnReporting"],
      ["Ops Asset Folder", "opsAssetFolder"],
      ["External Landing Page Link", "externalLandingPageLink"],
      ["Figma Link", "figmaLink"],
      ["Business Campaign Name", "businessCampaignName"],
      // Budget & Payments additions
      ["Budget", "budget"],
      ["Budget Period", "budgetPeriod"],
      ["Budget Notes", "budgetNotes"],
      ["Bid", "bid"],
      ["DoubleDash Bid", "doubleDashBid"],
      ["Categories Bid", "categoriesBid"],
      ["Non-DoubleDash Bid", "nonDoubleDashBid"],
      ["Collections Bid", "collectionsBid"],
      ["Search Bid", "searchBid"],
      ["Minimum Cart Subtotal", "minimumCartSubtotal"],
      ["Overall Max Number of Redemptions", "overallMaxNumberOfRedemptions"],
    ];

    for (const [label, key] of pairs) {
      map.set(normalizeLabel(label), key);
    }
    return map;
  }

  function buildSectionTitleMap() {
    const map = new Map();
    const pairs = [
      ["general", "general"],
      ["general (dri: submitter)", "general"],
      ["general (dri: requester)", "general"],
      ["budget and payments", "budgetAndPayments"],
      ["budget and payments (dri: submitter)", "budgetAndPayments"],
      ["discounts and fees", "discountsAndFees"],
      ["discounts & fees", "discountsAndFees"],
      ["funding", "funding"],
    ];
    for (const [title, key] of pairs) {
      map.set(normalizeLabel(title), key);
    }
    return map;
  }

  function buildFieldKeyToSectionMap() {
    const map = new Map();
    const add = (keys, section) => keys.forEach((k) => map.set(k.toLowerCase(), section));

    // General section common fields
    add([
      "briefId",
      "campaignProgram",
      "campaignName",
      "account",
      "opportunityName",
      "opportunityOwner",
      "accountOwner",
      "primaryVertical",
      "configuration",
      "stage",
      "startDate",
      "endDate",
      "businessIdList",
      "storeIdList",
      "assetReviewStatus",
      "ddTeamCcOnReporting",
      "opsAssetFolder",
      "externalLandingPageLink",
      "figmaLink",
      "businessCampaignName",
      // slug variants
      "brief",
      "opportunity_id",
      "quote_line",
      "quote_line_id",
      "netsuite_id",
      "agency_netsuite_id",
      "signed_contract",
      "agency_contract",
      "estimated_total_investment",
      "additional_notes_from_sales",
      "link_to_assets",
      "engagement_manager",
      "assets_approved",
      "currency",
      "tier",
      "entity_type",
      "owner",
      "banner_type",
      "product",
      "status",
      "brief_item",
      "in_campaign_change"
    ], "general");

    // Budget and Payments
    add([
      // snake
      "payment_protocol",
      "pricing_type",
      "daily_budget_cap",
      "advertiser_budget",
      "minimum_banner_fee",
      "unit_price",
      // camel
      "paymentProtocol",
      "pricingType",
      "dailyBudgetCap",
      "advertiserBudget",
      "minimumBannerFee",
      "unitPrice"
    ], "budgetAndPayments");

    // Discounts and Fees
    add([
      // snake
      "budget",
      "of_fee_to_invoice_advertiser",
      "%_of_fee_to_invoice_advertiser",
      // camel
      "ofFeeToInvoiceAdvertiser"
    ], "discountsAndFees");

    // Funding
    add([
      // snake
      "does_this_product_have_co_funding",
      "what_is_the_co_funding_split_type",
      "what_is_the_dd_co_funding_source",
      "dd_percent_contribution_to_ad_unit",
      "dd_percent_contribution_to_cx_discount",
      // camel
      "doesThisProductHaveCoFunding",
      "whatIsTheCoFundingSplitType",
      "whatIsTheDdCoFundingSource",
      "ddPercentContributionToAdUnit",
      "ddPercentContributionToCxDiscount"
    ], "funding");

    return map;
  }

  function buildSectionSchemas() {
    return {
      budgetAndPayments: [
        "budget",
        "budgetPeriod",
        "dailyBudgetCap",
        "paymentProtocol",
        "pricingType",
        "budgetNotes",
        "bid",
        "doubleDashBid",
        "categoriesBid",
        "nonDoubleDashBid",
        "collectionsBid",
        "searchBid",
        "minimumCartSubtotal",
        "overallMaxNumberOfRedemptions"
      ]
    };
  }

  function enforceSectionSchemas(sections) {
    try {
      const result = { ...sections };
      for (const [sectionKey, keys] of Object.entries(SECTION_SCHEMAS)) {
        if (result[sectionKey]) {
          for (const k of keys) {
            if (!(k in result[sectionKey])) {
              result[sectionKey][k] = null;
            }
          }
        }
      }
      return result;
    } catch (_) {
      return sections;
    }
  }

  function normalizeText(input) {
    if (!input) return "";
    return String(input).replace(/\s+/g, " ").trim();
  }

  function normalizeLabel(label) {
    return normalizeText(label).replace(/:$/, "").toLowerCase();
  }

  function camelize(label) {
    const base = normalizeLabel(label);
    const parts = base.split(/[^a-z0-9]+/gi).filter(Boolean);
    if (parts.length === 0) return "";
    const [first, ...rest] = parts;
    return first.toLowerCase() + rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");
  }

  function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style && style.visibility !== "hidden" && style.display !== "none";
  }

  function findClosestContainer(startEl, selectors) {
    let current = startEl;
    while (current && current !== document.body) {
      if (selectors.some((sel) => current.matches?.(sel))) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function findNearestHeadingFor(el) {
    // Walk up ancestors to find a title or a labeled region
    let current = el;
    for (let depth = 0; current && current !== document.body && depth < 15; depth += 1) {
      try {
        // aria-label/label hints
        const aria = current.getAttribute?.("aria-label") || current.getAttribute?.("data-label");
        if (aria && normalizeText(aria)) {
          return normalizeText(aria);
        }
        // heading inside current
        for (const sel of SECTION_TITLE_SELECTORS) {
          const h = current.querySelector?.(sel);
          if (h && isElementVisible(h)) {
            const t = normalizeText(h.textContent || "");
            if (t) return t;
          }
        }
        // previous siblings that might be titles
        let sib = current.previousElementSibling;
        let hops = 0;
        while (sib && hops < 3) {
          for (const sel of SECTION_TITLE_SELECTORS) {
            const h = sib.matches?.(sel) ? sib : sib.querySelector?.(sel);
            if (h && isElementVisible(h)) {
              const t = normalizeText(h.textContent || "");
              if (t) return t;
            }
          }
          sib = sib.previousElementSibling;
          hops += 1;
        }
      } catch (_) {}
      current = current.parentElement;
    }
    return "";
  }

  function extractRecordIdFromUrl(url) {
    try {
      const u = url || window.location.href;
      // /lightning/r/<objectApiName>/<recordId>/view
      const m = u.match(/\/lightning\/r\/[^/]+\/([^/]+)\/view/i);
      return m ? m[1] : "";
    } catch (e) {
      console.error("[BRF] extractRecordIdFromUrl error:", e);
      return "";
    }
  }

  function isHelpElement(el) {
    if (!el) return false;
    
    // Check for specific help/tooltip related classes and attributes
    const className = el.className || "";
    const ariaLabel = el.getAttribute?.("aria-label") || "";
    const dataHelp = el.getAttribute?.("data-help-text") || "";
    const role = el.getAttribute?.("role") || "";
    
    // More specific help element indicators
    const specificHelpIndicators = [
      'slds-assistive-text', 'sr-only', 'screen-reader-only',
      'helptext', 'tooltip', 'popover-trigger'
    ];
    
    // Only flag as help element if it has very specific help-related attributes
    return specificHelpIndicators.some(indicator => 
      className.toLowerCase().includes(indicator)
    ) || 
    ariaLabel.toLowerCase().includes('help') ||
    role === 'tooltip' ||
    dataHelp.length > 0;
  }

  function isFieldLabel(text, labelRaw) {
    if (!text || !labelRaw) return false;
    
    const normalizedText = normalizeLabel(text);
    const normalizedLabel = normalizeLabel(labelRaw);
    
    // Exact match
    if (normalizedText === normalizedLabel) {
      return true;
    }
    
    // Check if text is just the label without punctuation
    const cleanLabel = normalizedLabel.replace(/[^a-z0-9\s]/gi, '').trim();
    const cleanText = normalizedText.replace(/[^a-z0-9\s]/gi, '').trim();
    
    if (cleanText === cleanLabel) {
      return true;
    }
    
    // Check common label patterns where text might be slightly different from the label
    // e.g., "Agency Contract" vs "agency contract"
    if (cleanText.toLowerCase() === cleanLabel.toLowerCase()) {
      return true;
    }
    
    return false;
  }

  function filterOutHelpText(text) {
    if (!text) return "";
    
    // Pattern to match exact help text format: "FieldName?Help FieldName?Description"
    const exactHelpPattern = /^(.+?)\?\s*Help\s+\1\?(.*)$/i;
    const exactMatch = text.match(exactHelpPattern);
    
    if (exactMatch) {
      // This is clearly help text, return empty
      return "";
    }
    
    // Pattern for help text that starts with field name and contains help
    // e.g., "Campaign ProgramHelp Campaign Program..."
    const helpPattern = /^(.+?)Help\s+\1(.*)$/i;
    const helpMatch = text.match(helpPattern);
    
    if (helpMatch) {
      const fieldLabel = helpMatch[1].trim();
      const remainingText = helpMatch[2].trim();
      
      // If it's just the field label + help, return empty
      if (!remainingText || remainingText.startsWith('?') || fieldLabel.length < 50) {
        return "";
      }
    }
    
    // Another pattern: "FieldNameHelp FieldNameDescription"
    const noQuestionHelpPattern = /^(.+?)Help\s+(.+?)([A-Z][^.]*\.?)(.*)$/;
    const noQuestionMatch = text.match(noQuestionHelpPattern);
    
    if (noQuestionMatch && noQuestionMatch[1].trim() === noQuestionMatch[2].trim()) {
      // This is field label + help text, return empty
      return "";
    }
    
    // Remove specific help text patterns but preserve content
    let cleanedText = text
      .replace(/Help\s+[^?]*\?\s*[^.]*\./g, '') // Remove "Help FieldName? Description."
      .replace(/\s*Edit\s+[^.]*$/g, '') // Remove "Edit FieldName" at the end
      .trim();
    
    // If after cleaning we have substantial content, return it
    if (cleanedText && cleanedText.length > 3 && !cleanedText.match(/^[^?]*\?\s*$/)) {
      return cleanedText;
    }
    
    // For short text, be more careful about filtering
    if (text.length < 200 && text.includes('Help') && /Help\s+[A-Z]/.test(text)) {
      return "";
    }
    
    return text.trim();
  }

  function pickBestText(valueEl) {
    if (!valueEl) return "";
    
    // Skip help/tooltip elements
    if (isHelpElement(valueEl)) {
      return "";
    }
    
    // Prefer title for date/time if present
    const title = valueEl.getAttribute?.("title");
    if (title && /\d{4}-\d{1,2}-\d{1,2}|\d{1,2}:\d{2}/.test(title)) {
      return normalizeText(title);
    }
    
    // Get text content and filter out help text and action text
    const text = normalizeText(valueEl.textContent || valueEl.innerText || "");
    let cleanedText = filterOutHelpText(text);
    cleanedText = filterOutActionText(cleanedText);
    
    return cleanedText;
  }

  function containsActionText(text) {
    if (!text) return false;
    
    const actionPatterns = [
      /\bopen\b/gi,
      /\bpreview\b/gi,
      /\bedit\b/gi,
      /\bview\b/gi,
      /\bshow\b/gi,
      /\bmore\b/gi,
      /\bactions\b/gi
    ];
    
    return actionPatterns.some(pattern => pattern.test(text));
  }

  function filterOutActionText(text) {
    if (!text) return "";
    
    // Remove common action text patterns
    let cleanedText = text
      // Remove "Open [Name] Preview" patterns
      .replace(/(.+?)Open\s+\1\s+Preview/gi, '$1')
      // Remove "Open [Name] PreviewOpen [Name] Preview" repetitions
      .replace(/(.+?)(?:Open\s+\1(?:\s+Preview)?)+/gi, '$1')
      // Remove standalone action words
      .replace(/\s+(Open|Preview|Edit|View|Show|More|Actions)\s+/gi, ' ')
      // Remove action words at the end
      .replace(/\s+(Open|Preview|Edit|View|Show|More|Actions)$/gi, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanedText;
  }

  function isActionElement(el) {
    if (!el) return false;
    
    const tagName = el.tagName?.toLowerCase();
    const className = el.className || "";
    const text = normalizeText(el.textContent || "");
    
    // Skip interactive elements
    if (tagName === 'button' || tagName === 'a') {
      return true;
    }
    
    // Skip elements with action-related classes
    if (className.includes('button') || className.includes('action') || 
        className.includes('link') || className.includes('menu')) {
      return true;
    }
    
    // Skip elements with action text
    const actionTexts = ['open', 'preview', 'edit', 'view', 'show', 'more', 'actions'];
    if (actionTexts.some(action => text.toLowerCase() === action)) {
      return true;
    }
    
    return false;
  }

  function findValueElement(container) {
    if (!container) return null;
    
    // First pass: try to find clean, non-interactive elements
    for (const sel of VALUE_SELECTORS) {
      try {
        const elements = container.querySelectorAll(sel);
        for (const el of elements) {
          if (el && isElementVisible(el) && !isHelpElement(el) && !isActionElement(el)) {
            const text = normalizeText(el.textContent || el.innerText);
            const cleanedText = filterOutHelpText(text);
            if (cleanedText && !containsActionText(cleanedText)) {
              return el;
            }
          }
        }
      } catch (e) {
        console.debug("[BRF] VALUE_SELECTORS try failed:", sel, e);
      }
    }
    
    // Second pass: find the best element even if it contains some action text
    let bestElement = null;
    let bestScore = -1;
    
    for (const sel of VALUE_SELECTORS) {
      try {
        const elements = container.querySelectorAll(sel);
        for (const el of elements) {
          if (el && isElementVisible(el) && !isHelpElement(el)) {
            const text = normalizeText(el.textContent || el.innerText);
            const cleanedText = filterOutActionText(text);
            
            if (cleanedText && !text.match(/^[^?]*\?\s*Help\s+[^?]*\?/)) {
              // Score based on text length and cleanliness
              const score = cleanedText.length - (text.length - cleanedText.length) * 2;
              if (score > bestScore) {
                bestScore = score;
                bestElement = el;
              }
            }
          }
        }
      } catch (e) {
        console.debug("[BRF] VALUE_SELECTORS scoring failed:", sel, e);
      }
    }
    
    return bestElement;
  }

  function tryFindLink(container) {
    if (!container) return { href: "", text: "" };
    // Prioritize specific formatted url and anchors
    const linkEl =
      container.querySelector("lightning-formatted-url a") ||
      container.querySelector("a[title]") ||
      container.querySelector("a");
    if (linkEl) {
      return {
        href: linkEl.getAttribute("href") || "",
        text: normalizeText(linkEl.textContent || "")
      };
    }
    return { href: "", text: "" };
  }

  function getLabelValuePairs() {
    const pairs = [];
    let labelNodes = [];
    try {
      labelNodes = document.querySelectorAll(LABEL_SELECTORS.join(","));
    } catch (e) {
      console.error("[BRF] LABEL_SELECTORS failed:", e);
      labelNodes = [];
    }

    const seen = new Set();
    labelNodes.forEach((labelEl) => {
      try {
        const labelRaw = normalizeText(labelEl.textContent || labelEl.innerText);
        if (!labelRaw) return;
        const normalized = normalizeLabel(labelRaw);
        if (!normalized) return;

        // Dedup by same label text and container
        const container = findClosestContainer(labelEl, FIELD_CONTAINER_SELECTORS);
        const containerKey = container ? `${normalized}::${pairs.length}::${container.className}` : normalized;
        if (seen.has(containerKey)) return;
        seen.add(containerKey);

        const valueEl = findValueElement(container) || container; // fallback to container text
        let textValue = pickBestText(valueEl);

        // Try link extraction
        const { href, text } = tryFindLink(container);
        if (href) {
          // If it's a known link field (Figma/External), prefer href as value
          if (/(figma|external|link)/i.test(normalized)) {
            textValue = href;
          } else if (!textValue) {
            textValue = text || href;
          }
        }

        // Final cleanup: filter out labels, help text, and empty values
        if (!textValue || 
            textValue.trim() === "" ||
            // Filter if it's exactly the field label
            isFieldLabel(textValue, labelRaw) ||
            // Filter help text patterns
            /^[^?]*\?\s*Help\s+[^?]*\?/.test(textValue) ||
            // Filter text that still contains help patterns
            (/Help\s+[^?]*\?/.test(textValue) && textValue.length < 200)) {
          textValue = "";
        }

        // Dynamic grouping: first try nearest/ancestor heading; if not found, fall back to geometric nearest header
        let sectionTitle = findNearestHeadingFor(container || labelEl) || "";
        if (!sectionTitle) {
          sectionTitle = findHeaderByGeometry(container || labelEl) || "";
        }

        pairs.push({
          label: labelRaw.replace(/:$/, ""),
          value: textValue,
          href,
          sectionTitle
        });
      } catch (e) {
        console.debug("[BRF] getLabelValuePairs node error:", e);
      }
    });

    return pairs;
  }

  function mapPairsToDetails(pairs) {
    const details = {};
    for (const { label, value, href } of pairs) {
      const normalized = normalizeLabel(label);
      const mappedKey = FIELD_LABEL_TO_KEY.get(normalized) || camelize(label);
      let finalValue = null;
      
      // prefer href for specific link fields
      if (/(figma_link|external_landing_page_link|figma|external)/i.test(mappedKey) && href) {
        finalValue = href;
      } else if (value && value.trim() && !isFieldLabel(value, label)) {
        finalValue = value;
      }
      
      details[mappedKey] = finalValue;
    }
    return details;
  }

  function extractDetails() {
    try {
      const pairs = getLabelValuePairs();
      return mapPairsToDetails(pairs);
    } catch (e) {
      console.error("[BRF] extractDetails error:", e);
      return {};
    }
  }

  function mapSectionTitleToKey(title) {
    const cleaned = normalizeSectionTitle(title || "");
    const t = normalizeLabel(cleaned);
    if (!t) return "other";
    return SECTION_TITLE_TO_KEY.get(t) || camelize(t);
  }

  function normalizeSectionTitle(raw) {
    const txt = normalizeText(raw || "");
    // drop parenthetical hints like "(DRI: Submitter)" or Chinese full-width parentheses
    const withoutParens = txt
      .replace(/\([^)]*\)/g, "")
      .replace(/（[^）]*）/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return withoutParens || txt;
  }

  function getAllSectionHeaders() {
    try {
      const headers = [];
      const seen = new Set();
      const selector = SECTION_TITLE_SELECTORS.join(",");
      document.querySelectorAll(selector).forEach((node) => {
        try {
          const text = normalizeSectionTitle(node.getAttribute("title") || node.textContent || "");
          const title = normalizeText(text);
          if (!title) return;
          const key = camelize(title);
          const rect = node.getBoundingClientRect();
          const sig = `${key}@${Math.round(rect.top)}@${Math.round(rect.left)}`;
          if (seen.has(sig)) return;
          seen.add(sig);
          headers.push({ node, title, key, rect, cx: rect.left + rect.width / 2, top: rect.top });
        } catch (_) {}
      });
      headers.sort((a, b) => (a.top - b.top) || (a.cx - b.cx));
      return headers;
    } catch (e) {
      console.debug("[BRF] getAllSectionHeaders error", e);
      return [];
    }
  }

  function ensureHeadersCache() {
    if (!CACHED_HEADERS || CACHED_HEADERS.length === 0) {
      CACHED_HEADERS = getAllSectionHeaders();
    }
    return CACHED_HEADERS;
  }

  function findHeaderByGeometry(refEl) {
    try {
      const headers = ensureHeadersCache();
      if (!refEl || headers.length === 0) return "";
      const r = refEl.getBoundingClientRect();
      const refCx = r.left + r.width / 2;
      const refTop = r.top;
      let best = null;
      let bestScore = Infinity;
      for (const h of headers) {
        // only consider headers above the field
        if (h.top > refTop + 8) continue;
        const dx = Math.abs(h.cx - refCx);
        const dy = Math.max(0, refTop - h.top);
        // weight vertical proximity more than horizontal alignment
        const score = dy * 2 + dx;
        if (score < bestScore) {
          bestScore = score;
          best = h;
        }
      }
      return best ? best.title : "";
    } catch (e) {
      return "";
    }
  }

  function extractSections(pairsOpt) {
    try {
      const pairs = Array.isArray(pairsOpt) ? pairsOpt : getLabelValuePairs();
      const grouped = {};
      for (const { label, value, href, sectionTitle } of pairs) {
        let sectionKey = mapSectionTitleToKey(sectionTitle);
        if (!grouped[sectionKey]) grouped[sectionKey] = {};
        const normalized = normalizeLabel(label);
        const mappedKey = FIELD_LABEL_TO_KEY.get(normalized) || camelize(label);
        // If heading-based section is unknown, try field-based mapping
        if (!sectionTitle || sectionKey === "other") {
          const fallback = FIELD_KEY_TO_SECTION.get((mappedKey || "").toLowerCase());
          if (fallback) {
            sectionKey = fallback;
            if (!grouped[sectionKey]) grouped[sectionKey] = {};
          }
        }
        
        let finalValue = null;
        if (/(figma_link|external_landing_page_link|figma|external)/i.test(mappedKey) && href) {
          finalValue = href;
        } else if (value && value.trim() && !isFieldLabel(value, label)) {
          finalValue = value;
        }
        
        grouped[sectionKey][mappedKey] = finalValue;
      }
      return enforceSectionSchemas(grouped);
    } catch (e) {
      console.error("[BRF] extractSections error:", e);
      return {};
    }
  }

  function findCardByTitle(keywords) {
    const containers = [];
    for (const sel of BRIEF_CARD_CONTAINER_SELECTORS) {
      try {
        document.querySelectorAll(sel).forEach((el) => containers.push(el));
      } catch (e) {
        console.debug("[BRF] Card container query failed:", sel, e);
      }
    }
    const textMatches = (t) => {
      const s = normalizeText(t).toLowerCase();
      return keywords.some((kw) => s.includes(kw));
    };
    for (const box of containers) {
      try {
        const headerText = normalizeText(
          box.querySelector(".slds-card__header, .header, .slds-card__header-title")?.textContent || ""
        );
        if (headerText && textMatches(headerText)) {
          return box;
        }
      } catch (_) {}
      // try any heading inside
      try {
        const heading = box.querySelector("h2, h3, h4, .slds-text-heading_small, .slds-text-title");
        if (heading && textMatches(heading.textContent || "")) {
          return box;
        }
      } catch (_) {}
    }
    return null;
  }

  function extractBriefItems() {
    const result = [];
    try {
      const container = findCardByTitle([
        "brief items",
        "brief item",
        "brief",
        "简报",
        "briefs"
      ]);
      if (!container) return result;

      // Try table rows first
      const rows =
        container.querySelectorAll("table tbody tr") ||
        container.querySelectorAll("[role='row']") ||
        [];

      if (rows && rows.length) {
        rows.forEach((tr) => {
          try {
            const cells = Array.from(tr.querySelectorAll("td"));
            if (!cells.length) return;
            const firstLink = tr.querySelector("a");
            const name = normalizeText(firstLink?.textContent || cells[0]?.textContent || "");
            const link = firstLink?.getAttribute("href") || "";
            const product = normalizeText(cells[1]?.textContent || "");
            const status = normalizeText(cells[2]?.textContent || "");
            if (name) {
              result.push({ name, product, status, link });
            }
          } catch (_) {}
        });
        return result;
      }

      // Fallback: card list items
      const items = container.querySelectorAll("li, .slds-item, .slds-media");
      items.forEach((li) => {
        try {
          const a = li.querySelector("a");
          const name = normalizeText(a?.textContent || li.querySelector(".slds-truncate")?.textContent || "");
          const link = a?.getAttribute("href") || "";
          const text = normalizeText(li.textContent || "");
          // heuristic extraction of product/status
          const productMatch = text.match(/product[:：]\s*([^\|]+?)(\||$)/i);
          const statusMatch = text.match(/status[:：]\s*([^\|]+?)(\||$)/i);
          const product = productMatch ? normalizeText(productMatch[1]) : "";
          const status = statusMatch ? normalizeText(statusMatch[1]) : "";
          if (name) {
            result.push({ name, product, status, link });
          }
        } catch (_) {}
      });
    } catch (e) {
      console.error("[BRF] extractBriefItems error:", e);
    }
    return result;
  }

  function stripNonContentText(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    // remove buttons/menus/links meant for UI chrome
    clone.querySelectorAll("button, .slds-button, .moreActions, .feed-actions, .footer, .uiPopupTrigger").forEach((n) => n.remove());
    // strip scripts/style
    clone.querySelectorAll("script, style").forEach((n) => n.remove());
    return normalizeText(clone.textContent || "");
    }

  function extractChatter(maxCount = CHATTER_MAX) {
    const results = [];
    try {
      let container = null;
      for (const sel of CHATTER_CONTAINER_SELECTORS) {
        try {
          container = document.querySelector(sel);
          if (container) break;
        } catch (_) {}
      }
      if (!container) return results;

      const items =
        container.querySelectorAll(".feedItem, .cuf-feedElement, .cuf-feedItem, article, .feeditem") ||
        [];
      for (const item of items) {
        try {
          const author =
            normalizeText(
              item.querySelector(".publisher-name")?.textContent ||
                item.querySelector(".feedItemBody .byline a")?.textContent ||
                item.querySelector(".actorName")?.textContent ||
                item.querySelector("a.profileLink")?.textContent ||
                ""
            ) || "";

          const timeEl =
            item.querySelector("time") ||
            item.querySelector(".timestamp") ||
            item.querySelector("abbr[data-original-title]") ||
            item.querySelector(".feedDate");
          const time =
            (timeEl?.getAttribute?.("title") || timeEl?.getAttribute?.("data-original-title") || "") ||
            normalizeText(timeEl?.textContent || "");

          const bodyEl =
            item.querySelector(".feedItemBody, .feedBody, .cuf-feedItemContent, .feedBodyInner") || item;
          const text = stripNonContentText(bodyEl);

          if (author || time || text) {
            results.push({ author, time, text });
          }
          if (results.length >= maxCount) break;
        } catch (_) {}
      }
    } catch (e) {
      console.error("[BRF] extractChatter error:", e);
    }
    return results;
  }

  function downloadJSON(data, filename) {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[BRF] downloadJSON error:", e);
      throw e;
    }
  }

  function ensureButton() {
    if (document.getElementById("brf-export-button")) return;

    const btn = document.createElement("button");
    btn.id = "brf-export-button";
    btn.type = "button";
    btn.textContent = "Export BRF JSON";
    btn.addEventListener("click", onExportClick, { passive: true });
    document.documentElement.appendChild(btn);
  }

  function showToast(message, type = "info", timeout = 3000) {
    try {
      const toast = document.createElement("div");
      toast.className = `brf-toast brf-toast-${type}`;
      toast.textContent = message;
      document.documentElement.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("show");
      }, 20);
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, timeout);
    } catch (e) {
      console.log(`[BRF] ${type}: ${message}`);
    }
  }

  async function onExportClick(evt) {
    const btn = evt?.currentTarget;
    try {
      btn && (btn.disabled = true);
      showToast("Exporting BRF JSON...", "info", 1500);

      const recordId = extractRecordIdFromUrl(window.location.href);
      const pairs = getLabelValuePairs();
      const details = mapPairsToDetails(pairs);
      const chatter = extractChatter(CHATTER_MAX);
      const sections = extractSections(pairs);

      const payload = {
        recordId: recordId || "",
        source: {
          url: window.location.href,
          timestamp: new Date().toISOString()
        },
        // details,
        sections,
        chatter
      };

      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `brf-${recordId || "unknown"}-${ts}.json`;
      downloadJSON(payload, fileName);

      showToast("BRF JSON exported.", "success", 2000);
    } catch (e) {
      console.error("[BRF] Export failed:", e);
      showToast(`Export failed: ${e?.message || e}`, "error", 4000);
    } finally {
      btn && (btn.disabled = false);
    }
  }

  function init() {
    try {
      ensureButton();
      // Occasionally Lightning re-renders; keep the button present
      const observer = new MutationObserver(() => {
        ensureButton();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {
      console.error("[BRF] init error:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

