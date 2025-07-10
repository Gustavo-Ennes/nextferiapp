import { styled } from "@mui/material";

export const Overlay = styled("div")(({ theme }) => ({
  height: "85vh",
  backgroundColor: theme.palette.background.default,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1300, // acima de Drawer, abaixo de Modal (1400)
}));
