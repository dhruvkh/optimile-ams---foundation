# Draft Management System - Quick Start & Testing Guide

## Quick Start (5 Minutes)

### 1. Create Your First Draft
```
1. Navigate to: [your-app]/admin/index.html#/create
2. Fill in "Auction Name": "Q1 Test Auction"
3. Select Type: "REVERSE"
4. Add some lane data
5. Click "Save as Draft"
6. Note the Draft ID shown in the success toast
```

### 2. View All Drafts
```
1. Navigate to: [your-app]/admin/index.html#/admin/auction-drafts
2. See your new draft in the list
3. Check the details: name, type, lane count, completion %
4. Notice "Last Modified" shows "Just now"
```

### 3. Resume Editing Draft
```
1. From drafts list, click "Edit" on your draft
2. See the blue banner showing draft ID and last save time
3. Make some changes to the form
4. Watch "Saving..." indicator appear after 30 seconds
5. After 3-5 seconds, see "All changes saved" confirmation
```

### 4. Publish Draft
```
1. From drafts list, check your draft is "Ready" status
2. If "Incomplete", fill in missing fields and save
3. Click "Publish" button
4. Confirm the action in the dialog
5. Redirected to live auction detail page
6. Draft is now gone from drafts list (published & deleted)
```

## Testing Scenarios

### Scenario 1: Basic Auto-Save (2 minutes)
**Objective:** Verify auto-save updates draft every 30 seconds

**Steps:**
1. Create new draft and save
2. Open draft for editing (click "Edit")
3. Change auction name
4. Wait 30+ seconds
5. Note the save status updates

**Expected Results:**
- After 30 seconds: "Saving..." appears in top right
- After 3-5 seconds: "All changes saved" appears
- Timestamp shows "Last saved: Just now"
- Refresh page - changes are persisted

### Scenario 2: Multiple Drafts (3 minutes)
**Objective:** Ensure each draft is independent

**Steps:**
1. Create Draft A with type "REVERSE", 1 lane
2. Save as draft, note ID
3. Create Draft B with type "SPOT", 3 lanes
4. Save as draft, note ID
5. Edit Draft A - verify it still has original data
6. Duplicate Draft A, get new ID
7. Verify new draft has same data as original

**Expected Results:**
- Each draft has unique ID
- Editing one draft doesn't affect others
- Duplicate creates independent copy
- All appear in drafts list with correct metadata

### Scenario 3: Validation on Publish (4 minutes)
**Objective:** Test validation prevents incomplete publish

**Steps:**
1. Create draft, save without entering name
2. Go to drafts list
3. Verify status is "Incomplete"
4. Try to click "Publish" - button might be disabled or show warning
5. Edit draft and add all required fields
6. Status changes to "Ready"
7. Publish button now works
8. Click Publish and confirm

**Expected Results:**
- Cannot publish without: name, type selection, at least 1 lane
- Clear error messages on publish attempt
- Valid data publishes successfully
- Redirects to auction detail page

### Scenario 4: Search & Filter (3 minutes)
**Objective:** Test draft management page search/filter

**Steps:**
1. Create 3-5 drafts with different types
2. Go to drafts list
3. Search for specific draft ID
4. Filter by type (e.g., "REVERSE")
5. Sort by "Most Recent"
6. Reset all filters

**Expected Results:**
- Search finds drafts by ID and name
- Type filter narrows results
- Sort options work correctly
- Can combine multiple filters

### Scenario 5: Delete Draft (2 minutes)
**Objective:** Test draft deletion

**Steps:**
1. Create a draft and save
2. From drafts list, click Delete
3. Confirm deletion
4. Verify draft is gone
5. Try to edit deleted draft (navigate directly via URL)

**Expected Results:**
- Delete confirmation dialog appears
- Draft removed immediately after confirmation
- Success toast shown
- Cannot access deleted draft

### Scenario 6: Mobile Responsive (3 minutes)
**Objective:** Test mobile layout

**Steps:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro dimensions
4. Navigate to /admin/auction-drafts
5. Attempt all actions: Edit, Delete, Publish

**Expected Results:**
- Drafts show as cards, not table on mobile
- Actions buttons are touch-friendly
- Search and filters remain accessible
- No horizontal scrolling needed
- Form editable on mobile screen

### Scenario 7: Browser Refresh (2 minutes)
**Objective:** Test draft state recovery

**Steps:**
1. Start editing a draft
2. Make changes to form (don't save yet)
3. Wait 30+ seconds for auto-save
4. Refresh page (Ctrl+R)
5. Check all form fields

**Expected Results:**
- Form reloads with all changes intact
- Draft banner reappears
- Can continue editing
- Auto-save continues working

### Scenario 8: Empty State (1 minute)
**Objective:** Test empty drafts list

**Steps:**
1. Delete all drafts manually from console (optional)
2. Navigate to /admin/auction-drafts
3. Observe empty state

**Expected Results:**
- Empty state message appears
- "Create New Auction" button visible
- No table or cards shown
- Can click button to create new draft

## Debug Commands (Browser Console)

```javascript
// View all drafts in backend
auctionEngine.getAllDrafts()

// View drafts for specific user
auctionEngine.getDraftsByUser('ADMIN-USER')

// Get specific draft
auctionEngine.getDraft('DRAFT-20260209-12345')

// Manually create draft via console
auctionEngine.saveDraft({
  auctionData: {
    name: 'Test',
    auctionType: 'REVERSE',
    globalRuleset: {
      minBidDecrement: 100,
      timerExtensionThresholdSeconds: 10,
      timerExtensionSeconds: 120,
      allowRankVisibility: true
    },
    lanes: [{
      laneName: 'Test Lane',
      basePrice: 50000,
      duration: 300,
      decrement: 100,
      tatDays: 3
    }]
  },
  createdBy: 'ADMIN-USER'
})

// Check localStorage (drafts persisted?)
localStorage.getItem('draft-data')

// Clear all drafts
auctionEngine.drafts = new Map()

// Trigger cleanup
auctionEngine.cleanupExpiredDrafts()
```

## Performance Testing

### Scenario 1: Large Form
**Steps:**
1. Create draft with 20+ lanes
2. Auto-save and manually save
3. Check performance

**Acceptable Metrics:**
- Save completes in <500ms
- UI remains responsive
- No console errors

### Scenario 2: Many Drafts
**Steps:**
1. Create 50+ drafts quickly
2. Open drafts list
3. Search and filter

**Acceptable Metrics:**
- Page loads in <1 second
- Search updates in <200ms
- Filter operations smooth
- No noticeable lag

### Scenario 3: Rapid Edits
**Steps:**
1. Open draft
2. Quickly change multiple fields
3. Watch auto-save behavior

**Acceptable Metrics:**
- Save indicators respond smoothly
- No duplicate saves
- Data saved consistently

## Known Limitations

- **Single User:** Current implementation assumes single user (ADMIN-USER)
- **LocalStorage Only:** No actual server persistence, all data in-memory
- **30-Second Auto-Save:** Fixed interval, not configurable from UI
- **No Offline Support:** Drafts lost if browser storage cleared
- **No Draft Sharing:** Each user's drafts stored separately (not implemented yet)
- **No Version History:** Only current version kept, no rollback

## Verification Checklist

Complete this checklist to verify full functionality:

### Core Features
- [ ] Can create and save draft
- [ ] Can view all drafts in list
- [ ] Can edit and resume draft
- [ ] Can publish completed draft
- [ ] Can delete draft
- [ ] Can duplicate draft
- [ ] Auto-save works every 30 seconds
- [ ] Manual save works with incomplete data

### UI/UX
- [ ] Status indicators show correctly
- [ ] Progress bars calculate correctly
- [ ] Toast notifications appear
- [ ] Confirmation dialogs work
- [ ] Empty state displays
- [ ] Mobile layout responsive
- [ ] Timestamps display relative time

### Data Integrity
- [ ] All form fields persist
- [ ] Lane data saves completely
- [ ] Ruleset data saves completely
- [ ] Draft ID persists correctly
- [ ] Multiple drafts independent
- [ ] No data loss on refresh

### Error Handling
- [ ] Invalid draft ID handled
- [ ] Validation errors show
- [ ] Network errors handled (if applicable)
- [ ] Deletion confirmable/cancellable
- [ ] Publish conflicting data detected

### Performance
- [ ] Drafts list loads quickly
- [ ] Form editable during auto-save
- [ ] No console errors
- [ ] No memory leaks
- [ ] Large forms work

## Support

For issues or questions:
1. Check DRAFT_MANAGEMENT_GUIDE.md for details
2. Review console errors (F12)
3. Test with debug commands above
4. Verify all implementation files exist
5. Check types match between files
6. Review hook implementations
