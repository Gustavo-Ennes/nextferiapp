"use client";

import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { responsiveTheme } from "@/theme/theme";
import { SessionProvider } from "next-auth/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PdfPreviewProvider } from "@/context/PdfPreviewContext";
import { SnackbarProvider } from "@/context/SnackbarContext";
import { LoadingProvider } from "@/context/LoadingContext";
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeProvider theme={responsiveTheme}>
            <CssBaseline />
            <SessionProvider>
              <LoadingProvider>
                <SnackbarProvider>
                  <PdfPreviewProvider>
                    <ModalProvider>{children}</ModalProvider>
                  </PdfPreviewProvider>
                </SnackbarProvider>
              </LoadingProvider>
            </SessionProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
