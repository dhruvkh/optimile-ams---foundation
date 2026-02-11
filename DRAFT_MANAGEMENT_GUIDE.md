# Auction Draft Management System - Implementation Guide

## Overview

A comprehensive draft management system for the auction creation workflow with auto-save functionality, draft persistence, and publish workflows.

## Features Implemented

### 1. **Auto-Save Functionality**
- ✅ Auto-saves auction form data every 30 seconds when user is typing
- ✅ Stores draft in browser and backend database
- ✅ Shows "Saving...", "All changes saved" indicators with timestamp
- ✅ Displays relative time of last save (e.g., "2 hours ago")

**Location:** [components/CreateAuction.tsx](components/CreateAuction.tsx#L95-L100)  
**Hook:** `useAutoSaveDraft()` from [services/draftUtils.ts](services/draftUtils.ts#L13-L60)

### 2. **Save as Draft Button**
- ✅ "Save as Draft" button next to Cancel and Create/Publish buttons
- ✅ Saves current state with all filled fields (no validation required)
- ✅ Generates unique draft ID: `DRAFT-YYYYMMDD-XXXXX` format
- ✅ Shows success toast: "Draft saved successfully. Draft ID: DRAFT-20260209-12345"
- ✅ Stays on form with saved state (can be configured to redirect)

**Location:** [components/CreateAuction.tsx](components/CreateAuction.tsx#L306-L315)

### 3. **Draft Management Page**
- ✅ New route: `/admin/auction-drafts`
- ✅ Shows table with comprehensive columns:
  - Draft ID with document icon
  - Auction Name (or "Untitled Auction" if empty)
  - Auction Type badge
  - Number of Lanes Added
  - Completion progress bar (visual percentage)
  - Last Modified (relative time)
  - Status Badge (Incomplete/Ready to Publish)
  - Actions (Edit, Delete, Duplicate, Publish)

- ✅ Filters by:
  - Type (REVERSE, SPOT, LOT, BULK, REGION_LOT)
  - Status (Incomplete, Ready to Publish)
  - Search by Draft ID or Auction Name
  
- ✅ Sorting options:
  - Most Recent (default)
  - Name (A-Z)
  - Type

- ✅ Shows draft count badge
- ✅ Mobile-responsive (cards layout on mobile)
- ✅ Empty state with CTA button

**Location:** [components/AuctionDrafts.tsx](components/AuctionDrafts.tsx)

### 4. **Resume Draft Flow**
- ✅ Click "Edit" on a draft to pre-fill Create Auction form
- ✅ Shows banner at top: "Editing Draft: DRAFT-20260209-12345 | Last saved: 2 hours ago"
- ✅ "Save as Draft" button updated for continuous saves
- ✅ "Publish Auction" button replaces "Create Auction" when editing

**Location:** [components/CreateAuction.tsx](components/CreateAuction.tsx#L50-L60)

### 5. **Validation & Publishing**
- ✅ No validation required for "Save as Draft"
- ✅ Full validation on "Create Auction" or "Publish Draft"
- ✅ Shows validation errors in toast
- ✅ Publishes draft to live auction if validation passes
- ✅ Deletes draft record after successful publish

**Location:** [services/draftUtils.ts](services/draftUtils.ts#L294-L330)

### 6. **Draft Expiry**
- ✅ Auto-deletes drafts older than 30 days
- ✅ Expiry cleanup runs during every system tick
- ✅ `expiresAt` timestamp set on draft creation

**Location:** [services/mockBackend.ts](services/mockBackend.ts#L860-L875)

## Data Model

**AuctionDraft Interface:**
```typescript
{
  draftId: string,                    // DRAFT-20260209-12345
  auctionData: {
    name: string,
    auctionType: AuctionType,         // REVERSE, SPOT, LOT, BULK, REGION_LOT
    globalRuleset: {
      minBidDecrement: number,
      timerExtensionThresholdSeconds: number,
      timerExtensionSeconds: number,
      allowRankVisibility: boolean
    },
    lanes: Array<{
      laneName: string,
      basePrice: number,
      duration: number,               // timerDurationSeconds
      decrement: number,              // minBidDecrement
      tatDays?: number
    }>
  },
  createdBy: string,                  // userId
  createdAt: number,                  // timestamp
  lastModifiedAt: number,             // timestamp
  status: 'INCOMPLETE' | 'READY',
  expiresAt: number                   // timestamp (30 days from creation)
}
```

## API Methods

### Backend Service (mockBackend.ts)

```typescript
// Save new draft
saveDraft(req: SaveDraftRequest): string
// Returns: draft ID

// Update existing draft
updateDraft(draftId: string, auctionData: AuctionDraft['auctionData']): void

// Delete draft
deleteDraft(draftId: string): void

// Duplicate draft
duplicateDraft(draftId: string): string
// Returns: new draft ID

// Publish draft as live auction
publishDraft(draftId: string, userId: string): string
// Returns: auction ID

// Retrieve draft
getDraft(draftId: string): AuctionDraft | undefined

// Get all drafts for user
getDraftsByUser(userId: string): AuctionDraft[]

// Get all drafts
getAllDrafts(): AuctionDraft[]
```

### React Hooks (draftUtils.ts)

```typescript
// Auto-save hook
useAutoSaveDraft(draftId: string | null, formData: CreateAuctionRequest, enabled?: boolean)
// Returns: { autoSaveStatus, lastSaveTime }

// Manual save hook
useSaveDraft()
// Returns: { saveDraft, isSaving, error }

// Load draft hook
useDraft(draftId: string | null)
// Returns: { draft, formData, isLoading, error }

// Manage all drafts
useDrafts(userId?: string)
// Returns: { drafts, isLoading, deleteDraft, duplicateDraft, publishDraft }

// Subscribe to updates
useDraftSubscription(): void
```

## Utility Functions

```typescript
// Get relative time string
getRelativeTime(timestamp: number): string
// "Just now", "5 minutes ago", "2 hours ago", "3 days ago"

// Calculate draft completion percentage
calculateDraftCompletion(draft: AuctionDraft): number
// Returns: 0-100

// Get display name for draft
getDraftDisplayName(draft: AuctionDraft): string
// Returns: name or "Untitled Auction"

// Validate draft before publishing
validateDraft(draft: AuctionDraft): DraftValidationError[]
// Returns array of validation errors
```

## UI Features

### Visual Indicators
- ✅ Gray/muted colors for draft badges vs green for live auctions
- ✅ Draft icon (📄) next to draft ID
- ✅ Progress indicator on draft card showing completion percentage
- ✅ Auto-save status with icons:
  - 🔄 "Saving..." when saving
  - ✅ "All changes saved" when done
  - ⚠️ "Save failed" on error
  - Time stamp "Last saved: 2 hours ago"

### Confirmation Dialogs
- ✅ Delete draft: "Are you sure you want to delete this draft? This action cannot be undone."
- ✅ Publish incomplete: "Some fields are incomplete. Review and fix errors before publishing."
- ✅ Publish confirmation: "Are you sure you want to publish this draft as a live auction?"

### Mobile Responsive
- ✅ Desktop: Table layout with all columns
- ✅ Mobile/Tablet: Card layout with compact information
- ✅ Touch-friendly action buttons
- ✅ Responsive search and filters

## File Structure

### New Files Created
```
components/
  ├── AuctionDrafts.tsx              # Draft management page
  └── CreateAuction.tsx              # Updated with draft functionality

services/
  ├── mockBackend.ts                 # Updated with draft CRUD
  └── draftUtils.ts                  # New draft utilities & hooks

types.ts                             # Added DraftStatus, AuctionDraft, SaveDraftRequest

App.tsx                              # Updated with /admin/auction-drafts route
```

## How to Use

### Create and Save a Draft
1. Navigate to "Create Auction" (or click "Create New" from drafts page)
2. Fill in auction details
3. Click "Save as Draft"
4. Get confirmation toast with draft ID
5. Form data auto-saves every 30 seconds

### Resume Editing a Draft
1. Go to "Admin" → "Drafts" in navigation
2. Find your draft in the table
3. Click "Edit" button
4. Form pre-fills with all saved data
5. See draft banner showing last save time
6. Continue editing (auto-saves every 30 seconds)

### Publish a Draft
1. From drafts page, click "Publish" button (only enabled if complete)
2. Confirm publish action
3. System validates all required fields
4. Creates live auction and deletes draft
5. Redirects to auction detail page

### Duplicate a Draft
1. From drafts page, click "Duplicate" button (copy icon)
2. New draft created with same data
3. Toast shows new draft ID
4. Both drafts are independent

### Delete a Draft
1. From drafts page, click "Delete" button (trash icon)
2. Confirm deletion
3. Draft removed from system

## Testing Checklist

### Auto-Save Functionality
- [ ] Auto-save triggers every 30 seconds
- [ ] Save indicator shows "Saving..." then "All changes saved"
- [ ] Last save timestamp updates
- [ ] Form data persists after refresh
- [ ] Browser localStorage contains draft data
- [ ] Backend database records draft updates

### Manual Save (Save as Draft)
- [ ] Manual save works with incomplete data
- [ ] Unique draft ID generated each time
- [ ] Success toast shows draft ID
- [ ] Draft ID format: DRAFT-YYYYMMDD-XXXXX
- [ ] Multiple drafts don't overwrite each other
- [ ] Existing draft updates on re-save

### Draft List Page
- [ ] All drafts display in table
- [ ] Draft count shows accurate metadata
- [ ] Completion progress bar calculates correctly:
  - 0% if name missing
  - 25% with name only
  - 50% with name and type
  - 75% with name, type, and ruleset
  - 100% with name, type, ruleset, and lanes
- [ ] Status badge shows "Incomplete" or "Ready"
- [ ] Last modified time shows relative format
- [ ] Search filters by Draft ID
- [ ] Search filters by Auction Name
- [ ] Type filter works for all auction types
- [ ] Status filter works for both statuses
- [ ] Sort by Recent works
- [ ] Sort by Name (A-Z) works
- [ ] Sort by Type works
- [ ] Mobile layout shows cards instead of table
- [ ] Empty state shows when no drafts exist

### Resume Draft Flow
- [ ] Clicking "Edit" navigates to form
- [ ] URL contains draftId parameter
- [ ] Form loads all fields from draft
- [ ] Draft banner shows with ID and timestamp
- [ ] All lane data loads correctly
- [ ] Ruleset loads correctly
- [ ] Auction type loads correctly

### Draft Actions
- [ ] Publish works only when validation passes
- [ ] Publish creates live auction
- [ ] Draft deleted after successful publish
- [ ] Duplicate creates independent copy
- [ ] Duplicate shows unique ID
- [ ] Delete requires confirmation
- [ ] Delete removes draft immediately
- [ ] Edit navigates to form with correct draft

### Validation & Publishing
- [ ] Publishing incomplete draft shows errors
- [ ] Error messages list all validation issues
- [ ] Validation checks:
  - Auction name not empty
  - Auction type selected
  - At least one lane added
  - Each lane has name
  - Each lane has basePrice > 0
  - Minimum bid decrement > 0
- [ ] Save as Draft bypasses validation
- [ ] Create Auction enforces validation

### Draft Expiry
- [ ] Drafts older than 30 days auto-delete
- [ ] Manual draft edit extends expiry by 30 days
- [ ] System tick cleans up expired drafts
- [ ] No cleanup happens for recent drafts

### Edge Cases
- [ ] Network error during save shows error toast
- [ ] Rapid saves don't create duplicates
- [ ] Large form data saves successfully
- [ ] Special characters in lane names saved correctly
- [ ] Zero price lanes can be saved (but warn on publish)
- [ ] Multiple users' drafts don't interfere
- [ ] Browser close/refresh recovers draft state
- [ ] Tab refresh preserves auto-save state

### Error Handling
- [ ] "Draft not found" error handled gracefully
- [ ] Invalid draft ID handled
- [ ] Network errors show appropriate toast
- [ ] Validation errors show in toast
- [ ] Delete confirmation can be cancelled
- [ ] Publish confirmation can be cancelled

### Performance
- [ ] Page loads draft list within 1 second
- [ ] Search filters update smoothly
- [ ] Auto-save doesn't block UI
- [ ] Can edit form while auto-save in progress
- [ ] Large number of drafts (100+) paginated or virtualizes
- [ ] Mobile performance acceptable

## Configuration

### Auto-Save Interval
Edit in [draftUtils.ts](services/draftUtils.ts#L60):
```typescript
}, 30000); // 30 seconds - change this value
```

### Draft Expiry Duration
Edit in [mockBackend.ts](services/mockBackend.ts#L756):
```typescript
const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
```

### Mock User ID
Edit in [AuctionDrafts.tsx](components/AuctionDrafts.tsx#L35):
```typescript
const userId = 'ADMIN-USER'; // Mock user
```

## Future Enhancements

1. **Email Reminders**
   - Implement at 25-day mark: "Your draft expires in 5 days"
   - Daily reminder if draft nearing expiry

2. **Collaborative Drafts**
   - Multiple users can edit same draft
   - Show who's editing indicator
   - Merge conflict resolution

3. **Draft Versions**
   - Keep version history
   - Rollback to previous version
   - Show diff between versions

4. **Offline Support**
   - Sync drafts when online
   - Conflict resolution for offline changes
   - Background sync

5. **Advanced Filters**
   - Date range filter
   - Filter by creator
   - Filter by status (expired, ready, incomplete)
   - Saved searches

6. **Bulk Actions**
   - Select multiple drafts
   - Bulk delete
   - Bulk publish (validation required)

7. **Draft Comments**
   - Add notes to draft
   - Share comments with team
   - Inline field comments

8. **Template Support**
   - Save draft as template
   - Create new draft from template
   - Shared templates library

## Troubleshooting

### Draft Not Auto-Saving
- Check browser console for errors
- Verify LocalStorage is enabled
- Check backend connection
- Verify draftId is set correctly

### Draft Not Loading
- Check if draft ID exists
- Verify backend has draft data
- Check browser console for errors
- Try refreshing page

### Validation Errors on Publish
- Ensure auction name is entered
- Check all lanes have names and base prices
- Verify minimum bid decrement > 0
- Review error message in toast

### Drafts Disappearing
- Check if 30-day expiry reached
- Verify browser didn't clear storage
- Check if manually deleted
- Review audit log for changes

## Related Documentation

- [Auction Creation Flow](./auction-creation-flow.md)
- [Types Reference](../types.ts)
- [Backend Service](../services/mockBackend.ts)
- [UI Components](../components/common.tsx)
