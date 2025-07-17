"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
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
import { Boss } from "@/app/types";

export default function BossViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [boss, setBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/boss/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setBoss(data.data))
      .catch((err) => redirect("/not-found"))
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
        Visualização de Servidor
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Nome</Typography>
            <Typography>{boss?.name}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Cargo</Typography>
            <Typography>{boss?.role}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Diretor?</Typography>
            <Typography>{boss?.isDirector ? "Sim" : "Não"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Ativo?</Typography>
            <Typography>{boss?.isActive ? "Sim" : "Não"}</Typography>
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
