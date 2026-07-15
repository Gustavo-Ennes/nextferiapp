import { Card, styled } from "@mui/material";
import type { WeeklyFuellingSummaryVehicle } from "@/dto";

export const GridCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selectedCar",
})<{
  selectedCar?: WeeklyFuellingSummaryVehicle;
  car: WeeklyFuellingSummaryVehicle;
}>(({ selectedCar, car }) => ({
  position: "relative",
  backgroundColor:
    selectedCar?.prefix === car.prefix ? "#ececec" : "background.paper",
  maxHeight: "150px",
  scrollBehavior: "smooth",
  overflow: "scroll",
  padding: 10,
}));
