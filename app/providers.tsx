"use client";

import { DialogProvider } from "@/context/DialogContext";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { responsiveTheme } from "@/theme/theme";
import { SessionProvider } from "next-auth/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PdfPreviewProvider } from "@/context/PdfPreviewContext";
import { SnackbarProvider } from "@/context/SnackbarContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { MaterialRequisitionFormProvider } from "@/context/MaterialRequisitionFormContext";
import { RouterProvider } from "@/context/RouterContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={responsiveTheme}>
        <CssBaseline />
        <SessionProvider>
          <LoadingProvider>
            <RouterProvider>
              <SnackbarProvider>
                <PdfPreviewProvider>
                  <DialogProvider>
                    <MaterialRequisitionFormProvider>
                      {children}
                    </MaterialRequisitionFormProvider>
                  </DialogProvider>
                </PdfPreviewProvider>
              </SnackbarProvider>
            </RouterProvider>
          </LoadingProvider>
        </SessionProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
