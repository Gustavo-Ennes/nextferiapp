import { Card, styled, Box } from "@mui/material";
import { CarEntry } from "./types";

export const GridCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selectedCar",
})<{ selectedCar?: CarEntry; car: CarEntry }>(({ selectedCar, car }) => ({
  position: "relative",
  backgroundColor:
    selectedCar?.prefix === car.prefix ? "#ececec" : "background.paper",
  maxHeight: "150px",
  scrollBehavior: "smooth",
  overflow: "scroll",
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
