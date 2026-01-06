"use client";

import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { TabData } from "../../../../lib/repository/weeklyFuellingSummary/types";
import {
  PdfFloatingButtonBox,
  PdfPreviewBox,
} from "@/app/(secure)/components/styled";

export const PdfPreviewPanel = ({ data = [] }: { data: TabData[] }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const getBody = () => ({
    type: "materialRequisition",
    data,
  });
  const fetchPdf = () =>
    fetch("/api/pdf", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getBody()),
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setUrl(url);
      });

  useEffect(() => {
    fetchPdf();
  }, []);

  useEffect(() => {
    fetchPdf();
  }, [data]);

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
              <iframe
                src={url}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            )}
          </Box>
        )}
      </PdfPreviewBox>
    </>
  );
};
