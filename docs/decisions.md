# Decisions

The reasoning behind the summary in the [README](../README.md). Each section says what I chose, why, and what it costs.

## The run is a reducer

The state of a bulk run is a small reducer with three fields: a status, the ids in the run, and one outcome per id. Everything on screen, from "50 of 100" to the number of retryable failures, is computed from them. Nothing is stored twice, so nothing can fall out of sync.

## Batches run one after another

The endpoint accepts at most 50 ids per call, and the client sends each batch after the previous response. In parallel, 100 invoices would take one round trip instead of two. In sequence, progress moves in real steps and only one request is in flight.

## No progress bar

I added one and removed it. A batch takes about 250 ms, so a run of 100 invoices lasts half a second and the bar flashed two steps before disappearing. Progress is a sentence instead ("Sending reminders: 50 of 100"), which screen readers announce without interrupting.

## Two kinds of failure

Every failure carries a `retryable` flag. Temporary errors such as timeouts and rate limits are retryable, business rule failures (paid, void, not found) are not. Retry targets only the first group and shows their count, so it can read "Retry 2 failed" while the summary says 6 failed.

## Undo waits before sending

An email cannot be unsent, so Undo works by waiting: nothing goes out for five seconds after you press Send. The timer pauses while Undo has focus, otherwise the button could disappear under the keyboard. The cost is that the window lives in the browser, because there is no backend. Close the tab during it and the run is lost.

## The URL holds the view

TanStack Router's default serializer writes arrays as JSON (`?status=%5B%22sent%22%5D`) and turns numeric strings into numbers, which broke a search for "12". I replaced it with two small functions in `src/lib/searchParams.ts` that write repeated keys (`?status=sent&status=paid`) and return only strings. The route's `validateSearch` converts the types and falls back to defaults. Parameters equal to their default are stripped, so page two of the default view is just `?page=2`. The trade-off is that a link without a parameter follows whatever the default is on the day it is opened.

## What stays on screen

With 25 or 50 rows per page the selection bar scrolls out of view, so it sticks to the top while something is selected or a run is in progress. The filters do not. You set them before you scroll, and changing one clears the selection, which would unstick the bar under the cursor. The header sticks too, but only on windows taller than 600 px, where the two bars take at most a quarter of the height.

Sticky bars can cover the focused element, so elements in the page get a `scroll-margin-top` as tall as the bars. My first try was `scroll-padding-top` on the page, but it applies to the header's own controls too, and every click on a server conditions option scrolled the page up.

## Keeping focus in place

Undo, Retry and Clear selection disappear as you use them, so each one first moves focus to the select-all checkbox. Send and the pagination arrows stay focusable while inactive, with `aria-disabled` instead of the native `disabled`, which sends focus back to the page. Mantine's `loading` prop sets the native one, so Send does not use it. Mantine also leaves the arrows without labels, so I added them. Changing page keeps the old rows on screen until the new ones arrive, so the pagination keeps focus. On a slow connection the old rows fade to 70% opacity after 300 ms.

I measured contrast for the colours I changed. The red Failed label is 5.46:1 in light mode and 6.70:1 in dark mode, and stays above 4.5:1 on row hover. The faded rows keep body text at 5.35:1 in dark mode, which is why the opacity is 0.7 and not 0.6.

## No table library

TanStack Table was installed and then removed. The server already filters, sorts and paginates, so the library's row models had nothing to do. Its selection feature would also have hidden the selection logic, which is the core of this project. The cost is the selection written by hand: a 37-line hook in `src/hooks/useRowSelection.ts` and a tri-state checkbox in the header.

Selection belongs to the result set. It survives paging and sorting, so one run can cover several pages. It clears when the search or the status filter changes, because the selected rows might not be in the new result.

## The mock server ships to production

There is no backend. MSW intercepts requests in the browser and answers from a seeded dataset of 500 invoices, so every visitor sees the same data. It costs 160 kB gzipped before the first render. The app waits for the worker at most five seconds: a worker stuck in installation once left the page blank with no error, so after the timeout the app renders anyway and the table shows its load error with a Try again button.

## Server conditions go through the mock API

The Simulate server conditions control is there for the demo. It lets a visitor cause failures on demand instead of waiting for the 8% of temporary errors on the Normal setting. It changes the mock's settings with `PUT /api/server-conditions`, like any other request, instead of importing them, so the import rules below hold for it too. The presets only change latency and temporary failures: paid, void and draft invoices fail on every setting, because those are business rules. The cost is a control that a real product would not ship, kept in the header, apart from the invoices screen.

## Architecture

Domain code lives in `src/features/`. Shared code in `components/`, `hooks/` and `lib/` knows nothing about invoices. A feature never imports from another feature, and the application code never imports from `src/mocks/`. Only the entry file starts the mock worker, so replacing MSW with a real API would not touch the client. The bulk runner sits in `src/hooks/` because it only knows ids and a function to call.

ESLint's `no-restricted-imports` in `eslint.config.js` checks these rules, so a wrong import fails the lint. Before the rule existed, the editor's auto-import had added an import from `src/mocks/` twice.

## Dates and money

The interface is in English for a European audience, so numbers and dates use the `en-150` locale (English for Europe): €1,234.56 and 05 Oct 2026. Due dates are formatted in UTC.
