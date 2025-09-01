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
import { equals } from "ramda";

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
  const [opened, setOpened] = useState(false);
  const [open, setOpen] = useState(false);
  const [shouldOpenAfterLoad, setShouldOpenAfterLoad] = useState(true);
  const { addSnack } = useSnackbar();

  const setPdf = useCallback(
    async ({ items: newItems, add, open = true }: SetPdfCallbackParam) => {
      try {
        const localData = await getLocalStorageData();
        setShouldOpenAfterLoad(open);
        setLocalStorageData({
          data: {
            ...localData,
            pdfData: {
              items: add ? [...localData.pdfData.items, ...newItems] : newItems,
              opened: false,
            },
          },
          dispatch: true,
        });
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
      if (!equals(data?.pdfData.items, items)) setItems(data.pdfData.items);

      setOpened(data?.pdfData?.opened);
    };

    addEventListener("pfdDataUpdate", setData);
    dispatchEvent(new Event("pfdDataUpdate"));

    return () => removeEventListener("pfdDataUpdate", () => undefined);
  }, []);

  useEffect(() => {
    if (open && !opened) {
      getLocalStorageData().then((data) => {
        setOpened(true);
        setLocalStorageData({
          data: { ...data, pdfData: { ...data.pdfData, opened: true } },
        });
      });
    }
  }, [open]);

  const shouldShowPdfPreview = items.length;

  return (
    <PfdPreviewContext.Provider value={{ setPdf }}>
      {children}
      {shouldShowPdfPreview && (
        <PdfPreview
          items={items}
          open={open}
          setOpen={setOpen}
          opened={opened}
          openAfterLoad={shouldOpenAfterLoad}
        />
      )}
    </PfdPreviewContext.Provider>
  );
};
