# Auction Preview Feature - Testing & Quick Start Guide

## Quick Start (5 Minutes)

### 1. Access Preview Feature
```
1. Navigate to: /create-auction
2. Fill in some auction details
3. Click "Preview" button (new blue button)
4. See the preview modal open
```

### 2. Explore Preview Sections
```
1. See auction header with name and type
2. Scroll down to see:
   - Timing & Schedule
   - Global Rules
   - Lanes Summary
   - Lane Timeline
   - Vendor Information
   - Validation Status
3. Notice "Draft - Not Yet Published" status
```

### 3. Toggle Vendor View
```
1. Click "Vendor View" toggle in header
2. Notice admin-only fields disappear
3. Only public information remains
4. Click again to return to admin view
```

### 4. Try Device Preview
```
1. Click "Desktop" button (default selected)
2. Try "Tablet" - content narrows (max-w-2xl)
3. Try "Mobile" - single column layout
4. Test button layout changes
```

### 5. Test Validation
```
1. Close preview (X button)
2. Remove auction name in form
3. Click Preview again
4. See validation error for missing name
5. Notice "Publish Auction" button is disabled
```

---

## Testing Scenarios

### Scenario 1: Basic Preview Display (3 minutes)
**Objective:** Verify all sections render and display correctly

**Setup:**
```
Fill in form with:
- Name: "Q1 Test Auction"
- Type: "REVERSE"
- Add 3 lanes with varying data
```

**Steps:**
1. Click "Preview" button
2. Check auction name displays
3. Check type badge shows "REVERSE"
4. Scroll through all sections
5. Verify no layout breaks

**Expected Results:**
- ✅ All sections visible
- ✅ Data displays correctly
- ✅ No console errors
- ✅ Smooth scrolling
- ✅ Professional appearance

### Scenario 2: Calculations Accuracy (4 minutes)
**Objective:** Verify all price and duration calculations

**Setup:**
```
Create lane:
- Base Price: ₹50,000
- Duration: 300 seconds (5 minutes)
- Decrement: ₹100
- Threshold: 10 seconds
```

**Manual Calculation:**
```
Extensions = floor(300 / 10) = 30
Min Price = 50,000 - (30 * 100) = 47,000
Savings = (50,000 - 47,000) / 50,000 * 100 = 6%
```

**Steps:**
1. Open preview
2. Expand lane card
3. Check "Min Possible Price" shows ₹47,000
4. Check "Estimated Savings" shows ~6%
5. Check "Total Base Value" sums correctly

**Expected Results:**
- ✅ Min price calculated correctly
- ✅ Savings percentage accurate
- ✅ Total value sums correctly
- ✅ All numbers formatted in INR

### Scenario 3: Vendor View Toggle (2 minutes)
**Objective:** Verify vendor view hides admin fields

**Admin View Should Show:**
- Decrement amounts ✅
- Extension mechanics ✅
- Minimum possible prices ✅
- Vendor eligibility info ✅
- Timeline details ✅

**Vendor View Should Show:**
- Lane names ✅
- Base prices ✅
- TAT information ✅
- Duration ✅

**Vendor View Should Hide:**
- Minimum bid amounts ✅
- Decrement calculations ✅
- Timeline/Gantt chart ✅
- Admin notes ✅

**Steps:**
1. Open preview in admin view
2. Note visible information
3. Click "Vendor View" toggle
4. Note what's hidden
5. Toggle back to admin

**Expected Results:**
- ✅ Admin fields disappear in vendor view
- ✅ Toggle works smoothly
- ✅ Clear distinction between views
- ✅ All sensitive data hidden

### Scenario 4: Device Responsive Preview (3 minutes)
**Objective:** Test responsive behavior

**Desktop:**
- Full width (max-w-6xl)
- All columns visible
- Full button row

**Tablet:**
- Medium width (max-w-2xl)
- Sections stack slightly
- Buttons still horizontal

**Mobile:**
- Narrow width (max-w-sm)
- Single column layout
- Buttons stack vertically
- Large touch targets

**Steps:**
1. Open preview on Desktop
2. Click "Tablet" button
3. Note layout changes
4. Click "Mobile" button
5. Test all buttons accessible
6. Try scrolling

**Expected Results:**
- ✅ Layout adapts smoothly
- ✅ No horizontal scrolling
- ✅ Text remains readable
- ✅ Buttons accessible on mobile
- ✅ No content cutoff

### Scenario 5: Validation Error Display (3 minutes)
**Objective:** Test error handling and messaging

**Test Cases:**
1. Missing auction name
2. No lanes added
3. Lane duration too short (< 60s)
4. Invalid base price (0 or negative)
5. Invalid decrement (0 or negative)

**Steps for Each:**
1. Remove one required field
2. Open preview
3. Check error appears in validation section
4. Verify error message is clear
5. Check appropriate color coding
6. Verify publish button disabled

**Expected Results:**
- ✅ Error message clear and specific
- ✅ Red "Error" severity displayed
- ✅ "Publish Auction" button disabled
- ✅ Error fixes enable publish button
- ✅ Multiple errors all shown

### Scenario 6: Lane Expansion (2 minutes)
**Objective:** Test expandable lane cards

**Steps:**
1. Add multiple lanes to form
2. Open preview
3. Click on first lane card
4. See expanded details:
   - Base Price
   - Duration
   - Min Decrement
   - Min Possible Price
   - Estimated Savings
   - TAT (if set)
5. Click second lane to expand it
6. First lane collapses

**Expected Results:**
- ✅ Only one lane expanded at a time
- ✅ Expanded view shows all details
- ✅ Smooth animation
- ✅ Click again to collapse
- ✅ Vendor view indicator shows in expanded view

### Scenario 7: Timeline Visualization (2 minutes)
**Objective:** Test Gantt chart rendering

**Setup:**
```
Create 3 lanes:
- Lane 1: 200 seconds
- Lane 2: 300 seconds
- Lane 3: 200 seconds
Total: 700 seconds
```

**Calculations:**
```
Lane 1: 0% start, 28.5% width
Lane 2: 28.5% start, 42.9% width
Lane 3: 71.4% start, 28.5% width
```

**Steps:**
1. Open preview (admin view)
2. Scroll to "Lane Timeline" section
3. See visual bars for each lane
4. Verify widths represent duration
5. Check duration labels show

**Expected Results:**
- ✅ All lanes shown in timeline
- ✅ Bar widths proportional to duration
- ✅ Duration shown in mm:ss format
- ✅ Smooth, responsive bars

### Scenario 8: Back to Edit (2 minutes)
**Objective:** Verify form data persists

**Steps:**
1. Fill form with auction details
2. Click "Preview"
3. Review preview
4. Click "Back to Edit"
5. Check form still has all data
6. Make one change
7. Click "Preview" again
8. See updated preview

**Expected Results:**
- ✅ All form data preserved
- ✅ Modal closes
- ✅ Focus returns to form
- ✅ Changes reflected in new preview
- ✅ No data loss

### Scenario 9: Save Draft from Preview (2 minutes)
**Objective:** Test save draft action

**Steps:**
1. Open preview with incomplete form
2. Click "Save as Draft"
3. See success toast
4. Close preview
5. Go to /admin/auction-drafts
6. Find saved draft in list
7. Click "Edit"
8. Form loads with same data
9. Click "Preview" again
10. Verify same preview

**Expected Results:**
- ✅ Draft saves from preview
- ✅ Success toast shows
- ✅ Draft appears in drafts list
- ✅ Can resume and preview again
- ✅ Data persists correctly

### Scenario 10: Publish with Validation (3 minutes)
**Objective:** Test publish button behavior

**Test 1: With Errors**
```
1. Leave required field empty
2. Open preview
3. See error in validation section
4. Try clicking "Publish Auction"
5. Button should be disabled (grayed out)
```

**Test 2: Valid Data**
```
1. Fill all required fields
2. Open preview
3. Check validation section shows all ✅
4. "Publish Auction" button enabled
5. Click button
6. Confirm dialog appears
7. Confirm to publish
8. Auction created, redirected
```

**Expected Results:**
- ✅ Publish button disabled with errors
- ✅ Publish button enabled when valid
- ✅ Confirmation dialog before publish
- ✅ Success toast on publish
- ✅ Auction created in system

---

## Calculation Verification Examples

### Example 1: Price Calculations
```
Input:
- Base Price: ₹100,000
- Duration: 600 seconds
- Extension Threshold: 15 seconds
- Decrement: ₹500
- 20% Floor: ₹20,000

Calculation:
Extensions = floor(600 / 15) = 40
Min Price = 100,000 - (40 × 500) = 80,000
Floor Check: 80,000 > 20,000 ✓
Final Min Price: ₹80,000
Savings: (100,000 - 80,000) / 100,000 × 100 = 20%

Expected Preview:
- Base Price: ₹100,000 ✓
- Min Possible Price: ₹80,000 ✓
- Estimated Savings: ~20% ✓
```

### Example 2: Duration Calculations
```
Input Lanes:
1. Lane 1: 180 seconds (3:00)
2. Lane 2: 300 seconds (5:00)
3. Lane 3: 240 seconds (4:00)

Expected Calculations:
- Shortest: 180 seconds (3:00) ✓
- Longest: 300 seconds (5:00) ✓
- Average: (180+300+240)/3 = 240 seconds (4:00) ✓
- Total Duration: 300 seconds (5:00) ✓

Expected Preview:
- Shortest Lane: 3 min ✓
- Longest Lane: 5 min ✓
- Avg Duration: 4:00 ✓
- Total Duration: 5:00 ✓
```

### Example 3: Vendor Participation
```
Input:
- Eligible Vendors: 30
- Participation Rate: 30-60% (randomized)

Possible Estimates:
- Low: ceil(30 × 0.30) = 9 vendors
- Mid: ceil(30 × 0.45) = 14 vendors
- High: ceil(30 × 0.60) = 18 vendors

Expected Preview:
- Estimated Participants: Shown between 9-18 range ✓
```

---

## Mobile Testing (on actual devices)

### iPhone (Portrait)
- [ ] Preview opens full-screen
- [ ] Close button accessible
- [ ] All sections readable
- [ ] Expandable lanes work with tap
- [ ] Toggle buttons large enough
- [ ] Bottom buttons all accessible
- [ ] No horizontal scrolling

### iPad (Landscape - Tablet Mode)
- [ ] Preview uses tablet layout (max-w-2xl)
- [ ] Content well-distributed
- [ ] Buttons in row
- [ ] No wasted space

### Android Phone
- [ ] Same tests as iPhone
- [ ] Touch events register properly
- [ ] Scrolling smooth

---

## Performance Checks

### Preview Generation Speed
```
1. Open DevTools (F12)
2. Go to Performance tab
3. Open complex auction (10+ lanes)
4. Click Preview
5. Check preview opens in < 500ms
6. Check no jank during render
```

### Memory Usage
```
1. Open large preview
2. Toggle between views 10+ times
3. Check DevTools Memory tab
4. Should be < 5MB additional
5. No memory leaks on close
```

### Toggle Response Time
```
1. Click vendor view toggle
2. Should respond instantly (< 100ms)
3. Try device selector
4. Should update with < 100ms
5. Try expanding lanes
6. Should expand with < 50ms
```

---

## Browser Compatibility Testing

### Chrome
- [ ] Preview opens correctly
- [ ] All features work
- [ ] Responsive modes work
- [ ] Calculations accurate
- [ ] Console clear (no errors)

### Firefox
- [ ] Same tests as Chrome
- [ ] Check scrollbar appearance
- [ ] Check color accuracy

### Safari (macOS)
- [ ] Same tests as Chrome
- [ ] Check font rendering
- [ ] Check shadow effects

### Safari (iOS)
- [ ] Mobile layout correct
- [ ] Touch targets large
- [ ] Scrolling smooth
- [ ] No layout issues

### Edge
- [ ] Same tests as Chrome
- [ ] Check button styles

---

## Accessibility Testing

### Keyboard Navigation
```
1. Open preview
2. Press Tab - focus moves through buttons
3. Press Shift+Tab - focus moves backward
4. Press Enter on buttons - they activate
5. Press Escape - preview should close
```

### Screen Reader (Optional - requires setup)
```
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Tab through preview
3. Check all elements announced
4. Check validation status read clearly
5. Check button labels clear
```

### Color Contrast
```
1. Open preview
2. Check all text readable:
   ✅ Black on white
   ✅ Green on light bg
   ✅ Red on light bg
   ✅ White on blue
3. No low-contrast text
```

---

## Edge Cases & Error Scenarios

### Edge Case 1: Zero Duration
```
Input: 0 seconds
Expected: Error "Duration must be at least 60 seconds"
Show in validation section
```

### Edge Case 2: Very Large Numbers
```
Input: Base Price ₹9,999,999 × 100 lanes
Expected: All calculations correct
Numbers format properly
No overflow
```

### Edge Case 3: Special Characters in Lane Name
```
Input: "Mumbai → Delhi (अंतर्राष्ट्रीय)"
Expected: Display correctly
Timeline shows properly
No layout break
```

### Edge Case 4: Missing Optional Fields
```
Input: TAT not set for some lanes
Expected: Show empty/dash
Don't break layout
Preview still works
```

### Edge Case 5: Network Delay
```
Setup: Slow 3G network
Action: Click Preview
Expected: Show loading spinner
Complete within 2-3 seconds
Smooth final render
```

---

## Checklist for Q&A Sign-Off

### Functionality
- [ ] Preview button visible and clickable
- [ ] Preview modal opens/closes correctly
- [ ] All sections display
- [ ] Data accurate and formatted
- [ ] Vendor view toggle works
- [ ] Device selector works
- [ ] Calculations verified
- [ ] Validation errors shown
- [ ] Publish button behavior correct
- [ ] Back to Edit preserves data
- [ ] Save Draft works from preview

### UI/UX
- [ ] Modal properly styled
- [ ] Professional appearance
- [ ] Good visual hierarchy
- [ ] Icons display correctly
- [ ] Colors match design
- [ ] Spacing looks good
- [ ] Responsive on all devices
- [ ] Scrolling smooth
- [ ] No layout breaks

### Data Integrity
- [ ] Form data persists
- [ ] Numbers calculated correctly
- [ ] Prices format in INR
- [ ] Durations format mm:ss
- [ ] All fields display
- [ ] No data truncation
- [ ] Special characters handled

### Error Handling
- [ ] Validation errors clear
- [ ] Error messages helpful
- [ ] Publish blocked on errors
- [ ] Multiple errors shown
- [ ] Can fix and republish

### Performance
- [ ] Opens in < 500ms
- [ ] Toggles instant
- [ ] No lag/jank
- [ ] Scrolling smooth
- [ ] Mobile responsive

### Browser Support
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on Edge
- [ ] Mobile browsers work

### Accessibility
- [ ] Keyboard navigation works
- [ ] High contrast text
- [ ] Focus indicators visible
- [ ] Good button sizes
- [ ] Clear labeling

---

## Sign-Off Approval

Once all tests pass, feature is ready for:
- ✅ Development sign-off
- ✅ QA approval
- ✅ User acceptance testing
- ✅ Production deployment

**Tested By:** _________________
**Date:** _________________
**Issues Found:** (if any) _________________

---

*Preview Feature Testing Guide - February 9, 2026*
