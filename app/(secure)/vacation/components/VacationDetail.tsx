"use client";

import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Divider,
  Stack,
  Button,
} from "@mui/material";

import { format } from "date-fns";
import { capitalizeName } from "@/app/utils";
import { getTypeLabel } from "../utils";
import { TitleTypography } from "../../components/TitleTypography";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import type { VacationDTO, WorkerDTO } from "@/dto";
import { CancelListButton } from "./CancelListButton";

export function VacationDetail({ vacation }: { vacation: VacationDTO }) {
  const { setPdf } = usePdfPreview();

  const workerName = capitalizeName((vacation?.worker as WorkerDTO)?.name);
  const vacationType = `${vacation.period === "half" ? "½ " : ""}${getTypeLabel(
    vacation.type,
  )}`;
  const period = `${format(new Date(vacation.startDate), "dd/MM/yyyy")} `;
  period.concat(
    vacation.period === "full"
      ? ` até ${format(new Date(vacation.endDate), "dd/MM/yyyy")}`
      : "Meio-período",
  );

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <TitleTypography>Visualização da Folga</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Funcionário</Typography>
            <Typography>{workerName}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Tipo</Typography>
            <Typography>{vacationType}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Período</Typography>
            <Typography>{period}</Typography>
          </Box>

          {vacation.cancelled !== undefined && (
            <Box>
              <Typography variant="subtitle2">Status</Typography>
              <Typography>
                {vacation.cancelled ? "Cancelada" : "Deferida"}
              </Typography>
            </Box>
          )}

          {vacation.observation && (
            <Box>
              <Typography variant="subtitle2">Observação</Typography>
              <Typography>{vacation.observation}</Typography>
            </Box>
          )}
        </Stack>
      </Paper>
      <Grid
        container
        spacing={2}
        my={3}
        alignContent="center"
        justifyContent="space-between"
      >
        <CancelListButton vacation={vacation} />

        <Button
          variant="contained"
          onClick={() =>
            setPdf({
              items: [{ type: "vacation", id: vacation._id as string }],
            })
          }
        >
          Ver pdf
        </Button>
      </Grid>
    </Container>
  );
}
