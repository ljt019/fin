# Tauri React Template

A robust and feature-rich template for building desktop applications with Tauri V2, React, Vite, TypeScript, Tailwind CSS V4, TanStack Query, TanStack Router, and ShadCN.

[![Tauri V2](https://img.shields.io/badge/tauri%20v2-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF)](https://tauri.app/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TanStack Query](https://img.shields.io/badge/-TanStack%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)](https://tanstack.com/query/latest/)
[![TailwindCSS V4](https://img.shields.io/badge/tailwindcss%20v4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ShadCN](https://img.shields.io/badge/shadcn-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Customization](#customization)

## Features

- Tauri V2 Integration: Build secure and lightweight desktop applications with the latest Tauri version.
- React 18: Modern and efficient UI library.
- Vite: Fast and optimized development build tool.
- TypeScript: Strongly typed JavaScript for better developer experience.
- Tailwind CSS V4: The latest version of the utility-first CSS framework for rapid UI development.
- TanStack Query: Data fetching and state management.
- TanStack Router: Type-safe routing with first-class search param support.
- ShadCN UI: Accessible and customizable UI components.
- Icons: Rich icon library with Radix UI and Lucide React.
- State Management: Simple and scalable state management with React hooks.
- Build Scripts: Streamlined scripts for development and production builds.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js: Install Node.js (v16 or higher).
- Rust: Install Rust (required for Tauri).
- Tauri CLI: Install Tauri CLI globally:
  ```bash
  npm install -g @tauri-apps/cli
  ```

## Installation

1. Clone the Repository

   ```bash
   git clone https://github.com/your-username/tauri_template.git
   cd tauri_template
   ```

2. Install Dependencies

   ```bash
   npm install
   ```

3. Initialize Tauri

   If this is not already set up, initialize Tauri in your project:

   ```bash
   tauri init
   ```

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the application in development mode using Vite.
- `npm run build`: Compiles the TypeScript code and builds the application for production.
- `npm run preview`: Locally preview the production build.
- `npm run tauri`: Runs Tauri commands. You can pass additional arguments as needed.
- `npm run tauri:dev`: Runs the application in development mode with Tauri.
- `npm run tauri:build`: Builds the application for production with Tauri.

## Project Structure

```
tauri_template/
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # Reusable UI components
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   └── ui/         # ShadCN UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── separator.tsx
│   │       └── tabs.tsx
│   ├── constants/      # Application constants
│   │   └── query.ts    # TanStack Query configuration
│   ├── lib/            # Utility functions
│   │   └── utils.ts    # Common utility functions
│   ├── screens/        # Application screens/pages
│   │   ├── about.tsx   # About page with counter example
│   │   ├── index.tsx   # Home page
│   │   └── root.tsx    # Root layout and route configuration
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite type declarations
├── src-tauri/          # Tauri backend (Rust)
│   ├── src/            # Rust source code
│   │   ├── lib.rs      # Tauri command handlers
│   │   └── main.rs     # Rust entry point
│   ├── Cargo.toml      # Rust dependencies
│   └── tauri.conf.json # Tauri configuration
├── public/             # Public static files
├── index.html          # HTML entry point
├── package.json        # NPM dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── components.json     # ShadCN components configuration
```

## Customization

### Adding New Routes with TanStack Router

1. Create a New Screen

   ```tsx
   // src/screens/NewPage.tsx
   import { createRoute } from "@tanstack/react-router";
   import { rootRoute } from "@/screens/root";

   export const newPageRoute = createRoute({
     getParentRoute: () => rootRoute,
     path: "/new-page",
     component: NewPage,
   });

   function NewPage() {
     return <div className="p-4">New Page Content</div>;
   }
   ```

2. Update Root Route Configuration

   ```tsx
   // src/screens/root.tsx
   import { Outlet, createRootRoute } from "@tanstack/react-router";
   import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
   import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

   import { indexRoute } from "@/screens/index";
   import { aboutRoute } from "@/screens/about";
   import { newPageRoute } from "@/screens/NewPage"; // Import your new route

   export const rootRoute = createRootRoute({
     component: () => (
       <>
         <Outlet />
         <ReactQueryDevtools />
         <TanStackRouterDevtools />
       </>
     ),
   });

   // Add your new route to the route tree
   export const routeTree = rootRoute.addChildren([
     indexRoute, 
     aboutRoute,
     newPageRoute // Add the new route here
   ]);
   ```

3. The routing is automatically set up in main.tsx:

   ```tsx
   // src/main.tsx (already configured)
   import { RouterProvider, createRouter } from "@tanstack/react-router";
   import { routeTree } from "@/screens/root";

   const router = createRouter({ routeTree });

   // Register the router for maximum type safety
   declare module "@tanstack/react-router" {
     interface Register {
       router: typeof router;
     }
   }
   
   // ... rest of main.tsx
   ```

### Styling with Tailwind CSS V4

This template uses Tailwind CSS V4 with the Vite plugin. The configuration is managed through the `@tailwindcss/vite` plugin in `vite.config.ts`:

```typescript
// vite.config.ts (excerpt)
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(),
    // ... other plugins
  ],
  // ... rest of config
}));
```

The theme also includes a dark/light mode theme provider (`/src/components/theme-provider.tsx`) that is configured in `main.tsx`:

```tsx
// main.tsx (excerpt)
<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
  <RouterProvider router={router} />
</ThemeProvider>
```

You can use the `useTheme` hook to access and modify the current theme in your components:

```tsx
import { useTheme } from "@/components/theme-provider";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  );
}
```

### Using TanStack Query

This template comes with TanStack Query already set up for data fetching. The QueryClient is configured in a dedicated constants file to maintain separation of concerns:

```tsx
// src/constants/query.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
  exampleKey: ["example-key"] as const,
  exampleKey2: () => [...queryKeys.exampleKey, "example-key-2"],
};
```

And it's provided to the app in `main.tsx`:

```tsx
// src/main.tsx (excerpt)
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/constants/query";

// ...

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* rest of application */}
    </QueryClientProvider>
  </StrictMode>
);
```

The application also includes the TanStack Query DevTools in development mode, which are rendered in the root component:

```tsx
// src/screens/root.tsx (excerpt)
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools />
      {/* ...other components */}
    </>
  ),
});
```

#### Example Query Usage

```tsx
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query";

// Example API call using Tauri API
import { invoke } from "@tauri-apps/api";

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.exampleKey,
    queryFn: async () => {
      return await invoke("greet", { name: "User" });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return <div>{data}</div>;
}
```

### Tauri Integration

This template includes Tauri V2. The Rust backend is configured to handle commands from the frontend:

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

To call Rust functions from your React components:

```tsx
import { invoke } from "@tauri-apps/api";

async function callRustFunction() {
  // Call the "greet" command defined in Rust
  const response = await invoke("greet", { name: "World" });
  console.log(response); // "Hello, World! You've been greeted from Rust!"
}
```
