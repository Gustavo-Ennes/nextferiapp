"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Worker } from "@/app/types";

export default function DepartmentViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/worker/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setWorker(data.worker))
      .catch(() => router.push("/not-found"))
      .finally(() => setLoading(false));
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  const handleEdit = () => {};
  const handleDelete = () => {};

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
