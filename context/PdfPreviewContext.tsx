"use client";

import { PdfPreview } from "@/app/(secure)/components/PdfPreview";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type {
  PdfPreviewType,
  PdfPreviewItem,
  SetPdfCallbackParam,
} from "./types";
import { useSnackbar } from "./SnackbarContext";
import {
  getLocalStorageData,
  setLocalStorageData,
} from "@/app/(secure)/materialRequisition/utils";

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
  const [open, setOpen] = useState(true);
  const [openingsCounter, setOpeningsCounter] = useState(0);
  const { addSnack } = useSnackbar();

  const setPdf = useCallback(
    async ({ items, add, open = true }: SetPdfCallbackParam) => {
      try {
        const localData = await getLocalStorageData();
        setLocalStorageData({
          ...localData,
          pdfData: add ? [...localData.pdfData, ...items] : items,
        });
        setOpen(open);
        addSnack({
          message: "Carregando pdf..",
        });
      } catch (err) {
        console.error(err);
        addSnack({
          message: "Houveram problemas lendo dados de pdfs salvos",
          severity: "error",
        });
      }
    },
    []
  );

  useEffect(() => {
    const setData = async () => {
      const data = await getLocalStorageData();
      setItems(data.pdfData);
      setOpeningsCounter(0);
    };

    addEventListener("feriapp", async () => {
      setData();
    });
    dispatchEvent(new Event("feriapp"));

    return () => removeEventListener("feriapp", () => undefined);
  }, []);

  useEffect(() => {
    if (open) setOpeningsCounter(openingsCounter + 1);
  }, [open]);

  const shouldOpenAfterLoad = open && openingsCounter === 0;

  return (
    <PfdPreviewContext.Provider value={{ setPdf }}>
      {children}
      {items.length && (
        <PdfPreview items={items} openAfterLoad={shouldOpenAfterLoad} />
      )}
    </PfdPreviewContext.Provider>
  );
};
