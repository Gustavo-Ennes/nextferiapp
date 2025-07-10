"use client";

import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { responsiveTheme } from "@/theme/theme";
import { SessionProvider } from "next-auth/react";

export default function Page() {
  return (
    <ThemeProvider theme={responsiveTheme}>
      <SessionProvider>
        <CssBaseline />
        <ModalProvider>
          <section>
            <h1>Home</h1>
            <div>home</div>
          </section>
        </ModalProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
