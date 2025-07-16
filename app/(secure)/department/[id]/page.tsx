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
import { Department } from "@/app/types";

export default function DepartmentViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [department, setDepartment] = useState<Department | null>(null);
  const [workerQuantity, setWorkerQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/department/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setDepartment(data.department))
      .catch(() => router.push("/not-found"))
      .finally(() => setLoading(false));
    fetch(`/api/worker/`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setWorkerQuantity(data.workers?.length ?? 0))
      .catch(() => router.push("/not-found"))
      .finally(() => setLoading(false));
  }, [id, router]);

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
        Visualização de departamento
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Nome</Typography>
            <Typography>{department?.name}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Responsável</Typography>
            <Typography>{department?.responsible}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Servidores</Typography>
            <Typography>
              O departamento possui {workerQuantity} servidor
              {workerQuantity !== 1 ? "es" : ""}.
            </Typography>
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
