"use client";

import { Button, Tooltip } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { usePdfPreview } from "@/context/PdfPreviewContext";

export const PurchaseOrderAdditionalButton = () => {
  const { setPdf } = usePdfPreview();
  return (
    <Tooltip title="Imprimir orientação para emissão de notas">
       <Button
      variant="contained"
      sx={{ float: "right", mt: "3px" }}
      onClick={() => setPdf({ items: [{ type: "purchaseOrder" }] })}
    >
      <PictureAsPdf />
    </Button>
    </Tooltip>
   
  );
};
