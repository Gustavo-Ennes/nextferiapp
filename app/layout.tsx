"use client";

import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { responsiveTheme } from "@/theme/theme";
import { SessionProvider } from "next-auth/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PdfPreviewProvider } from "@/context/PdfPreviewContext";

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
            <SessionProvider>
              <PdfPreviewProvider>
                <CssBaseline />
                <ModalProvider>{children}</ModalProvider>
              </PdfPreviewProvider>
            </SessionProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
