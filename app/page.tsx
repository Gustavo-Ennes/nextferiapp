"use client";

import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { responsiveTheme } from "@/theme/theme";
import { SessionProvider } from "next-auth/react";
import LoginPage from "@/app/login/page";

export default function Page() {
  return (
    <ThemeProvider theme={responsiveTheme}>
      <SessionProvider>
        <CssBaseline />
        <ModalProvider>
            <LoginPage />
        </ModalProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
