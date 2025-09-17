import {
  Grid,
  IconButton,
  CardContent,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Tag,
  DirectionsCar,
  LocalGasStation,
  CalendarMonth,
  Speed,
} from "@mui/icons-material";
import type { CarEntry, TabData } from "../types";
import { Close } from "@mui/icons-material";
import { format } from "date-fns";
import { GridCard } from "../styled";
import { sortCarFuelings } from "../utils";

export const CardsGrid = ({
  tabData,
  onRemove,
  onEdit,
  selectedCar,
}: {
  tabData: TabData;
  onRemove: (car: number) => void;
  onEdit: (car: CarEntry) => void;
  selectedCar?: CarEntry;
}) => {
  const sortedCarEntries = tabData.carEntries?.sort(
    (a, b) => a.prefix - b.prefix
  );

  return (
    <Grid container spacing={2}>
      {sortedCarEntries?.map((car, idx) => (
        <Grid size={{ sm: 12, md: 6 }} key={idx} onClick={() => onEdit(car)}>
          <Tooltip
            title={`Clique para editar o #${car.prefix}`}
            sx={{ cursor: "pointer" }}
          >
            <GridCard car={car} selectedCar={selectedCar}>
              <IconButton
                size="small"
                onClick={() => onRemove(car.prefix)}
                sx={{ position: "absolute", top: 8, right: 8 }}
              >
                <Close />
              </IconButton>

              <CardContent>
                <Typography variant="body2">
                  <DirectionsCar sx={{ mr: 1, fontSize: 18 }} />
                  {car.vehicle}
                </Typography>

                <Typography variant="body2">
                  <Tag sx={{ mr: 1, fontSize: 18 }} /> {car.prefix}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {sortCarFuelings(car.fuelings).map((fueling, i) => (
                  <Grid container key={`fueling-${i}`}>
                    <Grid size={4} m="auto">
                      <Typography gutterBottom fontSize={11}>
                        #{i} <CalendarMonth sx={{ mr: 1, fontSize: 11 }} />
                        {format(fueling.date, "dd/MM/yy")}{" "}
                      </Typography>
                    </Grid>

                    <Grid size={4} m="auto">
                      <Typography gutterBottom fontSize={11}>
                        <LocalGasStation sx={{ ml: 1, fontSize: 11 }} />{" "}
                        {fueling.quantity.toFixed(3)}
                      </Typography>
                    </Grid>

                    <Grid size={4} m="auto">
                      {fueling.kmHr && (
                        <Typography gutterBottom fontSize={11}>
                          <Speed sx={{ ml: 1, fontSize: 11 }} />{" "}
                          {fueling.kmHr.toFixed(0)}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </CardContent>
            </GridCard>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
};
