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
import { Badge } from "@mui/icons-material";
import { blue } from "@mui/material/colors";
import { DataList } from "../../components/DataList";
import { parseToDataList } from "../../vacation/utils";
import { getWorkerDayOffsLeft } from "../../vacation/utils";

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
      ? `Servidor ainda possui ${workerUnusedDayOffs} abonos.`
      : `Servidor já tirou todas as suas abonadas esse ano.`;

  const handleEdit = () => router.push(`/worker/form?id=${worker._id}`);
  const handleDelete = () =>
    open({
      title: "Excluir servidor",
      description: `Deseja excluir o servidor ${capitalizeName(worker.name)}?`,
      onConfirm: async () => {
        setLoading(true);
        fetch(`/api/worker/${worker._id}`, { method: "delete" })
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

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <TitleTypography>Visualização de servidor</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Box>
              <Typography variant="h5" textAlign={"center"}>
                <Badge
                  sx={{ mr: 1, color: blue[800], float: "left", fontSize: 45 }}
                />
                {capitalizeName(worker?.name)}
              </Typography>
            </Box>
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
              <Typography variant="button">{worker?.matriculation}</Typography>
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
        <Button variant="contained" onClick={handleEdit}>
          Editar
        </Button>
      </Grid>
    </Container>
  );
}
