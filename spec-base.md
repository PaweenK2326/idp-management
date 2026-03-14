# IDP Management System — AI-Spec

> **Spec Version:** 1.0  
> **Target:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma · Vercel Postgres  
> **Purpose:** PoC / Internal Demo — prove feasibility and validate UI/UX  
> **Instruction for AI:** Generate code **strictly** following this spec. Do not add features not listed here. Ask for clarification before deviating.

---

## 1. PROJECT OVERVIEW

| Field         | Value                                                                |
| ------------- | -------------------------------------------------------------------- |
| App Name      | IDP Management System                                                |
| Type          | Web App (Next.js App Router)                                         |
| Deployment    | Vercel (GitHub auto-deploy)                                          |
| Auth Strategy | Mock Login — no OAuth, no JWT, use HTTP-only cookie storing `userId` |
| Phase         | PoC (1-day build)                                                    |

**Problem:** No centralized system to manage Individual Development Plans (IDP) across parent/subsidiary companies.

**Goal of this PoC:** Demonstrate a working IDP submission form + HR summary dashboard backed by a real database, deployable on Vercel.

---

## 2. USER ROLES

| Role Enum    | Label        | Scope                                                  |
| ------------ | ------------ | ------------------------------------------------------ |
| `EMPLOYEE`   | Employee     | Can submit/view own IDP only                           |
| `HR_COMPANY` | HR (Company) | Can view all users & IDP in own company + subsidiaries |
| `HR_GROUP`   | HR (Group)   | Can view all companies, all users, all IDP             |

---

## 3. PROJECT STRUCTURE

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (font, global CSS)
│   ├── page.tsx                    # Login page (mock selector)
│   ├── dashboard/
│   │   └── page.tsx                # HR Dashboard (HR_COMPANY / HR_GROUP only)
│   ├── idp/
│   │   └── page.tsx                # IDP Form page (EMPLOYEE only)
│   └── api/
│       └── auth/
│           └── logout/route.ts     # POST — clear session cookie
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── DeadlineBanner.tsx      # Persistent alert for pending IDP
│   ├── login/
│   │   └── MockLoginForm.tsx
│   ├── idp/
│   │   └── IdpForm.tsx
│   └── dashboard/
│       ├── StatsCards.tsx
│       ├── SubmissionTable.tsx
│       └── SubmissionChart.tsx
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── session.ts                  # read/write session cookie helpers
│   └── utils.ts                    # cn(), getCurrentQuarter(), etc.
├── actions/
│   ├── auth.actions.ts             # loginAction, logoutAction
│   ├── idp.actions.ts              # submitIdpAction, getMyIdpAction
│   └── dashboard.actions.ts        # getDashboardStats, getCompanyUsers
├── types/
│   └── index.ts                    # Shared TypeScript types / Zod schemas
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## 4. DATABASE SCHEMA (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

enum Role {
  EMPLOYEE
  HR_COMPANY
  HR_GROUP
}

enum IdpStatus {
  TODO
  IN_PROGRESS
  COMPLETED
}

model Company {
  id        String    @id @default(uuid())
  name      String
  parentId  String?
  parent    Company?  @relation("CompanyHierarchy", fields: [parentId], references: [id])
  children  Company[] @relation("CompanyHierarchy")
  users     User[]
  createdAt DateTime  @default(now())
}

model User {
  id        String          @id @default(uuid())
  name      String
  email     String          @unique
  role      Role            @default(EMPLOYEE)
  companyId String
  company   Company         @relation(fields: [companyId], references: [id])
  idps      IdpSubmission[]
  createdAt DateTime        @default(now())
}

model IdpSubmission {
  id           String    @id @default(uuid())
  userId       String
  year         Int
  quarterStart Int       // 1–4
  quarterEnd   Int       // 1–4
  skillGoal    String
  actionPlan   String
  status       IdpStatus @default(TODO)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  user         User      @relation(fields: [userId], references: [id])
}
```

---

## 5. SEED DATA (`prisma/seed.ts`)

Create the following fixed records so the app can demo immediately.

> **Assumption:** Current date = **Q1 2026** (Jan–Mar 2026). Overdue = any IDP whose `quarterEnd` and `year` fall before the current quarter and has status `TODO` or `IN_PROGRESS`.

**Companies:**
| id (short ref) | name | parentId |
|---|---|---|
| `comp-group` | TechGroup Holding | null |
| `comp-a` | TechGroup Alpha | `comp-group` |
| `comp-b` | TechGroup Beta | `comp-group` |

**Users (5 total — 1 EMPLOYEE per leaf company):**
| name | email | role | company |
|---|---|---|---|
| Alice | alice@techgroup.com | `HR_GROUP` | `comp-group` |
| Bob | bob@alpha.com | `HR_COMPANY` | `comp-a` |
| Carol | carol@alpha.com | `EMPLOYEE` | `comp-a` |
| Henry | henry@beta.com | `HR_COMPANY` | `comp-b` |
| Frank | frank@beta.com | `EMPLOYEE` | `comp-b` |

**IDP Submissions (2 records — both overdue):**
| User | year | quarterStart | quarterEnd | skillGoal | status |
|---|---|---|---|---|---|
| Carol | 2025 | 4 | 4 | "Advanced TypeScript & React Patterns" | `IN_PROGRESS` |
| Frank | 2025 | 3 | 4 | "Leadership & Cross-team Communication" | `TODO` |

> Both submissions are from Q3–Q4 2025 and are not `COMPLETED`, making them **overdue** as of Q1 2026. This exercises the overdue banner on both employee accounts and the overdue count on the HR dashboard.

---

## 6. AUTHENTICATION (Mock Session)

### Strategy

- On login: write an **HTTP-only cookie** named `session` containing `userId` (plain string, no encryption needed for PoC).
- On every protected page: read cookie → fetch user from DB → redirect to `/` if not found.
- No middleware needed for PoC; do auth check inside each page's `async` Server Component.

### `lib/session.ts`

```ts
// Exports:
export async function getSession(): Promise<User | null>; // reads cookie, queries DB
export async function setSession(userId: string): Promise<void>; // sets cookie
export async function clearSession(): Promise<void>; // clears cookie
```

### `actions/auth.actions.ts`

```ts
// loginAction(userId: string): Promise<void>
//   - Validates userId exists in DB
//   - Calls setSession(userId)
//   - redirect() to /idp (EMPLOYEE) or /dashboard (HR_*)

// logoutAction(): Promise<void>
//   - Calls clearSession()
//   - redirect() to /
```

---

## 7. PAGES & ROUTING

### 7.1 `/` — Mock Login Page

**Access:** Public (redirect to `/idp` or `/dashboard` if already logged in)

**UI Layout:**

```
[Centered card, max-w-md]
  Title: "IDP Management System"
  Subtitle: "Select your account to continue (Demo)"

  [Scrollable list of User cards — fetched from DB]
  Each card shows:
    - Avatar initials (first letter of name)
    - Full name
    - Role badge (color-coded: blue=Employee, amber=HR Company, red=HR Group)
    - Company name

  [Login Button] — enabled only when a user card is selected
```

**Behavior:**

- Clicking a user card marks it as selected (highlighted border).
- Clicking "Login" calls `loginAction(selectedUserId)`.
- Show loading spinner on button while action is pending.

---

### 7.2 `/idp` — IDP Submission Form

**Access:** `EMPLOYEE` only. Redirect others to `/dashboard`.

**Layout:**

```
[Navbar]
[DeadlineBanner — if current quarter has no submission]
[Page content — max-w-2xl centered]
  Heading: "My IDP — Q{n} {year}"
  [Existing IDP list — cards showing past submissions]
  [New IDP Form]
```

**DeadlineBanner Logic:**

Evaluate **two independent conditions** and render the highest-priority banner. Only one banner is shown at a time.

**Priority 1 — Overdue (red, always shown first):**

- Query: any IDP where `(year < currentYear) OR (year = currentYear AND quarterEnd < currentQuarter)` AND `status != COMPLETED`.
- If found → show `<Alert variant="destructive">`:
  ```
  🚨 You have overdue IDP(s) from Q{quarterEnd} {year} that are not completed.
     Please update your IDP status as soon as possible.
  ```
- Include a **"View IDP"** button that scrolls to the existing IDP list below.

**Priority 2 — Missing Current Quarter (amber, shown only if no overdue):**

- Query: any IDP where `year = currentYear AND quarterStart <= currentQuarter AND quarterEnd >= currentQuarter`.
- If **no record found** → show `<Alert>` with yellow styling (use `className` override since shadcn has no `warning` variant):
  ```
  ⚠️ You have not submitted your IDP for Q{n} {year}.
     Deadline: {last day of current quarter, e.g. "March 31, 2026"}.
  ```

**Priority 3 — Current Quarter TODO (blue, shown only if no overdue and record exists):**

- If current-quarter IDP exists with `status = TODO` → show `<Alert>` (default/info style):
  ```
  📋 Your Q{n} {year} IDP is saved but not started yet. Remember to update your progress.
  ```

**No banner:** current-quarter IDP has `status = IN_PROGRESS` or `COMPLETED`.

**IDP Form Fields:**

| Field          | Type              | Validation                 | Notes                                 |
| -------------- | ----------------- | -------------------------- | ------------------------------------- |
| `year`         | `number` (hidden) | auto-filled = current year |                                       |
| `quarterStart` | `select` (1–4)    | required                   | Default = current quarter             |
| `quarterEnd`   | `select` (1–4)    | required, ≥ quarterStart   |                                       |
| `skillGoal`    | `textarea`        | required, min 10 chars     |                                       |
| `actionPlan`   | `textarea`        | required, min 10 chars     |                                       |
| `status`       | `select`          | required                   | Options: TODO, IN_PROGRESS, COMPLETED |

**Submit Behavior:**

- Use `react-hook-form` + `zod` for client-side validation.
- On submit: call `submitIdpAction(data)` (Server Action).
- On success: show `<Toast>` "IDP submitted successfully!" and refresh the existing IDP list.
- On error: show inline error message below the form.

---

### 7.3 `/dashboard` — HR Dashboard

**Access:** `HR_COMPANY` or `HR_GROUP` only. Redirect `EMPLOYEE` to `/idp`.

**Layout:**

```
[Navbar]
[Page — max-w-6xl]
  Heading: "IDP Dashboard — {companyName or 'All Companies'}"

  [Company Selector — HR_GROUP only]
    Dropdown to filter by company (includes "All Companies" option)

  [Stats Cards Row — 4 cards]

  [Two-column grid]
    Left: SubmissionChart
    Right: SubmissionTable
```

**Stats Cards:**

| Card            | Value                                 | Description                                      |
| --------------- | ------------------------------------- | ------------------------------------------------ |
| Total Employees | `totalEmployees`                      | Count of users with role EMPLOYEE in scope       |
| Submitted       | `submittedCount`                      | Employees with at least 1 IDP in current quarter |
| Pending         | `pendingCount`                        | Employees with NO IDP in current quarter         |
| Completion Rate | `(submitted/total * 100).toFixed(0)%` |                                                  |

**SubmissionChart:**

- Type: **Pie or Donut chart** using Recharts.
- Data: `[{ name: "Submitted", value: submittedCount }, { name: "Pending", value: pendingCount }]`
- Colors: `submitted = #22c55e (green-500)`, `pending = #f59e0b (amber-500)`

**SubmissionTable:**

- Columns: Employee Name · Company · Q-Period · Skill Goal (truncated 40 chars) · Status (badge) · Submitted Date
- Show all IDP submissions in scope, sorted by `createdAt DESC`.
- Status badge colors: `TODO = gray`, `IN_PROGRESS = blue`, `COMPLETED = green`.

---

## 8. SERVER ACTIONS

File: `actions/idp.actions.ts`

```ts
// submitIdpAction(data: IdpFormInput): Promise<ActionResult>
//   - Validate session (must be EMPLOYEE)
//   - Validate input with Zod
//   - Create IdpSubmission record
//   - Return { success: true } or { success: false, error: string }

// getMyIdps(): Promise<IdpSubmission[]>
//   - Validate session
//   - Return all IdpSubmissions for current user, ordered by createdAt DESC

// getOverdueIdps(): Promise<IdpSubmission[]>
//   - Validate session (must be EMPLOYEE)
//   - Return all IDP records where:
//       (year < currentYear) OR (year = currentYear AND quarterEnd < currentQuarter)
//       AND status != COMPLETED
//   - Used by DeadlineBanner to determine Priority 1 alert

// getIdpBannerState(userId: string): Promise<BannerState>
//   - Runs both overdue + current-quarter queries in parallel (Promise.all)
//   - Returns one of: "OVERDUE" | "MISSING_CURRENT" | "TODO_CURRENT" | "NONE"
//   - Used by the /idp page Server Component to pass initial state to DeadlineBanner
```

File: `actions/dashboard.actions.ts`

```ts
// getDashboardStats(companyId?: string): Promise<DashboardStats>
//   - HR_GROUP: if no companyId, aggregate across all companies
//   - HR_COMPANY: ignore companyId param, always scope to own company + children
//   - Returns: { totalEmployees, submittedCount, pendingCount, completionRate, quarter, year }

// getSubmissionList(companyId?: string): Promise<SubmissionRow[]>
//   - Returns flat list of IDP rows for the table
//   - SubmissionRow: { id, userName, companyName, quarterStart, quarterEnd, skillGoal, status, createdAt }

// getCompaniesForSelector(): Promise<Company[]>
//   - HR_GROUP only: return all companies
//   - HR_COMPANY: return own + children
```

---

## 9. TYPESCRIPT TYPES (`types/index.ts`)

```ts
import { z } from "zod";

// ---- Zod Schemas ----
export const IdpFormSchema = z
  .object({
    year: z.number().int(),
    quarterStart: z.number().int().min(1).max(4),
    quarterEnd: z.number().int().min(1).max(4),
    skillGoal: z.string().min(10),
    actionPlan: z.string().min(10),
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  })
  .refine((d) => d.quarterEnd >= d.quarterStart, {
    message: "Quarter End must be ≥ Quarter Start",
    path: ["quarterEnd"],
  });

export type IdpFormInput = z.infer<typeof IdpFormSchema>;

// ---- Server Action Result ----
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type BannerState =
  | "OVERDUE"
  | "MISSING_CURRENT"
  | "TODO_CURRENT"
  | "NONE";

// ---- Dashboard ----
export type DashboardStats = {
  totalEmployees: number;
  submittedCount: number;
  pendingCount: number;
  completionRate: number;
  quarter: number;
  year: number;
};

export type SubmissionRow = {
  id: string;
  userName: string;
  companyName: string;
  quarterStart: number;
  quarterEnd: number;
  skillGoal: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  createdAt: Date;
};
```

---

## 10. ENVIRONMENT VARIABLES

```env
# .env.local
POSTGRES_PRISMA_URL=          # Vercel Postgres pooling URL
POSTGRES_URL_NON_POOLING=     # Vercel Postgres direct URL
SESSION_COOKIE_NAME=session   # Cookie name constant
```

---

## 11. COMPONENT LIBRARY USAGE (shadcn/ui)

Install these components before generating UI code:

```bash
npx shadcn@latest add button card badge alert select textarea toast table avatar separator
```

- **`<Alert>`** — DeadlineBanner (variant `destructive` or default)
- **`<Card>`** — Stats cards, Login user cards, IDP list items
- **`<Badge>`** — Role labels, IDP status
- **`<Select>`** — Quarter selector, Status selector, Company selector
- **`<Textarea>`** — skillGoal, actionPlan fields
- **`<Toast>` / `useToast()`** — Success/error feedback on form submit
- **`<Table>`** — SubmissionTable in dashboard
- **`<Avatar>`** — User initials in login page and navbar

---

## 12. UTILITY FUNCTIONS (`lib/utils.ts`)

```ts
// getCurrentQuarter(): number
//   Returns 1–4 based on current month

// getQuarterDateRange(year: number, quarter: number): { start: Date; end: Date }
//   Q1 = Jan–Mar, Q2 = Apr–Jun, Q3 = Jul–Sep, Q4 = Oct–Dec

// formatQuarterLabel(qs: number, qe: number, year: number): string
//   e.g. "Q1–Q2 2026" or "Q1 2026" if qs === qe

// getSubsidiaryIds(companies: Company[], rootId: string): string[]
//   Recursive traversal to collect child company IDs
```

---

## 13. NAVBAR COMPONENT

**Shown on:** All protected pages (`/idp`, `/dashboard`)

**Content:**

- Left: App logo/name "IDP System"
- Right: User avatar + name + role badge + **Logout button**

**Logout:** calls `logoutAction()` → redirect to `/`

---

## 14. ERROR & EDGE CASES

| Scenario                                         | Expected Behavior                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| User accesses `/dashboard` as EMPLOYEE           | Server redirect to `/idp`                                                    |
| User accesses `/idp` as HR                       | Server redirect to `/dashboard`                                              |
| Unauthenticated user accesses any protected page | Server redirect to `/`                                                       |
| `submitIdpAction` called without valid session   | Return `{ success: false, error: "Unauthorized" }`                           |
| DB down / Prisma error                           | Return `{ success: false, error: "Internal server error" }` — log to console |
| Quarter selector: quarterEnd < quarterStart      | Zod `refine` error shown inline under quarterEnd field                       |

---

## 15. OUT OF SCOPE (Do NOT implement)

- Real authentication (OAuth, NextAuth, JWT)
- Email notifications
- File upload / attachments
- Edit or delete existing IDP submissions
- Pagination (table shows max 50 rows for PoC)
- i18n / multi-language (UI text can be in English or Thai, pick one and stay consistent)
- Dark mode
- Unit tests / E2E tests
