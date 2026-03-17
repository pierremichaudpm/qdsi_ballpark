import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BallparkEstimator from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BallparkEstimator />
  </StrictMode>
);
