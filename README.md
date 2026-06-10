# Payment Component
Payment Component
# Saaga Institute - Tuition Management System

A production-ready full-stack tuition institute management system built for **Saaga Institute** (Owner: Sanchitha).

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **MongoDB** + **Mongoose**
- **Tailwind CSS** + **Shadcn UI**
- **React Hook Form** + **Zod**
- **TanStack Table**
- **Recharts**
- **jsPDF** (PDF export)

## Features

- Dashboard with summary cards and charts
- Teacher, Student, Class, Enrollment management (CRUD)
- Payment entry with automatic revenue split calculation
- Payment records with search, filter, CSV/PDF export
- Teacher-wise payment reports
- Owner commission reports
- Analytics page with 6 charts
- Printable receipts with PDF export
- Dark mode support

## Revenue Sharing Rules

| Scenario | Owner Share | Teacher Share |
|----------|-------------|---------------|
| Other teacher's class | 20% | 80% |
| Sanchitha's own class | 100% (full amount) | 100% (full amount) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saaga-institute
OWNER_EMAIL=sanchitha@saaga-institute.com
OWNER_PASSWORD=Admin@123
```

4. Seed the database:

```bash
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) — you'll land directly on the dashboard.

## Project Structure

```
saaga-institute-payment/
├── scripts/             # Database seed script
├── src/
│   ├── app/             # Next.js App Router pages & API routes
│   ├── components/      # React UI components
│   ├── lib/             # Shared utilities & business logic
│   ├── models/          # Mongoose database schemas
│   └── types/           # TypeScript type definitions
├── .env.example         # Environment variable template
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and npm scripts
├── tailwind.config.ts   # Tailwind CSS theme configuration
└── tsconfig.json        # TypeScript compiler options
```

## File Reference

What each file in the project does.

### Root configuration

| File | Description |
|------|-------------|
| `package.json` | Project metadata, npm scripts (`dev`, `build`, `seed`), and dependency list |
| `tsconfig.json` | TypeScript settings including path aliases (`@/*` → `src/*`) |
| `next.config.ts` | Next.js app configuration (e.g. server action body size limit) |
| `tailwind.config.ts` | Tailwind theme, colors, dark mode, and animation plugin setup |
| `postcss.config.mjs` | PostCSS pipeline for Tailwind CSS processing |
| `eslint.config.mjs` | ESLint rules for Next.js and TypeScript |
| `.env.example` | Template for required environment variables (`MONGODB_URI`, owner credentials) |
| `.gitignore` | Files and folders excluded from version control |

### Scripts

| File | Description |
|------|-------------|
| `scripts/seed.ts` | Populates MongoDB with sample teachers, students, classes, enrollments, payments, and owner user accounts |

### App — pages (`src/app/`)

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout wrapping the app with theme provider and toast notifications |
| `page.tsx` | Home route; redirects visitors to `/dashboard` |
| `globals.css` | Global styles, CSS variables for light/dark themes, and print styles for receipts |
| `(dashboard)/layout.tsx` | Dashboard shell layout with sidebar and header |
| `(dashboard)/dashboard/page.tsx` | Main dashboard with stat cards and revenue/earnings charts |
| `(dashboard)/students/page.tsx` | Student list with search, filters, pagination, and create/edit/delete dialogs |
| `(dashboard)/teachers/page.tsx` | Teacher management with CRUD, search, and share percentage settings |
| `(dashboard)/classes/page.tsx` | Class management — assign teachers, set fees, schedules, and subjects |
| `(dashboard)/enrollments/page.tsx` | Enroll students in classes; searchable list with status filter |
| `(dashboard)/payments/page.tsx` | Payment records table with search, filters, CSV/PDF export |
| `(dashboard)/payments/new/page.tsx` | New payment form with searchable student picker and revenue split preview |
| `(dashboard)/payments/[id]/receipt/page.tsx` | Printable payment receipt with print and PDF export |
| `(dashboard)/reports/page.tsx` | Teacher-wise payment reports and owner commission breakdown |
| `(dashboard)/analytics/page.tsx` | Analytics page with six Recharts visualizations |
| `(dashboard)/settings/page.tsx` | Institute info, owner details, and revenue sharing rules |

### App — API routes (`src/app/api/`)

| File | Description |
|------|-------------|
| `teachers/route.ts` | `GET` list/create teachers; `POST` creates linked user account when password provided |
| `teachers/[id]/route.ts` | `GET`, `PUT`, `DELETE` for a single teacher |
| `students/route.ts` | `GET` list students with search/pagination; `POST` create with auto-generated `studentId` |
| `students/[id]/route.ts` | `GET`, `PUT`, `DELETE` for a single student |
| `classes/route.ts` | `GET` list classes (populated with teacher); `POST` create class |
| `classes/[id]/route.ts` | `GET`, `PUT`, `DELETE` for a single class |
| `enrollments/route.ts` | `GET` list enrollments with search by student/class; `POST` enroll student |
| `enrollments/[id]/route.ts` | `GET`, `PUT`, `DELETE` for a single enrollment |
| `payments/route.ts` | `GET` list payments with filters; `POST` record payment with automatic revenue split |
| `payments/[id]/route.ts` | `GET`, `PUT`, `DELETE` for a single payment; recalculates shares on update |
| `reports/route.ts` | `GET` teacher reports (`?type=teacher`) or owner commission reports (`?type=owner`) |
| `dashboard/route.ts` | `GET` dashboard stats and chart data (revenue, earnings, student distribution) |

### Components (`src/components/`)

| File | Description |
|------|-------------|
| **Layout** | |
| `layout/sidebar.tsx` | Left navigation menu with links to all dashboard sections |
| `layout/header.tsx` | Top bar with welcome message, admin badge, and dark mode toggle |
| `layout/dashboard-layout.tsx` | Responsive dashboard wrapper; mobile sidebar toggle |
| **Providers** | |
| `providers/theme-provider.tsx` | `next-themes` wrapper for light/dark mode switching |
| **Shared** | |
| `shared/page-header.tsx` | Reusable page title, description, and action button area |
| `shared/stat-card.tsx` | Dashboard metric card with icon and value |
| `shared/data-table-pagination.tsx` | Previous/next pagination controls for tables |
| `shared/loading-spinner.tsx` | Centered loading indicator |
| `shared/searchable-combobox.tsx` | Generic async search dropdown with debounced API calls |
| `shared/student-search-select.tsx` | Student picker used in payment and enrollment forms |
| **Charts** | |
| `charts/chart-container.tsx` | Card wrapper for Recharts chart components |
| **UI (Shadcn)** | |
| `ui/button.tsx` | Button component with variants (default, outline, ghost, etc.) |
| `ui/input.tsx` | Text input field |
| `ui/label.tsx` | Form label |
| `ui/card.tsx` | Card container with header, content, and footer |
| `ui/badge.tsx` | Status badge (active, inactive, admin) |
| `ui/select.tsx` | Dropdown select (Radix UI) |
| `ui/textarea.tsx` | Multi-line text input |
| `ui/dialog.tsx` | Modal dialog for forms and confirmations |
| `ui/table.tsx` | Data table structure (header, body, rows) |
| `ui/separator.tsx` | Horizontal/vertical divider line |
| `ui/dropdown-menu.tsx` | Dropdown menu component |
| `ui/tabs.tsx` | Tabbed content (used on Reports page) |
| `ui/popover.tsx` | Popover container (used by searchable combobox) |

### Library (`src/lib/`)

| File | Description |
|------|-------------|
| `mongodb.ts` | MongoDB connection singleton; prevents duplicate connections in development |
| `constants.ts` | Institute name, owner info, grades, months, payment methods, share percentages |
| `utils.ts` | `cn()` class merger, currency/date formatters, receipt and student ID generators |
| `revenue-sharing.ts` | Calculates owner/teacher payment split (20/80 or full amount for owner classes) |
| `api-response.ts` | Standardized API response helpers (`success`, `error`, `paginated`) |
| `api-helpers.ts` | Pagination params parser, MongoDB search query builder, `withDB` wrapper |
| `auth-helpers.ts` | Default admin session stub (app runs without login) |
| `export.ts` | CSV and PDF export utilities using jsPDF |
| `validations/index.ts` | Zod schemas for teachers, students, classes, enrollments, and payments |

### Models (`src/models/`)

| File | Description |
|------|-------------|
| `Teacher.ts` | Teacher schema — name, subject, contact, share %, owner flag, status |
| `Student.ts` | Student schema — ID, personal info, parent details, school, grade |
| `Class.ts` | Class schema — name, grade, subject, teacher reference, monthly fee, schedule |
| `Enrollment.ts` | Enrollment schema linking a student to a class with status |
| `Payment.ts` | Payment schema — receipt, amounts, owner/teacher shares, method, date |
| `User.ts` | User account schema (used by seed script; login removed from app) |

### Types (`src/types/`)

| File | Description |
|------|-------------|
| `index.ts` | TypeScript interfaces for Teacher, Student, Class, Enrollment, Payment, dashboard stats, and reports |

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/teachers` | GET, POST | Teacher management |
| `/api/teachers/[id]` | GET, PUT, DELETE | Single teacher |
| `/api/students` | GET, POST | Student management |
| `/api/students/[id]` | GET, PUT, DELETE | Single student |
| `/api/classes` | GET, POST | Class management |
| `/api/classes/[id]` | GET, PUT, DELETE | Single class |
| `/api/enrollments` | GET, POST | Enrollment management |
| `/api/enrollments/[id]` | GET, PUT, DELETE | Single enrollment |
| `/api/payments` | GET, POST | Payment management |
| `/api/payments/[id]` | GET, PUT, DELETE | Single payment |
| `/api/reports` | GET | Teacher & owner reports |
| `/api/dashboard` | GET | Dashboard stats & charts |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm run lint` | Run ESLint |

## License

Private - Saaga Institute
