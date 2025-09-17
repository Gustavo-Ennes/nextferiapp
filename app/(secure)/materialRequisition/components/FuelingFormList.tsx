import { Grid, Box, Chip, Badge, Typography } from "@mui/material";
import type { FuelingData } from "../types";
import { Close, LocalGasStation } from "@mui/icons-material";
import { getLabel, sortCarFuelings } from "../utils";

export const FuelingFormList = ({
  fuelings,
  onRemove,
}: {
  fuelings: FuelingData[];
  onRemove: (id: number) => void;
}) => {
  return (
    <Box sx={{ overflow: "scroll", maxHeight: "100%" }}>
      {fuelings.length ? (
        <Grid container padding={1} justifyContent="center" alignItems="center">
          {sortCarFuelings(fuelings).map((fueling, idx) => (
            <Grid key={`fueling-${idx}`} size={4}>
              <Chip
                icon={
                  <Badge badgeContent={idx.toString()}>
                    <LocalGasStation sx={{ fontSize: 14, color: "primary" }} />
                  </Badge>
                }
                label={getLabel(fueling)}
                onDelete={() => onRemove(idx)}
                color="primary"
                sx={{ m: 0.5, fontSize: 9, width: 1 }}
                deleteIcon={<Close sx={{ fontSize: 12 }} />}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>
          Selecione um carro e veja os abastecimentos aqui.
        </Typography>
      )}
    </Box>
  );
};
