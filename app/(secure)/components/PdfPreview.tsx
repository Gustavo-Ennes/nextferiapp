"use client";

import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { PdfFloatingButtonBox, PdfPreviewBox } from "./styled";
import { useSnackbar } from "@/context/SnackbarContext";
import { PdfPreviewItem } from "@/context/types";

export const PdfPreview = ({ items }: { items: PdfPreviewItem[] }) => {
  const { addSnack } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const body = {
    items,
  };

  const fetchCallback = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setUrl(url);
    if (items[0] && items[0].type !== "materialRequisition") setOpen(true);
    addSnack({ message: "Seu pdf está pronto!" });
  };

  const fetchPdf = () => {
    setUrl("");
    fetch("/api/pdf", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.blob())
      .then((blob) => fetchCallback(blob));
  };

  useEffect(() => {
    fetchPdf();
    return () => setOpen(false);
  }, []);

  useEffect(() => {
    setOpen(false);
    fetchPdf();
  }, [items]);

  const iconButton = !url ? (
    <CircularProgress sx={{ color: "#fff" }} size={15} />
  ) : open ? (
    <ChevronRightIcon />
  ) : (
    <PictureAsPdfIcon />
  );

  const tooltipLabel = url
    ? "Clique para exibir seu pdf"
    : "Seu pdf está sendo gerado";

  return (
    <>
      {/* Botão flutuante */}
      <PdfFloatingButtonBox open={open}>
        <Tooltip title={tooltipLabel}>
          <IconButton
            onClick={() => setOpen((prev) => !prev)}
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              ":hover": { bgcolor: "primary.dark" },
            }}
          >
            {iconButton}
          </IconButton>
        </Tooltip>
      </PdfFloatingButtonBox>

      {/* Painel lateral com iframe */}
      <PdfPreviewBox open={open}>
        {open && (
          <Box height="100%">
            <Box display="flex" justifyContent="flex-end" p={1}>
              <IconButton onClick={() => setOpen(false)}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
            {url && (
              <Box mt={1} height="100%" overflow="scroll">
                <iframe
                  src={url}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                />
              </Box>
            )}
          </Box>
        )}
      </PdfPreviewBox>
    </>
  );
};
