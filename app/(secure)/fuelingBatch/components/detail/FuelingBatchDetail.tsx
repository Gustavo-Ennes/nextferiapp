// FuelingBatchDetail.tsx
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
import EditIcon from "@mui/icons-material/EditOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdfOutlined";

import { format } from "date-fns";
import { capitalizeFirstLetter } from "@/app/utils";
import { toMonetary } from "../../utils";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import type { FuelingBatchDTO } from "@/dto";
import { FuelingBatchDetailInvoices } from "./FuelingBatchDetailInvoice";
import { FuelingBatchDetailDepartments } from "./FuelingBatchDetailDepatment";
import { useRouter } from "@/context/RouterContext";

export function FuelingBatchDetail({
  fuelingBatch,
}: {
  fuelingBatch: FuelingBatchDTO;
}) {
  const {
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
  } = fuelingBatch;
  const { setPdf } = usePdfPreview();
  const invoices = departments.flatMap((department) => department.invoices);
  const { redirectWithLoading } = useRouter(); //ver porque botão de pdf não gera as requisições

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* ── HERO ── */}
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          mb: 3,
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
          color: "#fff",
          minWidth: 0,
        }}
      >
        <Typography
          variant="overline"
          sx={{ opacity: 0.75, letterSpacing: 0.5 }}
        >
          Lote de abastecimentos
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          spacing={1}
          sx={{ mt: 0.5 }}
        >
          <Typography variant="h4" fontWeight={700}>
            {toMonetary(totalValue)}
          </Typography>

          <Stack spacing={0.25} sx={{ textAlign: { sm: "right" } }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Criado em {format(createdAt, "dd/MM/yyyy")}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Atualizado em {format(updatedAt || createdAt, "dd/MM/yyyy")}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* ── TOTAIS + NOTAS FISCAIS ── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2.5, height: "100%", borderColor: "#E2E8F0" }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="#1E3A8A"
              sx={{ mb: 1.5 }}
            >
              Totais
            </Typography>

            <Stack spacing={1.25}>
              <StatRow label="Km's rodados" value={totalKmHrs.toFixed(2)} />
              <StatRow
                label="Abastecimentos"
                value={totalFuelings.toFixed(2)}
              />
              <StatRow
                label="Veículos abastecidos"
                value={totalVehicles.toFixed(2)}
              />
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={0.75}>
              {Object.keys(totalFuels).map((key) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    minWidth: 0,
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 0, overflowWrap: "anywhere" }}
                  >
                    {capitalizeFirstLetter(key)}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="#2563EB"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {toMonetary(totalFuels[key].value)} (
                    {totalFuels[key].liters.toFixed(3)} L)
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
          <FuelingBatchDetailInvoices invoices={invoices} />
        </Grid>
      </Grid>

      {/* ── DEPARTAMENTOS ── */}
      <FuelingBatchDetailDepartments departments={departments} />

      {/* ── AÇÕES ── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ mt: 3 }}
      >
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => redirectWithLoading(`/fuelingBatch/form?id=${_id}`)}
          sx={{
            borderColor: "#2563EB",
            color: "#2563EB",
            "&:hover": { borderColor: "#1E3A8A", bgcolor: "#EFF6FF" },
          }}
        >
          Editar
        </Button>

        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={() =>
            setPdf({
              items: [{ type: "fuelingBatch", data: fuelingBatch }],
              open: true,
            })
          }
          sx={{
            bgcolor: "#2563EB",
            "&:hover": { bgcolor: "#1E3A8A" },
          }}
        >
          Ver PDF
        </Button>
      </Stack>
    </Container>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
