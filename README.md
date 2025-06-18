
# Work Hours Tracker

A web application designed to help users track their daily and monthly work hours, manage different types of work entries (like vacation, sick leave), and calculate summaries. It also includes features for vacation planning and an administration panel for managing users and global settings.

## Features

*   **User Authentication:** Secure login and registration powered by Supabase Auth.
*   **Dashboard:**
    *   **Daily Log:** Input morning and afternoon work segments with start/end times and entry types (Regular, Vacation, Holiday, Recovery, Sick Leave).
    *   **Weekly Contractual Hours:** Define standard working hours for each day of the week.
    *   **Summary Card:** View calculated work rate, annual leave entitlement, contracted weekly hours, planned monthly hours, actual hours worked (plus absences), and overtime/shortfall balance.
*   **Vacation Management:**
    *   Interactive calendar to select and request vacation days.
    *   Tracks vacation status (Selected, Pending Approval, Approved, Rejected).
    *   Calculates remaining annual vacation days and monthly vacation impact.
    *   Printable vacation request forms.
*   **Holiday Management (Admin):**
    *   View and manage global holidays for specific years.
    *   Add custom holidays.
*   **Admin Panel (`AdminDashboardPage.tsx`):**
    *   **Global User Configuration:** Set default work rate (taux), base annual vacation days, and default overall work start/end times.
    *   **User Role Management:** View users and change their roles (user/admin).
    *   **Vacation Request Management:** View, approve, or reject pending vacation requests from users, with optional comments. Batch approval option.
    *   **User Vacation Summary:** View an overview of approved/pending vacation days for all users.
    *   *(Placeholder for Vacation Peak Concurrency Chart in `components/AdminOverviewDashboard.tsx`)*
*   **User Profile Page:** Placeholder for future user-specific settings (e.g., name, email, password change).
*   **Internationalization (i18n):**
    *   Supports English (en), French (fr), German (de), and Portuguese (pt).
    *   Language switcher available in the header.
*   **Responsive Design:** Adapts to various screen sizes.
*   **Notification System:** Provides feedback for user actions (success, error, info, warning).
*   **Error Handling:** Includes a global error boundary for better user experience on unexpected errors.

## Tech Stack

*   **Frontend:**
    *   React 19 (using `esm.sh` for CDN-like imports in `index.html`)
    *   TypeScript
    *   Tailwind CSS (via CDN)
    *   Vite (for development and build, as per `package.json`)
*   **Backend & Database:**
    *   Supabase (Authentication, PostgreSQL Database)
*   **Internationalization:**
    *   i18next
    *   react-i18next
    *   i18next-browser-languagedetector
*   **Linting & Formatting:**
    *   ESLint
    *   Prettier (implicitly, good practice)
*   **Testing (Goal, as discussed):**
    *   Vitest/Jest for unit and integration tests.
    *   React Testing Library for component testing.
    *   Cypress/Playwright for End-to-End (E2E) tests.

## Project Structure

```
/
├── public/                     # Static assets (favicon, etc.)
├── src/
│   ├── App.tsx                 # Main application component, routing logic
│   ├── AdminDashboardPage.tsx  # Main page for admin functionalities
│   ├── index.tsx               # React entry point
│   ├── i18n.ts                 # i18next configuration and translations
│   ├── types.ts                # TypeScript type definitions
│   ├── constants.ts            # Application-wide constants
│   ├── components/             # Reusable UI components
│   │   ├── AdminOverviewDashboard.tsx # Basic overview/chart placeholder for admin
│   │   ├── AppHeader.tsx
│   │   ├── AccessDeniedMessage.tsx
│   │   ├── CompactContractHoursInput.tsx
│   │   ├── ContractAndMonthlySummaryCard.tsx
│   │   ├── DailyLog.tsx
│   │   ├── DailyLogRow.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── HolidayManagementPage.tsx
│   │   ├── InputWithIcon.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MainAppLayout.tsx
│   │   ├── MonthYearSelector.tsx
│   │   ├── NotificationDisplay.tsx
│   │   ├── SectionCard.tsx
│   │   ├── TimeInput.tsx
│   │   ├── TypeSelector.tsx
│   │   ├── UserProfilePage.tsx
│   │   ├── VacationConfigPage.tsx
│   │   ├── icons.tsx             # SVG Icon components
│   │   └── vacation_config/      # Components specific to vacation configuration
│   │       ├── CalendarGrid.tsx
│   │       ├── MonthlyVacationList.tsx
│   │       └── VacationSummaryPanel.tsx
│   ├── contexts/               # React Context API for state management
│   │   ├── AuthContext.tsx
│   │   ├── CurrentUserDataContext.tsx
│   │   ├── GlobalDataContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useCurrentUserData.ts
│   │   ├── useGlobalData.ts
│   │   └── useVacationCalculations.ts
│   ├── locales/                # Translation files
│   │   ├── en/translation.json
│   │   ├── fr/translation.json
│   │   ├── de/translation.json
│   │   └── pt/translation.json
│   ├── utils/                  # Utility functions
│   │   ├── localStorage.ts       (Partially used, mostly superseded by Supabase)
│   │   ├── printVacationRequest.ts
│   │   ├── stringUtils.ts
│   │   ├── supabaseClient.ts     # Supabase client initialization
│   │   ├── supabaseCrud.ts       # Supabase CRUD operations
│   │   └── timeUtils.ts
│   └── index.css               # Base Tailwind CSS styles
├── index.html                  # Main HTML file, loads React via import map
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript project configuration
├── tsconfig.node.json          # TypeScript Node-specific configuration
├── package.json                # Project dependencies and scripts
├── metadata.json               # Application metadata for the web container
├── SCHEMA.sql                  # SQL schema for Supabase tables
└── README.md                   # This file
```

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd your-project-directory
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Supabase Setup:**
    *   Create a new project on [Supabase](https://supabase.com/).
    *   Go to your Supabase project's "SQL Editor".
    *   Create a new query and paste the contents of `SCHEMA.sql` (provided in this repository) to set up the necessary tables and policies. Execute the query.
    *   In your Supabase project, navigate to "Project Settings" (gear icon) > "API".
    *   Find your "Project URL" and your "anon public" API Key.
    *   Open `src/utils/supabaseClient.ts` in your code editor.
    *   Replace the placeholder values for `supabaseUrl` and `supabaseAnonKey` with your actual Supabase URL and Anon Key:
        ```typescript
        const supabaseUrl = 'YOUR_SUPABASE_URL';
        const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
        ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will start the Vite development server, typically on `http://localhost:5173`.

5.  **Open in browser:**
    Navigate to the local URL provided by Vite in your web browser.

## Database Schema

The necessary Supabase database schema is defined in `SCHEMA.sql`. This file includes table definitions for:
*   `profiles`: Stores user-specific information linked to Supabase Auth users.
*   `global_settings`: Stores application-wide settings.
*   `global_holidays`: Stores global and custom holidays.
*   `user_weekly_contracts`: Stores weekly contractual hours for users.
*   `user_daily_logs`: Stores daily work log entries for users.
*   `user_vacations`: Stores vacation requests and their statuses for users.

Ensure you run this schema in your Supabase SQL Editor before running the application.

## Internationalization (i18n)

*   The application uses `i18next` and `react-i18next` for handling translations.
*   Translation files are located in `src/locales/{language_code}/translation.json`.
*   Currently supported languages: English (en), French (fr), German (de), and Portuguese (pt).
*   Language detection is configured to use `localStorage` first, then the browser's language settings.
*   The `LanguageSwitcher` component in the header allows users to manually change the language.

## State Management

The application employs React Context API for managing shared state:

*   **`AuthContext` (`hooks/useAuth.ts`):** Manages user authentication status, current user information, and logout functionality.
*   **`GlobalDataContext` (`hooks/useGlobalData.ts`):** Handles global application data such as `globalUserSettings`, `globalHolidays`, and `allUsers` (for admin). It also provides functions to save these global settings.
*   **`CurrentUserDataContext` (`hooks/useCurrentUserData.ts`):** Manages data specific to the currently logged-in user, including their `weeklyContract`, `dailyLogs`, `vacations`, and calculated `summaryData`.
*   **`NotificationContext` (`contexts/NotificationContext.tsx`):** Manages the display of application-wide notifications.

These contexts provide a clean way to access and modify shared state across different components.

## Supabase Integration

*   **Client Initialization:** The Supabase client is initialized in `src/utils/supabaseClient.ts`.
*   **CRUD Operations:** All database interactions (Create, Read, Update, Delete) are centralized in `src/utils/supabaseCrud.ts`. This file contains functions for fetching and saving user data, settings, holidays, etc.
*   **Authentication:** Supabase Auth is used for user registration and login. User profile information (like name and role) is stored in a separate `profiles` table linked to the `auth.users` table.
*   **Realtime (Optional):** While not explicitly implemented for all features, Supabase's real-time capabilities could be leveraged in the future for features like live updates to pending requests for admins.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode with Vite.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the project files using ESLint.
*   `npm run preview`: Serves the production build locally.

---

This README provides a good starting point. You can expand it further as the project evolves!
