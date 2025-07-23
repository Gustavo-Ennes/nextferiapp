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
import { Department } from "@/app/types";
import { useModal } from "@/context/ModalContext";
import { capitalizeName } from "@/app/utils";

export function DepartmentDetail({
  department,
  workerQuantity = 0,
}: {
  department: Department;
  workerQuantity: number;
}) {
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

  const handleEdit = () => router.push(`/department/form?id=${department._id}`);
  const handleDelete = () =>
    open({
      title: "Excluir chefe",
      description: `Deseja excuir o departamento ${capitalizeName(
        department.name
      )}?`,
      onConfirm: async () => {
        setLoading(true);
        fetch(`/api/department/${department._id}`, {
          method: "delete",
          headers: {
            "Content-Type": "application/json",
          },
        }).then(() => setLoading(false));
      },
    });

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
