# Coffee Cart — Playwright Test Runner

🇺🇦 [Українська](#українська) | 🇬🇧 [English](#english)

---

## Українська

### Застосунок під тестуванням

[Coffee Cart](https://seleniumbase.io/coffee/) — демонстраційний SPA-застосунок.

| Сторінка | Маршрут        |
| -------- | -------------- |
| Меню     | `/coffee/`     |
| Кошик    | `/coffee/cart` |

### Мета

Закріпити фундамент тестового раннера Playwright: структуру тестів
(`test` / `describe` / хуки), автоочікувані перевірки `expect` і базову
конфігурацію з кількома `projects`. Без Page Object, fixtures чи
авторизації — це теми наступних ДЗ.

### Структура проєкту

```
.
├── playwright.config.ts   # надана конфігурація — не редагувати
├── tsconfig.json           # налаштування TypeScript для tests/
├── eslint.config.mjs       # рекомендований лінтер для Playwright-тестів
├── .prettierrc.json         # налаштування форматування Prettier
├── .prettierignore          # файли/папки, які Prettier не торкає
├── package.json            # npm-скрипти для тестів, звіту, лінтера й форматування
├── .gitignore               # ігнорує node_modules, звіти, трейси
└── tests/
    └── coffee-cart.spec.ts  # скелет тестів (структура без логіки)
```

`tests/coffee-cart.spec.ts` — це **скелет**, а не готові тести:

- усі сценарії згруповані в `test.describe('Coffee Cart')`;
- `test.beforeEach` відкриває `/coffee/` перед кожним тестом, щоб не
  дублювати навігацію;
- кожен `test(...)` має осмислену назву та виклик
  `test.skip(true, 'TODO: ...')` із описом, що саме потрібно
  реалізувати (локатори, дії, перевірки `expect`);
- smoke-тест уже позначений тегом `@smoke` у назві;
- розділ `Optional` містить заготовки для промо-діалогу, завершення
  оплати, умовного `test.skip` за браузером та анотації issue.

Реалізація логіки тестів (локатори, дії, `expect`) — наступний крок,
не входить до цього завдання.

### Конфігурація (`playwright.config.ts`)

Файл надано умовою завдання й використовується без змін:

- `testDir: './tests'` — тести лежать у `tests/`;
- `baseURL: 'https://seleniumbase.io'` — у тестах достатньо
  `page.goto('/coffee/')`;
- `projects`: `chromium` і `firefox` увімкнені, `webkit` — навмисно
  закоментований (вимога: `npx playwright test` запускає саме ці два
  браузери);
- `reporter: 'html'` — після прогону доступний HTML-звіт;
- `trace: 'on-first-retry'` — трейс збирається лише при повторній
  спробі після падіння.

### Передумови

```bash
npm install
npx playwright install
```

Потрібен Node.js LTS (≥ 18).

### Корисні команди

```bash
npx playwright test                 # усі браузери з конфігурації
npx playwright test --grep @smoke   # лише smoke-тести
npx playwright test --headed        # з видимим вікном браузера
npx playwright test --ui            # інтерактивний UI-режим
npx playwright test --debug         # покрокове виконання
npx playwright show-report          # відкрити HTML-звіт
npx playwright show-trace test-results/.../trace.zip  # переглянути трейс
npx playwright codegen https://seleniumbase.io/coffee/ # підбір локаторів
```

Ті самі команди доступні через `npm run`: `test`, `test:smoke`,
`test:headed`, `test:ui`, `report` (див. `package.json`).

### Підказки щодо локаторів

- Чашки напоїв — `<div>` з `aria-label`/`data-test`, наприклад
  `[data-test="Espresso"]` або `getByLabel('Espresso')`. Текст із
  назвою й ціною в `<h4>` — це заголовок, не клікабельний елемент.
- Лічильник кошика — текст посилання `cart (N)` у навігації.
- Підсумок — кнопка `[data-test="checkout"]` з текстом `Total: $X.XX`.
- Модальне вікно оплати містить поля `#name`, `#email` і кнопку
  `#submit-payment`.
- Промо-діалог (`<dialog>`) з кнопками `Yes`/`No` зʼявляється після
  кожного 3-го доданого напою.

### Лінтер

Рекомендована для Playwright конфігурація ESLint (flat config,
`eslint.config.mjs`): `typescript-eslint` (recommended) +
`eslint-plugin-playwright` (`flat/recommended`), застосована до файлів
у `tests/`. З `flat/recommended` додатково підкручено/додано декілька
правил під вимоги саме цього завдання:

- `playwright/no-wait-for-timeout` → `error` (було `warn`) — це
  головний критерій завдання: жодних `page.waitForTimeout()`;
- `playwright/no-wait-for-selector` → `error` — `waitForSelector()` теж
  ручне очікування, замість нього мають бути автоочікувані локатори/
  `expect`;
- `playwright/require-top-level-describe` → `error` — кожен spec-файл
  має мати тести всередині `test.describe(...)`, що відповідає вимозі
  групувати все в `test.describe('Coffee Cart')`;
- `playwright/no-raw-locators` → `warn` — заохочує
  `aria-label`/`data-test`/role-локатори замість довільних CSS-
  селекторів (саме так побудовані підказки в розділі "Локатори" вище);
- `playwright/no-commented-out-tests` → `warn` — попереджає про тести,
  закриті в коментарі (`//`), замість видалення чи `test.skip`.

Залишені з `flat/recommended` правила теж важливі: `expect-expect`
(тест без жодного `expect`), `no-skipped-test` (звідси й попередження
на поточному скелеті — усі тести тимчасово `test.skip(true, 'TODO: ...')`,
доки логіку не реалізовано), `valid-title`, `prefer-web-first-assertions`,
`no-focused-test`, `no-networkidle` та інші.

```bash
npm run lint       # перевірити
npm run lint:fix    # авто-виправлення там, де можливо
```

### Форматування (Prettier)

`prettier` форматує код, а `eslint-config-prettier` підключено останнім
у `eslint.config.mjs`, щоб вимкнути в ESLint усі стильові правила, які
могли б конфліктувати з Prettier (рекомендований спосіб поєднання
ESLint + Prettier — без `eslint-plugin-prettier`, аби лінт і форматування
не змішувались і лінтер не гальмував на форматуванні). Налаштування —
у `.prettierrc.json` (`.prettierignore` виключає `node_modules`,
`test-results`, `playwright-report`, `blob-report`).

```bash
npm run format        # відформатувати всі файли
npm run format:check  # лише перевірити, нічого не змінюючи (для CI)
```

### Головне правило

Заборонено `page.waitForTimeout()` і будь-який `sleep`. Уся
синхронізація — лише через автоочікувані `expect`.

---

## English

### Application under test

[Coffee Cart](https://seleniumbase.io/coffee/) — a demo SPA.

| Page | Route          |
| ---- | -------------- |
| Menu | `/coffee/`     |
| Cart | `/coffee/cart` |

### Goal

Build the foundation of a Playwright test runner: test structure
(`test` / `describe` / hooks), auto-waiting `expect` assertions, and a
basic config with multiple `projects`. No Page Objects, fixtures, or
authentication yet — those are covered in later assignments.

### Project structure

```
.
├── playwright.config.ts   # provided config — do not edit
├── tsconfig.json           # TypeScript settings for tests/
├── eslint.config.mjs       # recommended linter setup for Playwright tests
├── .prettierrc.json         # Prettier formatting settings
├── .prettierignore          # files/folders Prettier should skip
├── package.json            # npm scripts for tests, reports, linting and formatting
├── .gitignore               # ignores node_modules, reports, traces
└── tests/
    └── coffee-cart.spec.ts  # test skeleton (structure only, no logic)
```

`tests/coffee-cart.spec.ts` is a **skeleton**, not finished tests:

- every scenario is grouped under `test.describe('Coffee Cart')`;
- `test.beforeEach` navigates to `/coffee/` before each test, avoiding
  duplicated navigation;
- each `test(...)` has a meaningful title and calls
  `test.skip(true, 'TODO: ...')` describing exactly what needs to be
  implemented (locators, actions, `expect` assertions);
- the smoke test is already tagged `@smoke` in its title;
- the `Optional` block has placeholders for the promo dialog, completed
  payment flow, a conditional `test.skip` by browser, and an issue
  annotation.

Implementing the actual test logic (locators, actions, `expect`) is
the next step and is out of scope for this deliverable.

### Configuration (`playwright.config.ts`)

This file was provided by the assignment and is used as-is:

- `testDir: './tests'` — tests live under `tests/`;
- `baseURL: 'https://seleniumbase.io'` — tests can call
  `page.goto('/coffee/')`;
- `projects`: `chromium` and `firefox` are enabled, `webkit` is
  intentionally commented out (requirement: plain
  `npx playwright test` must run exactly these two browsers);
- `reporter: 'html'` — an HTML report is produced after each run;
- `trace: 'on-first-retry'` — traces are only captured on retry after
  a failure.

### Prerequisites

```bash
npm install
npx playwright install
```

Requires Node.js LTS (≥ 18).

### Useful commands

```bash
npx playwright test                 # all browsers from the config
npx playwright test --grep @smoke   # smoke tests only
npx playwright test --headed        # with a visible browser window
npx playwright test --ui            # interactive UI mode
npx playwright test --debug         # step-by-step debugging
npx playwright show-report          # open the HTML report
npx playwright show-trace test-results/.../trace.zip  # inspect a trace
npx playwright codegen https://seleniumbase.io/coffee/ # find locators
```

The same actions are available via `npm run`: `test`, `test:smoke`,
`test:headed`, `test:ui`, `report` (see `package.json`).

### Locator hints

- Coffee cups are `<div>` elements with `aria-label`/`data-test`,
  e.g. `[data-test="Espresso"]` or `getByLabel('Espresso')`. The
  `<h4>` with name and price is a heading, not a clickable element.
- The cart counter is the `cart (N)` link text in the nav.
- The checkout button is `[data-test="checkout"]` showing
  `Total: $X.XX`.
- The payment modal contains `#name`, `#email` fields and a
  `#submit-payment` button.
- A `<dialog>` promo prompt with `Yes`/`No` buttons appears after
  every 3rd item added to the cart.

### Linting

Recommended ESLint setup for Playwright (flat config,
`eslint.config.mjs`): `typescript-eslint` (recommended) +
`eslint-plugin-playwright` (`flat/recommended`), applied to files in
`tests/`. A few rules from `flat/recommended` are tightened/added
specifically for this assignment's requirements:

- `playwright/no-wait-for-timeout` → `error` (was `warn`) — this is
  the assignment's main hard requirement: no `page.waitForTimeout()`;
- `playwright/no-wait-for-selector` → `error` — `waitForSelector()` is
  also a manual wait; auto-waiting locators/`expect` should be used
  instead;
- `playwright/require-top-level-describe` → `error` — every spec file
  must have its tests inside a `test.describe(...)`, matching the
  requirement to group everything under `test.describe('Coffee Cart')`;
- `playwright/no-raw-locators` → `warn` — encourages
  `aria-label`/`data-test`/role-based locators over arbitrary CSS
  selectors (matching the "Locator hints" section above);
- `playwright/no-commented-out-tests` → `warn` — flags tests commented
  out instead of removed or `test.skip`'d.

The rest of `flat/recommended` still applies and matters too:
`expect-expect` (tests with no `expect`), `no-skipped-test` (which is
why the current skeleton shows warnings — every test is temporarily
`test.skip(true, 'TODO: ...')` until implemented), `valid-title`,
`prefer-web-first-assertions`, `no-focused-test`, `no-networkidle`, etc.

```bash
npm run lint        # check
npm run lint:fix     # auto-fix what's fixable
```

### Formatting (Prettier)

`prettier` handles code formatting, and `eslint-config-prettier` is
loaded last in `eslint.config.mjs` to turn off any ESLint stylistic
rules that could conflict with Prettier (the recommended way to
combine ESLint + Prettier — without `eslint-plugin-prettier`, so
linting and formatting stay separate and linting doesn't slow down on
formatting). Settings live in `.prettierrc.json`
(`.prettierignore` excludes `node_modules`, `test-results`,
`playwright-report`, `blob-report`).

```bash
npm run format        # format all files
npm run format:check  # check only, change nothing (for CI)
```

### Golden rule

`page.waitForTimeout()` and any form of `sleep` are forbidden. All
synchronization must rely on auto-waiting `expect` assertions.
