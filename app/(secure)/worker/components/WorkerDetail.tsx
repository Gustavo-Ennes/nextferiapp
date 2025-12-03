"use client";

import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import type { Worker, Vacation } from "@/app/types";
import { useModal } from "@/context/ModalContext";
import { capitalizeFirstLetter, capitalizeName } from "@/app/utils";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { DataList } from "../../components/DataList";
import { parseToDataList } from "../../vacation/utils";
import { getWorkerDayOffsLeft } from "../../vacation/utils";
import { getWorkerStatusIcons } from "../utils";
import { formatMatriculation } from "@/lib/pdf/utils";
import { WorkerStatusIcons } from "./WorkerStatus";

export function WorkerDetail({
  worker,
  workerVacations,
}: {
  worker: Worker;
  workerVacations: Vacation[];
}) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { open } = useModal();

  const workerUnusedDayOffs = getWorkerDayOffsLeft(workerVacations);
  const dayOffText =
    workerUnusedDayOffs > 0
      ? `Servidor ainda possui ${workerUnusedDayOffs} abono${
          workerUnusedDayOffs > 1 ? "s" : ""
        }.`
      : `Servidor já tirou todas as suas abonadas esse ano.`;

  const workerIcons = getWorkerStatusIcons({
    worker,
    vacations: workerVacations,
  });

  const handleEdit = () =>
    router.push(`/worker/form?id=${worker._id as string}`);
  const handleDelete = () =>
    open({
      title: "Excluir servidor",
      description: `Deseja excluir o servidor ${capitalizeName(worker.name)}?`,
      onConfirm: async () => {
        setLoading(true);
        fetch(`/api/worker/${worker._id as string}`, { method: "delete" })
          .then(() => {
            setLoading(false);
            addSnack({
              message: "Você deletou um servidor",
              severity: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            addSnack({
              message: "Eita, houve um problema deletando um servidor.",
            });
          })
          .finally(() => router.push("/worker"));
      },
    });
  const handleChangeExternality = () => {
    const body = JSON.stringify({
      ...worker,
      department: worker.department._id as string,
      isExternal: !worker.isExternal,
      id: undefined,
    });
    open({
      title: "Modificar externalidade",
      description: `Deseja atualizar o servidor ${capitalizeName(
        worker.name
      )} como ${worker.isExternal ? "interno" : "externo"}?`,
      onConfirm: async () => {
        setLoading(true);
        fetch(`/api/worker/${worker._id as string}`, {
          method: "put",
          body,
        })
          .then(() => {
            setLoading(false);
            addSnack({
              message: "Você modificou a externalidade de um servidor.",
              severity: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            addSnack({
              message: "Eita, houve um problema modificando um servidor.",
            });
          })
          .finally(() => router.push("/worker"));
      },
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <TitleTypography>Visualização de servidor</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="h5" textAlign={"center"}>
              {capitalizeName(worker?.name)}
            </Typography>
            <Grid size={12} alignItems="center" justifyContent="center">
              <WorkerStatusIcons workerIcons={workerIcons} />
            </Grid>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} spacing={2}>
            <Box p={1}>
              <Typography variant="subtitle1">Função</Typography>
              <Typography variant="button">
                {capitalizeFirstLetter(worker?.role)}
              </Typography>
            </Box>

            <Box p={1}>
              <Typography variant="subtitle1">Matrícula</Typography>
              <Typography variant="button">
                {formatMatriculation(worker?.matriculation)}
              </Typography>
            </Box>

            <Box p={1}>
              <Typography variant="subtitle1">Departamento</Typography>
              <Typography variant="button">
                {capitalizeFirstLetter(worker?.department?.name)}
              </Typography>
            </Box>
            <Box p={1} pt={5}>
              <Typography variant="caption">{dayOffText}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DataList data={parseToDataList(workerVacations)} title="Folgas" />
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
        <Button variant="contained" onClick={handleDelete}>
          Excluir
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleChangeExternality}
        >
          {`Marcar trabalhador como ${
            worker.isExternal ? "interno" : "externo"
          }`}
        </Button>
        <Button variant="contained" onClick={handleEdit}>
          Editar
        </Button>
      </Grid>
    </Container>
  );
}
