# Bulk operations dashboard

An invoice admin screen built around one problem: running a bulk action when some of them fail.

Live demo: <https://bulk-operations-dashboard.vercel.app>

React 19, TypeScript, Vite, Mantine, TanStack Router and TanStack Query, MSW, Vitest. I used Mantine's components and mostly its default styling so the focus could go into state and behaviour.

## The problem

This project is the invoices screen of a made-up billing tool. You select invoices and send payment reminders. Some go out, some fail because the invoice is already paid, and some because the mail provider timed out. The screen has to tell those cases apart, let you retry only the ones worth retrying, and give you a few seconds to change your mind before anything is sent.

The second idea is that the URL holds the view. Search, status filters, sorting and pagination live in the query string, so a copied link opens the same page for whoever receives it.

## Try it

Select a few rows, or a whole page with the header checkbox, and press Send reminders. For five seconds the bar says "Reminders: 10 queued" and offers Undo. Then the batches go out and each row shows Sent, or a red Failed with the reason in a tooltip. The bar ends with a summary such as "Reminders: 4 sent, 6 failed". If some failures were temporary, a Retry button appears for those rows only.

Even on the Normal setting most runs include failures. Paid, void and draft invoices can never receive a reminder, and they are about half of the default view. Retrying them would change nothing, so Retry leaves them out.

The Simulate server conditions control at the top changes how the fake server behaves as described when selectetd.

## Decisions

The full reasoning is in [docs/decisions.md](docs/decisions.md).

- [The run](docs/decisions.md#the-run-is-a-reducer), and every number on screen is computed from it.
- [Batches](docs/decisions.md#batches-run-one-after-another), so progress moves in real steps.
- [No progress bar](docs/decisions.md#no-progress-bar), because a run is over in half a second.
- [Only temporary failures can be retried](docs/decisions.md#two-kinds-of-failure).
- [Undo reminders](docs/decisions.md#undo-waits-before-sending), because an email cannot be unsent.
- [The URL holds the whole view](docs/decisions.md#the-url-holds-the-view), through a custom serializer.
- [Sticky bar](docs/decisions.md#what-stays-on-screen).
- [Buttons that disappear hand focus to the select-all checkbox](docs/decisions.md#keeping-focus-in-place).
- [Why no TanStack Table](docs/decisions.md#no-table-library), because the selection is the part worth reading.
- [The mock server ships to production](docs/decisions.md#the-mock-server-ships-to-production), because there is no backend.
- [Server conditions are a demo control](docs/decisions.md#server-conditions-go-through-the-mock-api) for causing failures on demand.
- [ESLint enforces the import rules](docs/decisions.md#architecture).
- [Dates and money locale](docs/decisions.md#dates-and-money).

## Numbers

Measured on the production build and on the live site with Lighthouse in desktop mode:

- first contentful paint 0.5 s, largest contentful paint 0.6 s, total blocking time 0 ms, layout shift 0
- 348 kB of gzipped JavaScript before the first row, 160 kB of it MSW
- 38 unit tests

## Running it

You need Node 20.19 or 22.12 and later (Vite 8 requires it) and pnpm.

```sh
pnpm install
pnpm dev
```

The checks, which exit when they are done:

```sh
pnpm test --run
pnpm lint
pnpm exec tsc -b
```

## Known limitations

Only business logic files have tests

Nothing warns you when an invoice already got a reminder today. That check belongs to the server at send time: the client only holds the current page of the selection, and a skipped invoice would need a third outcome next to sent and failed.

After the tab has been idle for a while, the table sometimes fails to load. My guess is that the browser stops the idle service worker and MSW stops answering.
