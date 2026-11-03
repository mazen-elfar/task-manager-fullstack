# Task Manager Frontend

Modern Single Page Application built with React 18, Vite, TypeScript, and Tailwind CSS.

## Features

- **Component Architecture**: Modular design with reusable Button, Input, Modal, Badge, Card, Spinner, and Toast components.
- **Routing & Guards**: Protected routes (`<ProtectedRoute>`), public guest routes (`<PublicRoute>`), and 404 fallback.
- **Form Validation**: Type-safe forms with React Hook Form and Zod schemas.
- **Task Workspace**:
  - Live search by title & description
  - Status tabs (`All`, `Pending`, `Completed`)
  - Priority filter (`All`, `Low`, `Medium`, `High`)
  - Completion toggling with optimistic updates
  - Creation & editing modals
  - Confirmation modal for task deletion
  - Dynamic progress statistics & completion rate
- **Responsive Layout**: Collapsible mobile drawer + sticky desktop sidebar.

## Available Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run production build
npm run build

# Run unit and component tests
npm test

# Run type check
npm run lint

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```
