"use client";

import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { PdfFloatingButtonBox, PdfPreviewBox } from "./styled";
import { TabData } from "../materialRequisition/types";
import { PdfPreviewTypeProp } from "@/context/types";

export const PdfPreview = ({
  data,
  type,
  id,
}: {
  data?: TabData[];
  type?: PdfPreviewTypeProp;
  id?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const body = {
    type,
    data,
    _id: id,
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
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setUrl(url);
        if (type !== "materialRequisition") setOpen(true);
      });
  };

  useEffect(() => {
    fetchPdf();
    return () => setOpen(false);
  }, []);

  useEffect(() => {
    setOpen(false);
    if (type) fetchPdf();
  }, [data, type, id]);

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
                style={{ border: "none", margin: "10px" }}
              />
            )}
          </Box>
        )}
      </PdfPreviewBox>
    </>
  );
};
