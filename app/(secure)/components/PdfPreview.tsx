"use client";

import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PdfFloatingButtonBox, PdfPreviewBox } from "./styled";
import { useSnackbar } from "@/context/SnackbarContext";
import type { PdfPreviewItem } from "@/context/types";

export const PdfPreview = ({
  items,
  open,
  opened,
  openAfterLoad,
  setOpen,
}: {
  items: PdfPreviewItem[];
  open: boolean;
  opened: boolean;
  openAfterLoad: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { addSnack } = useSnackbar();
  const [url, setUrl] = useState("");

  const body = {
    items,
  };

  const fetchCallback = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);

    setUrl(url);
    addSnack({
      message: !opened
        ? "Seu pdf está pronto!"
        : "Clique no ícone flutuante para abrir seu pdf.",
    });
    if (!opened && openAfterLoad) {
      setOpen(true);
    }
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
  }, []);

  useEffect(() => {
    fetchPdf();
  }, [items]);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const iconButton = !url ? (
    <CircularProgress sx={{ color: "#fff" }} size={15} />
  ) : open ? (
    <ChevronRightIcon />
  ) : (
    <PictureAsPdfIcon />
  );

  const tooltipLabel = !url
    ? "Seu pdf está sendo gerado"
    : open
    ? "Clique para esconder seu pdf"
    : "Clique para exibir seu pdf";

  return (
    <>
      {/* Botão flutuante */}
      <PdfFloatingButtonBox open={open}>
        <Tooltip title={tooltipLabel}>
          <IconButton
            onClick={handleOpen}
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
            {url && (
              // less then 8: pdf toolbar goes behind appbar
              <Box pt={8} height="100%" overflow="scroll">
                <iframe
                  src={url}
                  content="application/pdf"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    zIndex: 1000,
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </PdfPreviewBox>
    </>
  );
};
