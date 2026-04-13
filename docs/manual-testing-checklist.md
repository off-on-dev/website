# Manual Testing Checklist: Google Analytics Consent Flow

Run through this checklist in a browser with DevTools open. Use an incognito window for each new scenario so localStorage is clean.

---

## Setup

Before every scenario:
1. Open DevTools > Application > Local Storage > `http://localhost:8080`
2. Open DevTools > Network tab (filter: `googletagmanager.com`)
3. Open DevTools > Console (watch for errors)
4. Start the dev server: `npm run dev`

---

## Scenario 1: First Visit — No Prior Consent

**Steps:**
1. Open an incognito window and navigate to `http://localhost:8080`
2. Observe the page load

**Expected:**
- [ ] Consent banner appears at the bottom of the screen
- [ ] Banner shows "Decline" and "Accept analytics" buttons
- [ ] Banner includes a "Privacy Policy" link that navigates to `/privacy`
- [ ] No `gtag/js` request appears in the Network tab
- [ ] `localStorage` has no `analytics_consent` key
- [ ] No floating cookie button is visible

---

## Scenario 2: First Visit — Accept Analytics

**Steps (continue from Scenario 1):**
1. Click "Accept analytics"

**Expected:**
- [ ] Banner disappears immediately
- [ ] A small floating cookie button appears in the bottom-right corner (44px circle)
- [ ] Network tab shows a request to `https://www.googletagmanager.com/gtag/js?id=G-YEYE9DFHWE`
- [ ] `localStorage` shows `analytics_consent` with `{ "value": "granted", "timestamp": <ms> }`
- [ ] Console has no errors

---

## Scenario 3: First Visit — Decline Analytics

**Steps (fresh incognito window):**
1. Navigate to `http://localhost:8080`
2. Click "Decline"

**Expected:**
- [ ] Banner disappears immediately
- [ ] A small floating cookie button appears (same as accept)
- [ ] No `gtag/js` request in Network tab
- [ ] `localStorage` shows `analytics_consent` with `{ "value": "denied", "timestamp": <ms> }`
- [ ] Console has no errors

---

## Scenario 4: Returning Visit — Consent Already Granted

**Steps:**
1. In a regular window (or after accepting in Scenario 2), refresh the page

**Expected:**
- [ ] Banner does NOT appear
- [ ] Floating cookie button IS visible
- [ ] Network tab shows `gtag/js` is requested on load (consent is restored)
- [ ] Console has no errors

---

## Scenario 5: Returning Visit — Consent Already Denied

**Steps:**
1. After declining in Scenario 3, refresh the page

**Expected:**
- [ ] Banner does NOT appear
- [ ] Floating cookie button IS visible
- [ ] No `gtag/js` request in Network tab
- [ ] Console has no errors

---

## Scenario 6: Change Consent — Floating Button

**Steps (after Scenario 2 or 3 — banner is gone):**
1. Click the floating cookie button (bottom-right)

**Expected:**
- [ ] Consent banner reappears
- [ ] `localStorage` now has NO `analytics_consent` key (reset clears it)
- [ ] Page does NOT scroll to the top when clicking the button
- [ ] Console has no errors

---

## Scenario 7: Re-Accept After Reset

**Steps (after opening banner via Scenario 6):**
1. Click "Accept analytics"

**Expected:**
- [ ] Banner disappears, floating button reappears
- [ ] `gtag/js` re-loads if it wasn't loaded (check Network tab)
- [ ] `localStorage` shows `analytics_consent` with `"granted"`

---

## Scenario 8: Accept Then Decline (Revocation Flow)

**Steps (fresh or after reset):**
1. Accept analytics (banner closes, gtag loads)
2. Click the floating cookie button to re-open banner
3. Click "Decline"

**Expected:**
- [ ] Banner closes, floating button reappears
- [ ] DevTools > Sources should NOT show `gtag/js` in the sources tree after decline
- [ ] `localStorage` shows `"denied"`
- [ ] No GA events appear in the Network tab after this point (no `collect` or `analytics` requests)
- [ ] Console has no errors

---

## Scenario 9: Footer "Cookie preferences" Link

**Steps:**
1. Scroll to the footer of any page
2. Find and click "Cookie preferences" (under Policies column)

**Expected:**
- [ ] Consent banner reappears
- [ ] Page does NOT scroll to the top
- [ ] Banner functions normally (Accept / Decline work)

---

## Scenario 10: Privacy Policy Page

**Steps:**
1. Click the "Privacy Policy" link in the footer OR in the consent banner

**Expected:**
- [ ] Navigates to `/privacy` without a full page reload (React Router)
- [ ] Page title reads "Privacy Policy - OffOn"
- [ ] Page body contains the correct data controller email: `offondev@gmail.com`
- [ ] Page body contains a link to the moderators group
- [ ] `<meta name="robots" content="noindex">` is present (check DevTools > Elements > head)
- [ ] Page renders correctly in both light and dark mode

---

## Scenario 11: Multi-Page Navigation with Consent Granted

**Steps (consent already granted):**
1. Navigate from Home to About to Sponsors and back to Home

**Expected:**
- [ ] Banner does NOT reappear on any page
- [ ] Floating cookie button persists on all pages
- [ ] `analytics/collect` requests appear in Network tab for each page view (GA tracking)
- [ ] No duplicate `gtag/js` script tags in the DOM (check Elements > head)

---

## Scenario 12: Consent Expiry (Simulated)

**Steps:**
1. Accept consent
2. Open DevTools > Application > Local Storage
3. Edit the `analytics_consent` value to set `"timestamp"` to a value older than 180 days:
   `Date.now() - (6 * 30 * 24 * 60 * 60 * 1000 + 1)` (e.g., `1700000000000`)
4. Refresh the page

**Expected:**
- [ ] Consent banner reappears (old consent treated as expired)
- [ ] `localStorage` `analytics_consent` key is removed
- [ ] No `gtag/js` request on load

---

## Scenario 13: Accessibility — Keyboard Navigation

**Steps (fresh visit, banner visible):**
1. Tab through the page using only the keyboard

**Expected:**
- [ ] Banner buttons are reachable via Tab
- [ ] Focus ring is visible on both "Decline" and "Accept analytics" buttons
- [ ] Press Enter on "Decline" or "Accept analytics" — both work
- [ ] After dismissing banner, Tab reaches the floating cookie button
- [ ] Focus ring is visible on the floating cookie button
- [ ] Press Enter on the floating cookie button — banner reappears

---

## Scenario 14: Mobile / Safe Area (iOS)

**Steps (use DevTools device emulation or an actual iOS device):**
1. Simulate iPhone 14 Pro (with notch/Dynamic Island)
2. Visit the site with no prior consent

**Expected:**
- [ ] Consent banner does not overlap system navigation bar at the bottom
- [ ] Banner content is fully readable above the safe area
- [ ] Floating cookie button is above the system home indicator

---

## Scenario 15: Dark Mode

**Steps:**
1. Enable dark mode (OS or via the site's theme toggle if available)
2. Walk through Accept and Decline flows

**Expected:**
- [ ] Banner background and text have sufficient contrast in dark mode
- [ ] Floating cookie button is visible and has correct contrast in dark mode
- [ ] No hardcoded colors that break in dark mode

---

## Sign-Off

| Scenario | Tester | Date | Pass/Fail | Notes |
|---|---|---|---|---|
| 1 — First visit, no consent | | | | |
| 2 — Accept analytics | | | | |
| 3 — Decline analytics | | | | |
| 4 — Return with granted | | | | |
| 5 — Return with denied | | | | |
| 6 — Floating button / reset | | | | |
| 7 — Re-accept after reset | | | | |
| 8 — Accept then decline | | | | |
| 9 — Footer cookie link | | | | |
| 10 — Privacy policy page | | | | |
| 11 — Multi-page navigation | | | | |
| 12 — Expiry simulation | | | | |
| 13 — Keyboard navigation | | | | |
| 14 — Mobile / safe area | | | | |
| 15 — Dark mode | | | | |
