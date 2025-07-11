import { styled, TableRow } from "@mui/material";

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
