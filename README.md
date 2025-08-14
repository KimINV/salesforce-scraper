# Salesforce Scraper (Advanced BRF Extractor)

An advanced Chrome Extension for Salesforce Lightning record detail pages with sophisticated text processing and intelligent field detection. Features advanced help text filtering, field label detection, and comprehensive section-based data organization. Completely local with no external dependencies.

## What it does
- Runs only on Lightning record detail views: `https://*.lightning.force.com/lightning/r/*/view`
- **Advanced Text Processing**: Intelligent filtering of help text, tooltips, and field labels
- **Smart Field Detection**: Prevents capturing field labels as values using sophisticated pattern matching
- **Section-Based Organization**: Automatically groups fields into logical sections:
  - **General**: Basic campaign/brief information (briefId, campaignName, account, etc.)
  - **Budget and Payments**: Financial data (budget, dailyBudgetCap, paymentProtocol, etc.)
  - **Discounts and Fees**: Pricing and discount information
  - **Funding**: Co-funding and contribution details
  - **Configuration Details**: Campaign setup and configuration
  - **Operations Details**: Operational links and asset information
  - **Chatter**: Latest feed items with author, timestamp, and content
- **Robust Field Mapping**: 100+ predefined field mappings with smart fallbacks
- **Help Text Immunity**: Advanced filtering prevents Salesforce help tooltips from contaminating data
- **Smart File Naming**: Uses actual Brief ID and Brief Item for meaningful filenames
- Triggers local download: `<briefId>_<briefItem>.json` (e.g., `BRF-026473_BI-043525.json`)
- Completely local: no network requests, no external libraries

## Key Advanced Features

### 🛡️ Advanced Help Text Filtering
**Problem Solved**: Salesforce help icons (?) often inject help text into field values, creating messy data like:
```
"assetsApproved": "Assets Approved?Help Assets Approved?Once the Mx has approved the assets..."
```

**Our Solution**: Multi-layer filtering system:
- **Pattern Recognition**: Detects "FieldName?Help FieldName?Description" patterns
- **Element Detection**: Identifies help/tooltip DOM elements by class and attributes
- **Text Sanitization**: Removes help text while preserving actual field values
- **Smart Fallbacks**: Multiple detection methods ensure comprehensive coverage

### 🎯 Field Label Detection
**Problem Solved**: Empty fields often capture their labels as values:
```
"agencyContract": "Agency Contract"  // This is the label, not a value!
```

**Our Solution**: Intelligent label detection:
- **Exact Matching**: Compares extracted text with field labels
- **Case Normalization**: Handles case differences between labels and text
- **Punctuation Tolerance**: Accounts for punctuation variations
- **Null Assignment**: Properly sets empty fields to `null`

### 🚫 Action Text Filtering  
**Problem Solved**: Salesforce UI elements often contain action buttons that pollute field values:
```
"opportunityName": "Keurig Dr. Pepper...2025Open Keurig Dr. Pepper...2025 PreviewOpen..."
```

**Our Solution**: Intelligent action text removal:
- **Element Detection**: Identifies buttons, links, and interactive elements
- **Pattern Recognition**: Removes "Open", "Preview", "Edit", "View" repetitions
- **Smart Scoring**: Prioritizes elements with the most actual content vs. action text
- **Content Preservation**: Maintains the core field value while removing UI noise

### 🔍 Smart Value Element Selection
- **Two-Pass Selection**: Strict filtering first, then fallback for edge cases
- **Help Element Avoidance**: Skips DOM elements marked as help/assistive
- **Action Element Filtering**: Avoids buttons and interactive UI elements
- **Content Validation**: Ensures extracted text is meaningful, not just labels
- **Link Prioritization**: Special handling for URL fields (Figma, external links)

### 📊 Section Intelligence
Automatic field organization using:
1. **Header Detection**: Finds section titles visually near fields
2. **Semantic Mapping**: Field names mapped to logical sections
3. **Geometric Analysis**: Visual layout analysis for ambiguous cases
4. **Schema Enforcement**: Ensures consistent structure across exports

## Install (Load Unpacked)
1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the project directory `salesforce-scraper/`

## Domain scoping (recommended)
**Security Best Practice**: Restrict to your specific Salesforce instance:

```json
{
  "host_permissions": ["https://yourcompany.lightning.force.com/*"],
  "content_scripts": [{
    "matches": ["https://yourcompany.lightning.force.com/lightning/r/*/view"]
  }]
}
```

For specific object types only:
```json
{
  "content_scripts": [{
    "matches": ["https://yourcompany.lightning.force.com/lightning/r/Brief_Item__c/*/view"]
  }]
}
  ```

Edit the file: `manifest.json`

## Output Format
Clean, flattened JSON structure with intelligent section organization:

```json
{
  "recordId": "a3IPg000000FM0HMAW",
  "source": {
    "url": "https://yourcompany.lightning.force.com/lightning/r/Brief_Item__c/a3IPg000000FM0HMAW/view",
    "timestamp": "2025-01-14T00:17:12.039Z"
  },
  "general": {
    "briefId": "BRF-026473",
    "briefItem": "BI-043525",
    "campaignName": "C4 Performance Campaign",
    "account": "Keurig Dr. Pepper",
    "opportunityOwner": "Halen Butorac",  // ← Clean text, no "Open Preview" noise!
    "startDate": "6/2/2025",
    "endDate": "6/15/2025",
    "figmaLink": "https://figma.com/file/xyz...",
    "assetsApproved": null,  // ← Clean null, not help text!
    "agencyContract": null   // ← Clean null, not "Agency Contract" label!
  },
  "budgetAndPayments": {
    "budget": null,
    "budgetPeriod": null,
    "dailyBudgetCap": null,
    "advertiserBudget": "USD 2,000.00",
    "paymentProtocol": null,
    "minimumCartSubtotal": null
  },
  "discountsAndFees": {
    "flatDiscountForConsumer": "USD 2.00",
    "incrementalMarketingFeePerRedemption": "USD 1.00"
  },
  "configurationDetails": {
    "applicableDoordashOrderTypes": "All",
    "itemLevelPromoType": "Mix & Match",
    "brands": "C4 Performance",
    "storePageBannerIncludedForPromo": "No"
  },
  "chatter": [
    {
      "author": "Rebecca Bustamante",
      "time": "2 months ago",
      "text": "Campaign is ready for launch. All assets approved."
    }
  ]
}
```

**Exported as**: `BRF-026473_BI-043525.json`

### ✨ Data Quality Highlights
- **No Help Text Contamination**: Fields contain actual values or `null`, never help descriptions
- **No Label Pollution**: Empty fields are `null`, not field label text
- **No Action Text Noise**: Clean field values without "Open", "Preview", "Edit" button text
- **Clean URLs**: Link fields contain actual URLs, not display text
- **Flattened Structure**: Direct access to sections without nested "sections" wrapper
- **Semantic File Names**: Files named with actual Brief IDs using hierarchy format `BRF-XXXX_BI-XXXX.json`

## Architecture & Advanced Logic

### Text Processing Pipeline
```
Raw DOM Text → Help Element Detection → Action Element Detection → Label Detection → Text Sanitization → Action Text Filtering → Value Assignment
```

#### 1. Help Element Detection (`isHelpElement`)
```javascript
// Detects help/tooltip elements by:
- Class names: 'slds-assistive-text', 'sr-only', 'helptext'
- ARIA labels: Contains 'help'  
- Data attributes: 'data-help-text'
- Role attributes: 'tooltip'
```

#### 2. Help Text Filtering (`filterOutHelpText`)
```javascript
// Removes patterns like:
- "FieldName?Help FieldName?Description..."
- "Campaign ProgramHelp Campaign Program..."
- "Edit FieldName" suffixes
- Short help text under 200 chars with "Help" keywords
```

#### 3. Action Element Detection (`isActionElement`)
```javascript
// Identifies interactive UI elements by:
- Tag names: 'button', 'a' (anchor links)
- Class names: Contains 'button', 'action', 'link', 'menu'
- Text content: Standalone action words like 'Open', 'Preview', 'Edit'
```

#### 4. Action Text Filtering (`filterOutActionText`)
```javascript
// Removes UI action text patterns:
- "Open [Name] Preview" repetitions
- "Open [Name] PreviewOpen [Name] Preview" duplications
- Standalone action words: Open, Preview, Edit, View, Show, More
- End-of-text action words cleanup
```

#### 5. Field Label Detection (`isFieldLabel`)  
```javascript
// Prevents label capture by:
- Exact text-to-label matching
- Case-insensitive comparison
- Punctuation normalization
- Length-based filtering for short labels
```

#### 6. Smart Value Selection (`findValueElement`)
```javascript
// Two-pass selection with scoring:
Pass 1: Strict filtering (clean, non-interactive content only)
Pass 2: Scoring system (prioritizes actual content over action text)
```

### Section Detection Logic
1. **Header Proximity**: Geometric analysis finds nearest section header above field
2. **Semantic Mapping**: 100+ field names mapped to appropriate sections
3. **Schema Enforcement**: Required fields added as `null` if missing

### Comprehensive Field Mapping
Pre-configured mappings include:
- **Campaign Fields**: Brief ID, Campaign Name, Account, Opportunity details
- **Financial Fields**: Budget, Daily Budget Cap, Payment Protocol, Pricing
- **Operational Fields**: Assets, Figma links, Asset folders, Configuration
- **Multiple Variants**: Both snake_case and camelCase supported

## Configuration

### Field Mapping Extension
Add custom field mappings in `buildFieldLabelMap()`:
```javascript
["Your Custom Field", "yourCustomField"],
["Another Field", "anotherField"]
```

### Section Configuration
- `SECTION_TITLE_TO_KEY`: Maps section headers to section keys
- `FIELD_KEY_TO_SECTION`: Maps field names to sections
- `SECTION_SCHEMAS`: Defines required fields per section

### Advanced Filtering Tuning
- `isHelpElement()`: Customize help element detection
- `filterOutHelpText()`: Adjust help text patterns
- `isActionElement()`: Customize action element detection
- `filterOutActionText()`: Adjust action text patterns
- `isFieldLabel()`: Modify label detection logic

## Troubleshooting

### Still Getting Help Text?
1. **Check Pattern Matching**: Help text might use unusual format
2. **Inspect DOM**: Use DevTools to examine help element structure
3. **Customize Patterns**: Add new patterns to `filterOutHelpText()`
4. **Element Detection**: Verify help elements have proper classes/attributes

### Still Getting Action Text?
1. **Check Element Detection**: Ensure action elements are properly identified
2. **Pattern Matching**: Action text might use unusual format
3. **Customize Patterns**: Add new patterns to `filterOutActionText()`
4. **Element Classes**: Verify action elements have proper CSS classes

### Field Labels as Values?
1. **Verify Label Mapping**: Check if field is in `FIELD_LABEL_TO_KEY`
2. **Case Sensitivity**: Ensure label normalization works correctly
3. **Custom Fields**: Add new field mappings as needed
4. **Debug Mode**: Check console logs for field detection details

### Missing Fields?
1. **DOM Structure**: Inspect field container and value element structure
2. **Selector Updates**: Customize `VALUE_SELECTORS` for your Lightning theme
3. **Visibility**: Ensure fields are expanded and visible
4. **Shadow DOM**: Some fields may be in closed shadow roots (not accessible)

### Wrong Section Assignment?
1. **Header Detection**: Check if section headers are properly detected
2. **Field Mapping**: Add field to `FIELD_KEY_TO_SECTION` for manual assignment
3. **Section Titles**: Verify section title patterns in `SECTION_TITLE_TO_KEY`

## Known Limitations
- **Shadow DOM**: Cannot access closed Lightning Web Component shadow roots
- **Dynamic Content**: Only captures currently visible/loaded content
- **Custom Components**: May need selector updates for highly customized orgs
- **Heavy Filtering**: Aggressive help text filtering may occasionally affect edge cases

## Advanced Usage

### Custom Help Text Patterns
Add organization-specific patterns:
```javascript
// In filterOutHelpText(), add:
.replace(/Your Custom Help Pattern/g, '')
```

### Custom Action Text Patterns
Add organization-specific action text patterns:
```javascript
// In filterOutActionText(), add:
.replace(/Your Custom Action Pattern/g, '')
.replace(/Custom Button Text/gi, '')
```

### Section Schema Customization
Define required fields for sections:
```javascript
SECTION_SCHEMAS.yourSection = [
  "requiredField1",
  "requiredField2"
];
```

### Multi-Language Support
Extend field mappings for different languages:
```javascript
// In buildFieldLabelMap():
["Campo Personalizado", "customField"],  // Spanish
["自定义字段", "customField"]              // Chinese
```

## Performance Features
- **Cached Headers**: Section headers cached for geometric analysis
- **Optimized Selectors**: Efficient DOM querying with fallbacks
- **Error Isolation**: All operations wrapped in try/catch blocks
- **Memory Management**: Cleanup of temporary DOM elements

## Privacy & Security
- **🔒 Zero Network Requests**: All processing happens locally in browser
- **📁 Local Storage Only**: Data saved directly to Downloads folder
- **🚫 No Telemetry**: No analytics, tracking, or data collection
- **⚡ No External Dependencies**: Self-contained extension
- **🛡️ Domain Restrictions**: Configurable to specific Salesforce instances

---

## Why This Advanced Version?

### The Problem
Standard Salesforce scrapers often produce messy data:
```json
{
  "assetsApproved": "Assets Approved?Help Assets Approved?Once the Mx has...",
  "agencyContract": "Agency Contract",
  "campaignProgram": "Campaign ProgramHelp Campaign Program...",
  "opportunityOwner": "Halen ButoracOpen Halen Butorac PreviewOpen Halen Butorac Preview"
}
```

### Our Solution
Clean, professional data extraction:
```json
{
  "assetsApproved": null,
  "agencyContract": null, 
  "campaignProgram": null,
  "opportunityOwner": "Halen Butorac"
}
```

This advanced version ensures **production-ready data quality** for business intelligence, reporting, and automation workflows.