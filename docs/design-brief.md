# House Chores: design brief

## What the app does
House Chores is a shared chore tracker for two people in one household. Each chore has a frequency (every N days or weeks). When someone marks a chore done, the app works out when it's due next. It's used on phones as an installed PWA (standalone, no browser bar).

Core loop: open the app, see what's overdue or due today, tap Done.

## Who uses it
Two people at home, checking it several times a day. Mostly one-handed, on a phone. Needs to feel calm and quick, not like a work task manager.

## Screens (current)

**Sign in**
- Heading "Sign in", one line of helper text, an email field, "Send link" button.
- After submit: "Check your email" with the address and a line to open the link on this device.

**Household setup** (first sign-in only)
- "Set up your household" with "Create household" button.
- Divider-free second form: "Household ID" field and "Join household" button.

**Dashboard** (default tab)
- Segmented filter at top: All / Me / Partner / Anyone. Active option is filled.
- Sections in order, each with an uppercase label: Overdue, Due today, Upcoming. Empty sections are hidden.
- Each card: chore name (bold), meta line "Every 4 days · Me", due text ("3 days overdue", "Due today", "Due in 2 days"), and a Done button on the right.
- Overdue and due-today cards have a coloured left edge and coloured due text.
- Empty states: "No chores yet. Add some in the Chores tab." and "Nothing assigned here."
- Done has no confirmation or feedback beyond the card moving sections.

**Chores** (tab)
- Full-width "Add chore" button.
- Add/edit form in a card: Name, "Every" number field plus Unit select (days / weeks), "Assigned to" select, Save and Cancel.
- Validation message appears in red under the form.
- List of chores: name, meta line "Every 1 week · Anyone", Edit and Delete buttons. Delete uses a native browser confirm.

**History** (tab)
- List of completions, newest first: chore name, date (e.g. "Mon, 26 Oct, 2026"), Undo button.
- Empty state: "Nothing completed yet."

**Settings** (tab)
- "Your name" card: text field, button that reads "Save name", then "Saved" (disabled) or "Not saved yet." line.
- "Household" card: explanation line and the household ID in a monospace box.
- "Backup" card: Export JSON and Sign out buttons.

**Global**
- Header: title "House Chores" and a row of four tab buttons (Dashboard, Chores, History, Settings). Active tab is filled.
- Loading state: "Loading…" centred in muted text.
- Errors: red text above content.

## Data shape
- Chore: name, frequency in days, assignee (Me / Partner / Anyone).
- Completion: the date it was done.
- Due date = last completion + frequency. Never done = due today.
- Status: overdue (before today), today, upcoming.
- Assignee labels use each person's chosen name once set (e.g. "Abhi", "Sam"); otherwise "Me" and "Partner".

## Current visual system
- Plain CSS with colour variables in `src/index.css`. No component library, no icons, no animation.
- Light and dark mode via `prefers-color-scheme` and a `data-theme` override.
- Layout: single column, max width 640px, 16px side padding.
- Light palette: background #f6f7f4, surface #ffffff, text #1f2a24, muted #6b766f, border #dde2dc, primary #2f6f5e, danger / overdue #b3261e, today #b26a00, upcoming #2f6f5e.
- Dark palette: background #14191a, surface #1d2420, text #e6ece8, muted #97a39b, border #2e3832, primary #5fb59c, danger / overdue #ff8a80, today #ffb74d, upcoming #7fd1b9.
- Type: system font stack. Headings are small uppercase section labels. Title is 1.6rem.
- Buttons: 40px min height, 8px radius, 1px border. Primary is filled with the primary colour.

## Constraints
- Must work from 360px wide upward, with no horizontal scroll.
- Tap targets at least 44px. Text contrast meets WCAG AA in both modes.
- Light and dark mode both designed.
- Installed PWA: standalone display, so the design must not depend on browser chrome.
- Keep React and the existing component structure. Deliver CSS and component specs, not logic changes.
- Keep it simple: two users, no onboarding flows, no navigation beyond the four tabs.

## What's not working well (to be specific about)
- The header tabs look cramped and the active state is hard to see at a glance.
- Cards are flat; overdue vs. upcoming is only a thin coloured edge.
- The segmented filter feels like a form control, not a filter.
- Forms look unfinished: no visual grouping, weak field labels, default select styling.
- Done gives no feedback. The card just disappears from its section.
- Empty and loading states are plain text.
- Delete uses the browser's confirm dialog.
- The app has no icons, so every action is text-only.

## What I want back
1. Design tokens: colour (light and dark), spacing scale, type scale, radii, shadows.
2. A layout for each screen at 360px and 640px wide, with a short note on why.
3. Component specs: header and tabs, dashboard card, status badge, segmented filter, buttons (primary, secondary, danger), form fields and selects, empty state, toast or inline feedback for Done.
4. CSS that drops into `src/index.css` with no changes to component markup, unless you say what markup change is needed and why.
5. A short list of what you changed from the current design and what you'd leave for later.
