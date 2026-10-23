# Sewa Kamera (Kamera Kita)

Laravel 13 + Inertia 3 + React 18 rental app. The **repository root is the running app**. UI copy and database naming are Indonesian.

## Which app / frontend is live

- `backend/` is an untouched Laravel skeleton (default `welcome` route, default `User` model). Do not edit it or copy patterns from it. Its `backend/AGENTS.md` is auto-loaded and its Laravel/Pint/PHPUnit conventions are useful, but its Boost MCP config does not exist at the repo root.
- Live frontend is `resources/js/App.jsx`, mounted by `resources/js/app.jsx` and `resources/views/app.blade.php`. `src/`, root `index.html`, and `dist/` are an older standalone Vite demo with mock data; editing them does not change the Laravel app.
- Only the `App` Inertia component is used. Controllers call `Inertia::render('App', [...])`; adding a new page component alone will not render it.
- `routes/web.php` ends with catch-all `/admin/{path?}` and `/pelanggan/{path?}` routes. The frontend chooses the page from `window.location.pathname` in `resources/js/App.jsx`. Register new GET routes **before** those catch-alls, then update `getPage()`, `routeForPage()`, and the `Topbar` label map.
- There is no `routes/api.php`; `bootstrap/app.php` registers only web + console routing. New endpoints belong in `routes/web.php` unless you also enable API routing.
- Some screens still render hard-coded demo data (`cameras` / `rentals` constants at the top of `App.jsx`); do not present it as real data.

## Commands

```bash
composer run setup                 # install, .env, key, migrate, npm install, build
composer run dev                   # php artisan serve + queue:listen + pail + npm run dev
npm run build                      # required after JS/CSS changes (Vite manifest)
php artisan test --compact
php artisan test tests/Feature/SettingsTest.php --filter=test_admin_can_update_workspace_settings
vendor/bin/phpunit tests/Feature/SettingsTest.php --filter=...
vendor/bin/pint --dirty --format agent   # PHP formatter; no pint.json, default preset
```

- No JS linter, typecheck, or CI workflows exist.
- On a fresh database, `php artisan db:seed` creates admin `081234567890` and customer `081298765432`; both use the factory password `password`.
- **SQLite is unavailable locally**: `phpunit.xml` forces SQLite `:memory:` (and `.env.example` defaults to SQLite), but the default `/usr/bin/php` 8.4.17 has `pdo_sqlite` disabled. DB tests fail with `could not find driver`, and a fresh setup can fail at `migrate`. Enable `/etc/php.d/30-pdo_sqlite.ini.disabled` (or equivalent) before treating failures as code bugs. `/opt/lampp/bin/php` has SQLite but is 8.2; dependencies require PHP >= 8.4.1.
- Local `.env` uses MySQL database `sewa_kamera`. `phpunit.xml` pins tests to SQLite; do not repoint them at the dev database.

## Data model and auth (not Laravel defaults)

- `App\Models\User` → table `pelanggan`, PK `id_pelanggan`, password column `password_hash`, login by `no_telepon`. Auth is custom (`AuthController`); do not add Breeze/Fortify or standard `email`/`password` columns.
- `Camera` → table `produk`, PK `id_produk`, no timestamps. `Rental` → table `transaksi`, PK `id_transaksi`. `Setting` → table `pengaturan`, singleton via `Setting::current()`.
- Models expose English accessors/props (`name`, `phone`, `transactionCode`, `startDate`, `endDate`, `totalAmount`) while DB columns and validation remain Indonesian. Keep that boundary; do not rename tables/columns to `users`/`cameras`/`rentals`.
- `User` uses Laravel 13 `#[Fillable]` / `#[Hidden]` attributes; the other models use `$fillable`. Match the sibling file you edit.
- `transaksi.status_sewa` stores `menunggu_persetujuan`, `disetujui`, `sedang_disewa`, `selesai`, `ditolak`, `dibatalkan`; the UI displays exact labels such as `Menunggu persetujuan`. `produk.status_ketersediaan` stores `Tersedia`, `Terbatas`, `Disewa`, `Tidak tersedia`.
- Rental dates are inclusive: duration is `diffInDays + 1`, and availability counts overlapping active rentals against `stok` (`RentalController@store`).
- Admin middleware is `role:admin` / `role:customer` (`EnsureRole`). Guests opening protected `/admin/*` pages are redirected to `admin.login`, not `login`.
- Shared Inertia props: `auth.user`, admin-only `settings`, and `flash.success` / `flash.error` (`HandleInertiaRequests`).

## Frontend conventions

- Tailwind 4 is installed in Vite, but `resources/css/app.css` never imports `tailwindcss`; styling is hand-written custom CSS in that file. Tailwind utility classes will not exist unless you add `@import 'tailwindcss'` first. `src/styles.css` is the old demo copy.
- Use Indonesian UI copy and IDR formatting (`Intl.NumberFormat('id-ID', ...)`), and reuse existing classes/components in `resources/js/App.jsx` rather than introducing a new UI library. `PRODUCT.md` mentions shadcn/ui, but it is not installed.
- Inertia form submissions use `router.post/patch/put` with `preserveScroll`/`preserveState` and `onError` as in `AddCameraModal` and `Settings`.

## Repo / artifact gotchas

- `.gitignore` contains only `.env` and `*.md`. `node_modules/`, `vendor/`, `dist/`, `public/build/`, and `public/hot` are tracked, so installs/builds create large diffs. Avoid committing dependency churn.
- `public/hot` points at the Vite dev server (`http://127.0.0.1:5173`). If assets fail while the dev server is not running, remove that file and use `npm run build`.
- `PRD.md` is the requirements source. `FRONTEND_HANDOFF.md` documents the obsolete mock-API frontend, not the current Inertia contract.
