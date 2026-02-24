# PharmaFlow Frontend

This directory contains the React-based frontend for the PharmaFlow Intelligence Platform. It handles data presentation, user interactions, chat workflows, and dashboard visualizations.

## Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: React Router DOM
- **Data Fetching**: Axios & React Query
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: Lucide React
- **Charts**: Recharts

## Directory Structure

```text
src/
├── components/   # Reusable UI components categorized by feature (agents, chat, layout, etc.)
├── pages/        # Top-level route components (HomePage, MoleculesPage, ReportsPage, etc.)
├── services/     # API integration logic communicating with the backend (e.g., moleculeService, chatService)
├── styles/       # Global CSS styles (index.css)
└── utils/        # Helper functions and utilities (e.g., formatters, pdfGenerator)
```

## Available Scripts

In the project directory, you can run:

### `npm install`
Installs all required dependencies. Run this after cloning or after modifying `package.json`.

### `npm run dev`
Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) to view it in your browser. The page will reload when you make changes.

### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`
Runs ESLint to check for stylistic and programming errors in the codebase.
