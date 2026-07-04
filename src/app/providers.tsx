"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#f6c453" },
    background: { default: "#111318", paper: "#1a1d24" },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
