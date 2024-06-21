import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { setup } from "./dojo/setup";
import { DojoProvider } from "./hooks/context/DojoContext";
import { LoadingScreen } from "./ui/modules/LoadingScreen";
import { dojoConfig } from "../dojoConfig";
import { inject } from "@vercel/analytics";
import { Buffer } from "buffer";

window.Buffer = Buffer;

async function init() {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("React root not found");
  const root = ReactDOM.createRoot(rootElement as HTMLElement);

  root.render(<LoadingScreen />);

  const setupResult = await setup(dojoConfig);

  inject();
  root.render(
    <React.StrictMode>
      <DojoProvider value={setupResult}>
        <App />
      </DojoProvider>
    </React.StrictMode>,
  );
}

init();
