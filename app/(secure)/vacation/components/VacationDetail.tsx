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

import type { Vacation } from "@/app/types";
import { format } from "date-fns";
import { useModal } from "@/context/ModalContext";
import { ButtonMenu } from "../../components/ButtonMenu";
import type { MenuItem } from "../../components/types";
import { capitalizeName } from "@/app/utils";
import { getTypeLabel } from "../utils";
import { useRouter } from "next/navigation";
import { TitleTypography } from "../../components/TitleTypography";
import { usePdfPreview } from "@/context/PdfPreviewContext";

export function VacationDetail({ vacation }: { vacation: Vacation }) {
  const { open } = useModal();
  const { setPdf } = usePdfPreview();
  const router = useRouter();
  const url = `/api/vacation/${vacation._id}`;

  const submitFn = async ({
    option,
    withPdf,
    obs,
  }: {
    option: "cancel" | "reschedule";
    withPdf?: boolean;
    obs?: string;
  }) => {
    const body: Partial<Vacation> = { cancelled: true, observation: obs };

    await fetch(url, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const vacationsUrl = `/vacation${
      vacation.type !== "normal" ? `/${vacation.type}` : ""
    }`;
    const createVacationUrl = `/vacation/form?type=${vacation.type}&isReschedule={true}&id=${vacation._id}`;
    router.push(option === "reschedule" ? createVacationUrl : vacationsUrl);

    if (withPdf) {
      setPdf({
        items: [{ type: "cancellation", id: vacation._id }],
        open: false,
      });
    }
  };

  const cancelMenuItems: MenuItem[] = [
    {
      label: "Cancelar",
      action: () =>
        open({
          title: "Cancelar folga",
          description: "Deseja cancelar essa folga?",
          input: true,
          onConfirm: async (obs) => submitFn({ option: "cancel", obs }),
        }),
      disabled: false,
    },
    {
      label: "Cancelar com requisição",
      action: () =>
        open({
          title: "Cancelar e imprimir requisição de cancelamento",
          description: "Deseja cancelar e imprimir a requisição para o RH?",
          input: true,
          onConfirm: async (obs) =>
            submitFn({ option: "cancel", withPdf: true, obs }),
        }),
      disabled: false,
    },
    {
      label: "Remarcar",
      action: () =>
        open({
          title: "Remarcar",
          description:
            "Deseja cancelar(sem requerimento RH) e remarcar essa folga?",
          input: true,
          onConfirm: async (obs) => submitFn({ option: "reschedule", obs }),
        }),
      disabled: !vacation.worker.isActive || !vacation.worker,
    },
    {
      label: "Remarcar com requisição",
      action: () =>
        open({
          title: "Remarcar com requisição",
          description:
            "Deseja cancelar com requirimento para o RH e remarcar essa folga?",
          input: true,
          onConfirm: async (obs) =>
            submitFn({ option: "reschedule", withPdf: true, obs }),
        }),
      disabled: !vacation.worker.isActive || !vacation.worker,
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
              <Typography>Deferida</Typography>
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
        <ButtonMenu items={cancelMenuItems} vacation={vacation} />
        <Button
          variant="contained"
          onClick={() =>
            setPdf({
              items: [{ type: "vacation", id: vacation._id }],
            })
          }
        >
          Ver pdf
        </Button>
      </Grid>
    </Container>
  );
}
