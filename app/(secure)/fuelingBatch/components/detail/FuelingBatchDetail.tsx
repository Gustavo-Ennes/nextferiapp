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
import { capitalizeFirstLetter } from "@/app/utils";
import { toMonetary } from "../../utils";
import { TitleTypography } from "../../../components/TitleTypography";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import type { FuelingBatchDTO } from "@/dto";
import { FuelingBatchDetailInvoices } from "./FuelingBatchDetailInvoice";
import { FuelingBatchDetailDepartments } from "./FuelingBatchDetailDepatment";
import { useRouter } from "@/context/RouterContext";

export function FuelingBatchDetail({
  fuelingBatch: {
    _id,
    createdAt,
    updatedAt,
    departments,
    totals: {
      totalValue,
      totalKmHrs,
      totalFuelings,
      totalVehicles,
      totalFuels,
    },
  },
}: {
  fuelingBatch: FuelingBatchDTO;
}) {
  const { setPdf } = usePdfPreview();
  const invoices = departments.flatMap((department) => department.invoices);
  const { redirectWithLoading } = useRouter();

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <TitleTypography>Visualização da lote de abastecimentos</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">Criação</Typography>
                <Typography>{format(createdAt, "dd/MM/yyyy")}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2">Última atualização</Typography>
                <Typography>
                  {format(updatedAt || createdAt, "dd/MM/yyyy")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">Totais</Typography>
                <Typography>Valor total: {toMonetary(totalValue)}</Typography>
                <Typography>Km's rodados: {totalKmHrs.toFixed(2)}</Typography>
                <Typography>
                  Abastecimentos: {totalFuelings.toFixed(2)}
                </Typography>
                <Typography>
                  Veículos abastecidos: {totalVehicles.toFixed(2)}
                </Typography>
                {Object.keys(totalFuels).map((key) => (
                  <Typography key={key}>
                    {capitalizeFirstLetter(key)}:{" "}
                    {toMonetary(totalFuels[key].value)}(
                    {totalFuels[key].liters.toFixed(3)})
                  </Typography>
                ))}
              </Box>
            </Stack>
          </Grid>

          {/* invoices list */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FuelingBatchDetailInvoices invoices={invoices} />
          </Grid>

          {/* departments list */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <FuelingBatchDetailDepartments departments={departments} />
          </Grid>
        </Grid>
      </Paper>
      <Grid
        container
        spacing={2}
        my={3}
        alignContent="center"
        justifyContent="space-between"
      >
        <Button
          variant="contained"
          onClick={() => redirectWithLoading(`/fuelingBatch/form?id=${_id}`)}
        >
          Editar
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            setPdf({
              items: [{ type: "fuelingBatch", id: _id }],
            })
          }
        >
          Ver pdf
        </Button>
      </Grid>
    </Container>
  );
}
