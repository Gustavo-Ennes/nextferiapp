import { Box, styled, TableRow } from "@mui/material";

export const Overlay = styled("div")(({ theme }) => ({
  height: "85vh",
  backgroundColor: theme.palette.background.default,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1300, // acima de Drawer, abaixo de Modal (1400)
}));

export const StyledRow = styled(TableRow)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const PdfFloatingButtonBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ open }) => ({
  position: "fixed",
  top: "50%",
  right: open ? `calc(100% - 260px)` : 5,
  zIndex: 1300,
  transform: "translateY(-50%)",
}));

export const PdfPreviewBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ open }) => ({
  position: "fixed",
  top: 0,
  height: "100vh",
  right: 0,
  zIndex: 1200,
  width: open ? `calc(100% - 240px)` : 0,
  oveflow: "hidden",
  boxShadow: "3",
  transition: "width 0.3s ease",
}));
