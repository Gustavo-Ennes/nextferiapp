"use client";

import { PdfPreview } from "@/app/(secure)/components/PdfPreview";
import { TabData } from "@/app/(secure)/materialRequisition/types";
import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { PdfPreviewType, PdfPreviewTypeProp, PdfPreviewProps } from "./types";

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
  const [data, setData] = useState<TabData[]>();
  const [type, setType] = useState<PdfPreviewTypeProp>();
  const [id, setId] = useState<string>();

  const setPdf = useCallback(({ data, type, _id }: PdfPreviewProps) => {
    setData(data);
    setType(type);
    setId(_id);
  }, []);

  return (
    <PfdPreviewContext.Provider value={{ setPdf }}>
      {children}
      {type && <PdfPreview data={data} type={type} id={id} />}
    </PfdPreviewContext.Provider>
  );
};
