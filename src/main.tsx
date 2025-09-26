import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes } from "react-router";
import './index.css'
import { Toaster } from "sonner";
import { StorageProvider } from './core/provider/storage_provider';
import { ThemeProvider } from './core/provider/theme_provider';
import { authRoutes } from './features/auth/auth_routes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { mainRoutes } from './features/main/main_routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StorageProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <Routes>
              {[
                ...mainRoutes,
                ...authRoutes,
              ]}
            </Routes>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </StorageProvider>
    <Toaster />
  </StrictMode>,
)
