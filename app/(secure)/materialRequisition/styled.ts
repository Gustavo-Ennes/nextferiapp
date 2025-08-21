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
