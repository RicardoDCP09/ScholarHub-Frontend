import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            // Default options for all toasts
            duration: 4000,
            style: {
              padding: '8px 12px',
              borderRadius: 8,
            },
          }}
        />
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
);
