import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout-shell.css";
import "./styles/layout-landing.css";
import "./styles/layout-landing-illustrations.css";
import "./styles/layout-workspace.css";
import "./styles/layout-editor.css";
import "./styles/layout-delivery.css";
import "./styles/layout-auth.css";
import "./styles/layout-account.css";
import "./styles/layout-pricing.css";
import "./styles/layout-checkout.css";
import "./styles/layout-header-stitch.css";
import "./styles/layout-landing-stitch.css";
import "./styles/layout-landing-stitch-details.css";
import "./styles/tokens-v2.css";
import "./styles/layout-landing-v2.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
