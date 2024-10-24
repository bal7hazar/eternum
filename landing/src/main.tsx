import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { dojoConfig } from "../dojoConfig";
import { setup } from "./dojo/setup";
import "./index.css";

// Import the generated route tree
import { StarknetProvider } from "./components/providers/Starknet";
import { ThemeProvider } from "./components/providers/theme-provider";
import { DojoProvider } from "./hooks/context/DojoContext";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  const setupResult = await setup(dojoConfig);

  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <StarknetProvider>
          <DojoProvider value={setupResult}>
            <RouterProvider router={router} />
          </DojoProvider>
        </StarknetProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}