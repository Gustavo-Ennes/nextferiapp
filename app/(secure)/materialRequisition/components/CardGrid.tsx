import {
  Grid,
  IconButton,
  CardContent,
  Typography,
  Divider,
  Tooltip,
  Chip,
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
import { capitalizeName } from "@/app/utils";

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
              <Grid container>
                <Grid container size={10}>
                  <Grid size={8}>
                    <Typography variant="body2">
                      <Chip
                        icon={<DirectionsCar sx={{ mr: 1, fontSize: 18 }} />}
                        label={capitalizeName(car.vehicle)}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ p: 1 }}
                      />
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Chip
                      icon={<LocalGasStation sx={{ mr: 1, fontSize: 18 }} />}
                      label={capitalizeName(car.fuel)}
                      variant="outlined"
                      color="secondary"
                      size="small"
                      sx={{ p: 1 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Chip
                      icon={<Tag sx={{ mr: 1, fontSize: 18 }} />}
                      label={car.prefix}
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ p: 1 }}
                    />
                  </Grid>
                </Grid>
                <Grid size={2}>
                  <IconButton
                    size="small"
                    onClick={() => onRemove(car.prefix)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <Close />
                  </IconButton>
                </Grid>
                <Grid size={12}>
                  <CardContent>
                    <Divider sx={{ mb: 1 }} />

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
                </Grid>
              </Grid>
            </GridCard>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
};
