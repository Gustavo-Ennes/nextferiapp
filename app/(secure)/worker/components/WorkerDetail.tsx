"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import {  Worker } from "@/app/types";
import { useModal } from "@/context/ModalContext";
import { capitalizeName } from "@/app/utils";

export function WorkerDetail({ worker }: { worker: Worker }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { open } = useModal();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  const handleEdit = () => router.push(`/worker/form?id=${worker._id}`);
  const handleDelete = () =>
    open({
      title: "Excluir servidor",
      description: `Deseja excluir o servidor ${capitalizeName(worker.name)}?`,
      onConfirm: () => {
        setLoading(true);
        fetch(`/api/worker/${worker._id}`, { method: "delete" })
          .then((res) => res.json())
          .then((data) => {
            setLoading(false);
            router.push("/worker");
          });
      },
    });

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Visualização de servidor
      </Typography>

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
