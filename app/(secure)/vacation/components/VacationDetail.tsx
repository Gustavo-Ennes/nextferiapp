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

import { Vacation } from "@/app/types";
import { format } from "date-fns";
import { useModal } from "@/context/ModalContext";
import { ButtonMenu } from "../../components/ButtonMenu";
import { MenuItem } from "../../components/types";
import { capitalizeName } from "@/app/utils";
import { getTypeLabel } from "../utils";
import { useRouter } from "next/navigation";
import { TitleTypography } from "../../components/TitleTypography";

export function VacationDetail({ vacation }: { vacation: Vacation }) {
  const { open } = useModal();
  const router = useRouter();

  const cancelMenuItems: MenuItem[] = [
    {
      label: "Cancelar",
      action: () =>
        open({
          title: "Cancelar folga",
          description: "Deseja cancelar essa folga?",
          input: true,
          onConfirm: async (obs) => {
            console.log("Observação:", obs);
          },
        }),
    },
    {
      label: "Cancelar com requisição",
      action: () =>
        open({
          title: "Cancelar e imprimir requisição de cancelamento",
          description: "Deseja cancelar e imprimir a requisição para o RH?",
          input: true,
          onConfirm: async (obs) => {
            console.log("Observação para impressão:", obs);
          },
        }),
    },
    {
      label: "Remarcar",
      action: () =>
        open({
          title: "Remarcar",
          description:
            "Deseja cancelar(sem requerimento RH) e remarcar essa folga?",
          input: true,
          onConfirm: async (obs) => {
            console.log("Observação para remarcação:", obs);
          },
        }),
    },
    {
      label: "Remarcar com requisição",
      action: () =>
        open({
          title: "Remarcar com requisição",
          description:
            "Deseja cancelar com requirimento para o RH e remarcar essa folga?",
          input: true,
          onConfirm: async (obs) => {
            console.log("Observação para remarcação:", obs);
          },
        }),
    },
  ];
  const workerName = capitalizeName(vacation?.worker?.name);
  const vacationType = `${vacation.period === "half" ? "½ " : ""}${getTypeLabel(
    vacation.type
  )}`;
  const period = `${format(new Date(vacation.startDate), "dd/MM/yyyy")} `;
  period.concat(
    vacation.period === "full"
      ? ` até ${format(new Date(vacation.endDate), "dd/MM/yyyy")}`
      : "Meio-período"
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

          {vacation.deferred && (
            <Box>
              <Typography variant="subtitle2">Status</Typography>
              <Typography>Indeferida / Remarcada</Typography>
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
        <ButtonMenu items={cancelMenuItems} />
        <Button
          variant="contained"
          onClick={() => router.push(`/pdf?type=vacation&id=${vacation._id}`)}
        >
          Ver pdf
        </Button>
      </Grid>
    </Container>
  );
}
