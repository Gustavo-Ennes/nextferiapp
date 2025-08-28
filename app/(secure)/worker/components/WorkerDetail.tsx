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
  Stack,
} from "@mui/material";
import type { Worker } from "@/app/types";
import { useModal } from "@/context/ModalContext";
import { capitalizeName } from "@/app/utils";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";

export function WorkerDetail({ worker }: { worker: Worker }) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { open } = useModal();

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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <TitleTypography>Visualização de servidor</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Nome</Typography>
            <Typography>{worker?.name}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Cargo</Typography>
            <Typography>{worker?.role}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Matrícula</Typography>
            <Typography>{worker?.matriculation}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Departamento</Typography>
            <Typography>{worker?.department.name}</Typography>
          </Box>
        </Stack>
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
