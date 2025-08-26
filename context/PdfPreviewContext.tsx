"use client";

import { PdfPreview } from "@/app/(secure)/components/PdfPreview";
import { createContext, useContext, useState, useCallback } from "react";
import { PdfPreviewType, PdfPreviewItem } from "./types";
import { useSnackbar } from "./SnackbarContext";

const PfdPreviewContext = createContext<PdfPreviewType | null>(null);

export const usePdfPreview = () => {
  const ctx = useContext(PfdPreviewContext);
  if (!ctx)
    throw new Error("usePdfPreview must be used inside PdfPreviewProvider");
  return ctx;
};

export const PdfPreviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [items, setItems] = useState<PdfPreviewItem[]>([]);
  const { addSnack } = useSnackbar();

  const setPdf = useCallback((items: PdfPreviewItem[]) => {
    setItems(items);
    if (items) addSnack({ message: "Seu pdf está sendo processado." });
  }, []);

  return (
    <PfdPreviewContext.Provider value={{ setPdf }}>
      {children}
      {items?.length && <PdfPreview items={items} />}
    </PfdPreviewContext.Provider>
  );
};
