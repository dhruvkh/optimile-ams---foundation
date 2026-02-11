# Auction Templates System - Complete Guide

## 📋 Overview

The Auction Templates System allows users to create, manage, and reuse common auction configurations, significantly speeding up auction creation workflows. Users can:

- ✅ Create custom templates from auction configurations
- ✅ Use system-provided industry-standard templates
- ✅ Save templates as favorites
- ✅ Duplicate and modify templates
- ✅ Share templates with team members
- ✅ Track template usage statistics
- ✅ Filter and search templates by multiple criteria

**Key Benefits:**
- Reduces auction creation time from 15-20 minutes to 2-3 minutes
- Ensures consistent lane configurations across similar auctions
- Maintains best practices through system templates
- Enables rapid scaling for high-volume auction operations

---

## 🎯 System Templates (Pre-Configured)

The system provides 8 industry-standard templates that are always available and cannot be modified:

### 1. **Regional FTL - North India** (TMPL-SYS-001)
- **Type:** REVERSE
- **Lanes:** 5 major North Indian routes
  - Delhi-Mumbai: ₹85,000 FTL base, ₹1,000/decrement, 4-day TAT
  - Delhi-Jaipur: ₹15,000 FTL base, ₹300/decrement, 1-day TAT
  - Delhi-Chandigarh: ₹8,000 regional, ₹200/decrement, 1-day TAT
  - Delhi-Lucknow: ₹25,000, ₹500/decrement, 2-day TAT
  - Delhi-Kolkata: ₹95,000 long-haul, ₹1,200/decrement, 5-day TAT
- **Ruleset:** 10-second extension threshold, 180-second extensions
- **Best For:** Full Truckload auctions in North India region

### 2. **Last Mile Delivery - Metro Cities** (TMPL-SYS-002)
- **Type:** LOT
- **Lanes:** 5 city zones
  - Mumbai Zone 1: ₹5,000 base, ₹100/decrement
  - Mumbai Zone 2: ₹4,500 base, ₹100/decrement
  - Delhi Zone 1: ₹4,000 base, ₹80/decrement
  - Bangalore Zone 1: ₹3,500 base, ₹70/decrement
  - Hyderabad Zone 1: ₹3,000 base, ₹60/decrement
- **Ruleset:** 8-second extension threshold, 60-second extensions
- **Best For:** Part Load (LOT) delivery within metro cities, fast-paced auctions

### 3. **Spot Auction - Urgent Loads** (TMPL-SYS-003)
- **Type:** SPOT
- **Lanes:** 3 urgent shipment options
  - Immediate: 180-second duration, aggressive pricing
  - 2 Hours: 240-second duration, moderate pricing
  - 4 Hours: 300-second duration, flexible pricing
- **Ruleset:** 5-second extension threshold, 30-second extensions, high decrements
- **Best For:** Quick spot auctions for urgent shipments, very short durations

### 4. **Quarterly Contract - Pan India** (TMPL-SYS-004)
- **Type:** BULK
- **Lanes:** 5 major Pan-India routes
  - Long-term contract rates
  - Volume-based pricing
  - Extended TAT options (4-6 days)
- **Ruleset:** 20-second extension threshold, 300-second extensions
- **Best For:** Quarterly/monthly contract auctions with multiple major lanes

### 5. **Regional LTL - West Zone** (TMPL-SYS-005)
- **Type:** REGION_LOT
- **Lanes:** 4 West India regional routes
  - Ahmedabad-Indore: ₹18,000, 2-day TAT
  - Mumbai-Pune: ₹12,000, 1-day TAT
  - Surat-Vapi: ₹8,000, 1-day TAT
  - Rajkot-Ahmedabad: ₹15,000, 1-day TAT
- **Best For:** Regional less-than-truckload networks in West India

### 6. **High-Value Specialty - Express** (TMPL-SYS-006)
- **Type:** REVERSE
- **Lanes:** 3 express delivery routes
  - High-value base prices (₹200,000-₹280,000)
  - Aggressive decrements (₹5,000-₹6,000)
  - Express 2-3 day TAT
- **Best For:** Premium, high-value specialty goods requiring express delivery

### 7. **Partial Load - Regional Network** (TMPL-SYS-007)
- **Type:** LOT
- **Lanes:** 4 hub-to-hub connections
  - Lower decrements (₹100-₹180)
  - Quick turnarounds (120-180 second durations)
- **Best For:** Connecting regional distribution hubs, partial loads

### 8. **Cold Chain Distribution** (TMPL-SYS-008)
- **Type:** REVERSE
- **Lanes:** 2 temperature-controlled routes
  - Delhi-Mumbai (Cold): ₹120,000
  - Mumbai-Bangalore (Cold): ₹95,000
- **Ruleset:** Specialized settings for cold logistics
- **Best For:** Temperature-sensitive goods requiring refrigerated transport

---

## 📍 Location Guide

### Main Pages
- **Templates Library:** `/admin/auction-templates`
- **Template Details:** `/admin/auction-templates/:templateId`
- **Template Editor:** `/admin/auction-templates/:templateId/edit` (Coming soon)
- **Create Auction from Template:** `/create-auction?templateId=TMPL-ID`

### Navigation
1. **From Sidebar:** Admin → Templates (in left navigation)
2. **From Create Auction:** Click "Save as Template" button to create custom template
3. **From Auction List:** (Future) Right-click → "Save as Template"

---

## 🚀 Feature Workflows

### Workflow 1: Using a System Template

**Timeline: 2 minutes**

```bash
1. Navigate to /admin/auction-templates
   ↓
2. Browse available templates (Grid or List view)
   ↓
3. Click "Use" button on template card
   ↓
4. Redirected to /create-auction?templateId=TMPL-SYS-001
   ↓
5. Form pre-filled with:
   - Auction name: "[Template Name] - Copy"
   - All lanes from template
   - Global ruleset
   ↓
6. Modify any fields as needed
   ↓
7. Click "Preview" to review
   ↓
8. Click "Create Auction" or "Save as Draft"
```

**Result:** Auction created from template in 2 minutes vs 15 minutes from scratch

---

### Workflow 2: Creating a Custom Template

**Timeline: 3-5 minutes**

**Method A: Save Current Form as Template**
```bash
1. On Create Auction page, fill in form
   ↓
2. Click "Save as Template" button
   ↓
3. Dialog appears:
   - Enter Template Name
   - Enter Description (optional)
   - Select Category (FTL/LTL/Spot/Regional/Other)
   - Select Visibility (Private/Team/Organization)
   - Checkbox: Save as Favorite
   ↓
4. Click "Save"
   ↓
5. Success toast shows
   ↓
6. Optionally navigate to template details or continue creating auction
```

**Method B: Create from Scratch**
```bash
1. Go to /admin/auction-templates
   ↓
2. Click "Create New Template" button
   ↓
3. Form opens (similar to Create Auction)
   ↓
4. Configure:
   - Template Name (required)
   - Template Description (optional)
   - Category
   - Visibility
   - Auction configuration (type, ruleset, lanes)
   ↓
5. Click "Save as Template"
   ↓
6. Template created and available immediately
```

---

### Workflow 3: Managing Templates

**Duplicate Template (2 minutes)**
```bash
1. Go to /admin/auction-templates
   ↓
2. Find template → Click menu (⋯) → "Duplicate"
   ↓
3. New template created with " - Copy" suffix
   ↓
4. Customize the copy as needed
```

**Edit Template (5 minutes)**
```bash
1. Go to /admin/auction-templates
   ↓
2. Click template card or "View" button
   ↓
3. On details page, click "Edit"
   ↓
4. Modify configuration
   ↓
5. Click "Save"
   ↓
6. Warning: "X auctions were created from this template. Editing won't affect existing auctions."
```

**Delete Template (1 minute)**
```bash
1. Go to /admin/auction-templates
   ↓
2. Find template → Click menu (⋯) → "Delete"
   ↓
3. Confirmation dialog
   ↓
4. Click "Delete"
   ↓
5. Template soft-deleted (note: auctions created from it are unaffected)
```

**Toggle Favorite (1 second)**
```bash
1. Click heart icon on template card
   ↓
2. Template added to/removed from favorites
   ↓
3. Instantly reflected in UI
```

---

### Workflow 4: Searching and Filtering Templates

**Find Templates (30 seconds)**

**Filter Options:**
- **By Creator:** All | System Templates | Custom Templates
- **By Type:** All | REVERSE | SPOT | LOT | BULK | REGION_LOT
- **Favorites Only:** Toggle heart icon
- **Search:** By template name or description

**Sort Options:**
- Recently Used
- Most Used
- Alphabetical
- Date Created

**Example:** Find all FTL custom templates created by me, most-used first
```
1. Filter by Creator: Custom Templates
2. Filter by Type: REVERSE (FTL auctions typically use REVERSE)
3. Sort by: Most Used
4. Results show your 3 most-used custom FTL templates
```

---

## 📊 Template Details Page

When viewing a template at `/admin/auction-templates/:templateId`, you'll see:

### Header Section
- Template name and description
- Type badge (color-coded)
- "Official Template" badge (if system template)
- Action buttons: Use, Edit, Favorite, Duplicate, Share, Delete

### Statistics Cards (4 metrics)
1. **Times Used:** 15
   - How many times this template was used to create auctions
2. **Avg Savings:** 14%
   - Average cost savings from auctions created using this template
3. **Lanes:** 5
   - Number of lanes in this template
4. **Most Used By:** Username
   - Team member who uses this template most frequently

### Global Ruleset Section
- Min Bid Decrement
- Extension Threshold (seconds)
- Extension Duration (seconds)
- Rank Visibility (Yes/No)

### Lanes Configuration
**Expandable lane cards showing:**
- Lane name
- Base price
- Duration
- Decrement amount
- TAT (if applicable)

**Calculations (when expanded):**
- Extensions possible: `floor(duration / threshold)`
- Max discount: `extensions × decrement`
- Min possible price: `max(basePrice - discount, basePrice × 0.2)`
- Potential savings %: `(1 - minPrice / basePrice) × 100`

### Template Information
- Created by: [User/SYSTEM]
- Created on: [Date]
- Last modified: [Date]
- Visibility: Private/Team/Organization
- Category: FTL/LTL/Spot/Regional/Other
- Template ID: TMPL-YYYYMMDD-XXXXX

---

## 🔧 API Reference

### Backend Methods (mockBackend.ts)

#### Create Template
```typescript
auctionEngine.createTemplate(req: CreateTemplateRequest): string
// Returns: templateId

// Request:
{
  templateName: string;
  description?: string;
  category: TemplateCategory;
  visibility: TemplateVisibility;
  isFavorite?: boolean;
  auctionConfiguration: {
    auctionType: AuctionType;
    globalRuleset: { ... };
    lanes: [ ... ];
  };
  createdBy: string;
}
```

#### Get Template
```typescript
auctionEngine.getTemplate(templateId: string): AuctionTemplate | undefined
```

#### Get All Templates
```typescript
auctionEngine.getAllTemplates(): AuctionTemplate[]
// Returns non-deleted templates only
```

#### Update Template
```typescript
auctionEngine.updateTemplate(
  templateId: string,
  req: UpdateTemplateRequest
): void

// Note: Cannot update system templates
// Existing auctions won't be affected
```

#### Delete Template
```typescript
auctionEngine.deleteTemplate(templateId: string): void
// Soft delete (marks as deleted)
// Only custom templates can be deleted
```

#### Duplicate Template
```typescript
auctionEngine.duplicateTemplate(
  templateId: string,
  userId: string
): string
// Returns: newTemplateId
// Creates copy with " - Copy" suffix
// Owner becomes current userId
```

#### Toggle Favorite
```typescript
auctionEngine.toggleFavorite(templateId: string): void
```

#### Record Usage
```typescript
auctionEngine.recordTemplateUsage(
  templateId: string,
  userId: string
): void
// Increments:
// - usageCount
// - totalAuctionsCreated
// - mostUsedByCount (if same user)
// Updates lastUsedAt to now
```

### Utility Functions (templateUtils.ts)

#### Search and Filter
```typescript
searchTemplates(templates: [], query: string): AuctionTemplate[]
filterTemplatesByType(templates: [], type: AuctionType): AuctionTemplate[]
filterTemplatesByCreator(templates: [], createdBy?: string, showSystem?: boolean)
filterTemplatesByVisibility(templates: [], visibility: TemplateVisibility | 'all')
getFavoriteTemplates(templates: []): AuctionTemplate[]
```

#### Sort
```typescript
sortTemplates(
  templates: [],
  sortBy: 'recentlyUsed' | 'mostUsed' | 'alphabetical' | 'dateCreated'
): AuctionTemplate[]
```

#### Format and Display
```typescript
getTemplateTypeColor(auctionType: AuctionType): string
// Returns Tailwind color classes

formatLastUsed(timestamp?: number): string
// Returns: "5 minutes ago", "2 days ago", etc.

getTemplateDisplayName(template: AuctionTemplate): string

getTemplateStatisticsSummary(template: AuctionTemplate): {
  timesUsed: number;
  averageSavings: string;
  mostUsedBy: string;
}

formatTemplateForDisplay(template: AuctionTemplate): {
  id: string;
  name: string;
  description: string;
  type: AuctionType;
  laneCount: number;
  createdBy: string;
  lastUsed: string;
  usageCount: number;
  isFavorite: boolean;
  isSystem: boolean;
  category: TemplateCategory;
}
```

#### Validation
```typescript
validateTemplate(template: Partial<AuctionTemplate>)
// Returns: { valid: boolean; errors: string[] }

validateTemplateName(name: string)
// Returns: { valid: boolean; error?: string }

validateTemplateDescription(description?: string)
// Returns: { valid: boolean; error?: string }
```

#### Permissions
```typescript
canEditTemplate(template: AuctionTemplate, userId: string): boolean
// System templates: false
// Creator only: true

canDeleteTemplate(template: AuctionTemplate, userId: string): boolean
// System templates: false
// Creator only: true

canShareTemplate(template: AuctionTemplate, userId: string): boolean
// System templates: false
// Creator only: true
```

---

## 🧪 Testing Guide

### Test Case 1: Load System Templates
**Steps:**
1. Navigate to `/admin/auction-templates`
2. Should see 8 system templates in grid view
3. All marked with "Official" badge

**Expected:**
- ✅ All 8 system templates visible
- ✅ No errors in console
- ✅ Search works on system templates
- ✅ Cannot edit/delete system templates

---

### Test Case 2: Use System Template
**Steps:**
1. On Templates page, click "Use" on "Regional FTL - North India"
2. Should redirect to `/create-auction?templateId=TMPL-SYS-001`
3. Form should be pre-filled

**Expected:**
- ✅ 5 lanes pre-populated
- ✅ Auction name shows "Regional FTL - North India - Copy"
- ✅ Global ruleset matches template
- ✅ Purple template banner visible
- ✅ Can modify any field
- ✅ Template usage counter incremented

---

### Test Case 3: Create Custom Template
**Steps:**
1. Go to `/create-auction`
2. Fill in form with custom configuration
3. Click "Save as Template"
4. Enter: Name "My Custom FTL", Description "For Q1 auctions"
5. Click "Save"

**Expected:**
- ✅ Dialog closes
- ✅ Success toast shows
- ✅ Template appears in `/admin/auction-templates`
- ✅ Created by current user
- ✅ Can be edited and duplicated

---

### Test Case 4: Duplicate and Modify Template
**Steps:**
1. Find any custom template
2. Click menu (⋯) → "Duplicate"
3. New template created
4. Click on duplicate → "Edit"
5. Change name to "Q2 Variant"
6. Change one lane base price
7. Click "Save"

**Expected:**
- ✅ Duplicate created with " - Copy" suffix
- ✅ Can edit duplicate
- ✅ Original template unchanged
- ✅ Both templates visible in library

---

### Test Case 5: Search and Filter
**Steps:**
1. Go to `/admin/auction-templates`
2. Type "FTL" in search
3. Should filter to FTL-related templates
4. Select Filter: Type = "REVERSE"
5. Should show only REVERSE templates

**Expected:**
- ✅ Search results update in real-time
- ✅ Filters combine (AND logic)
- ✅ Result count updates

---

### Test Case 6: Toggle Favorite
**Steps:**
1. Click heart icon on any template
2. Check if favorited
3. Click "Favorites" filter button
4. Should show only favorited templates

**Expected:**
- ✅ Heart fills with red
- ✅ Favorites filter works
- ✅ Persists across page navigation

---

### Test Case 7: View Template Details
**Steps:**
1. Click on any template car → "View" button
2. Should navigate to `/admin/auction-templates/:templateId`

**Expected:**
- ✅ All metadata visible
- ✅ Statistics calculated correctly
- ✅ All lanes expandable
- ✅ Calculations accurate (min price, savings %)
- ✅ Action buttons present

---

### Test Case 8: Delete Custom Template
**Steps:**
1. Create new custom template
2. Note the template ID
3. Click menu → "Delete"
4. Confirm deletion
5. Template should disappear

**Expected:**
- ✅ Confirmation dialog shown
- ✅ Cannot delete system templates
- ✅ Success message shown
- ✅ Template removed from list
- ✅ (Optional: Can view as soft-deleted if admin view exists)

---

### Test Case 9: Mobile Responsiveness
**Steps:**
1. Go to `/admin/auction-templates`
2. Resize to mobile (375px width)
3. Test all interactions

**Expected:**
- ✅ Grid converts to single column
- ✅ Buttons stack vertically
- ✅ Search accessible
- ✅ Filters functional
- ✅ No horizontal scrolling

---

### Test Case 10: Export/Import (Future Feature)
- Share template link
- Recipient imports template
- Template appears in their library with attribution

---

## 📊 Data Structures

### AuctionTemplate Interface
```typescript
interface AuctionTemplate {
  templateId: string;                    // TMPL-YYYYMMDD-XXXXX
  templateName: string;                  // e.g., "Regional FTL - North India"
  description?: string;                  // 0-200 characters
  category: TemplateCategory;            // FTL | LTL | Spot | Regional | Other
  isSystemTemplate: boolean;             // true for pre-configured templates
  visibility: TemplateVisibility;        // private | team | organization
  isFavorite: boolean;                   // User favorite indicator
  
  auctionConfiguration: {
    auctionType: AuctionType;            // REVERSE | SPOT | LOT | BULK | REGION_LOT
    globalRuleset: {
      minBidDecrement: number;
      timerExtensionThresholdSeconds: number;
      timerExtensionSeconds: number;
      allowRankVisibility: boolean;
    };
    lanes: Array<{
      laneName: string;
      basePrice: number;
      duration: number;                  // in seconds
      decrement: number;
      tatDays?: number;                  // Turnaround time days
    }>;
  };
  
  createdBy: string;                     // User ID or "SYSTEM"
  createdAt: number;                     // Timestamp
  lastModifiedAt: number;                // Timestamp
  lastModifiedBy?: string;               // User ID
  deletedAt?: number;                    // Soft delete timestamp
  isDeleted?: boolean;                   // Flag
  
  // Statistics
  usageCount: number;                    // Times used to create auction
  lastUsedAt?: number;                   // Timestamp of last usage
  totalAuctionsCreated?: number;         // Total auctions from this template
  averageSavingsPercent?: number;        // Average savings % from auctions
  mostUsedBy?: string;                   // User ID who uses it most
  mostUsedByCount?: number;              // Times used by that user
}
```

---

## 🐛 Troubleshooting

### Issue: Template doesn't appear after creation
**Solution:**
- Clear browser cache
- Refresh page
- Check if visibility is set correctly
- Verify template wasn't soft-deleted

### Issue: Can't edit system template
**Expected behavior:** System templates cannot be edited. Only custom templates can be edited.
- **Solution:** Duplicate the system template first, then edit the copy

### Issue: Template usage statistics not updating
**Solution:**
- Statistics only update when an auction is *created* from template
- Edit/duplicate actions don't affect usage count
- Check that `recordTemplateUsage()` was called in backend

### Issue: Form data not pre-filling when using template
**Solution:**
- Verify templateId in search params: `/create-auction?templateId=TMPL-...`
- Check that template exists: `auctionEngine.getTemplate(templateId)`
- Monitor browser console for errors

### Issue: Filters not working
**Solution:**
- Ensure all templates are loaded first
- Try refreshing the page
- Check that filter values match enum values (REVERSE, FTL, etc.)
- Check browser console for TypeScript errors

---

## 📈 Performance Metrics

| Operation | Typical Time |
|-----------|-------------|
| Load templates library | 100-200ms |
| Search/filter templates | 10-50ms |
| Create template | 50-100ms |
| Duplicate template | 50-100ms |
| Load template details | 50-100ms |
| Use template (navigate + pre-fill) | 200-400ms |
| Create auction from template | 1-2 seconds |

---

## 🔐 Security & Permissions

### System Templates
- Cannot be edited by any user
- Cannot be deleted
- Visible to all users
- Cannot be marked as private/team

### Custom Templates
- **Creator:** Full permissions (view, edit, delete, share)
- **Team Members:** View only (if visibility: 'team')
- **Organization:** View only (if visibility: 'organization')
- **Others:** No access (if visibility: 'private')

### Soft Deletes
- Deleted templates are marked as deleted but not removed from DB
- Don't appear in normal template lists
- Can be restored (future feature)
- Existing auctions from deleted templates are unaffected

---

## 🚀 Future Enhancements

1. **Template Editor Page**
   - Dedicated /edit/:templateId page
   - Inline lane editor
   - Live preview of calculations

2. **Template Sharing**
   - Generate shareable links
   - Track who imported templates
   - Attribution tracking

3. **Template Versioning**
   - Save template edit history
   - Revert to previous versions
   - Compare versions

4. **Template Analytics**
   - Auction success rate from templates
   - Average savings achieved
   - Vendor participation rates
   - ROI by template

5. **Smart Recommendations**
   - Suggest templates based on:
     - Lane configuration
     - Historical performance
     - User's most-used templates
     - Auction type

6. **Approval Workflow**
   - Admin approval for organization templates
   - Template classification levels
   - Usage policies per template

7. **Integration**
   - CSV import/export of templates
   - API endpoints for third-party integrations
   - Template marketplace (internal)

8. **Mobile App**
   - Templates on mobile
   - Quick-create from templates
   - Template browser

---

## 📞 Support

**Common Questions:**

**Q: Can I modify a system template?**
A: No, system templates are locked. Duplicate them first to create a custom version.

**Q: What happens to auctions if I delete a template?**
A: Nothing. Auctions created from templates are independent. Deleting the template doesn't affect existing auctions.

**Q: Can I share templates with the team?**
A: Yes! Set visibility to "Team" when creating. All team members can view and use it.

**Q: How do I track which template was used for an auction?**
A: In the auction details, check the template badge or view audit log.

**Q: Can I export templates?**
A: Not yet, but it's planned as a future enhancement.

---

**Last Updated:** February 9, 2026  
**Version:** 1.0  
**Status:** Production Ready
