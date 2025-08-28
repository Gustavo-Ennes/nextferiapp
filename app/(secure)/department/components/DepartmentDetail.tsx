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
import type { Department } from "@/app/types";
import { useModal } from "@/context/ModalContext";
import { capitalizeName } from "@/app/utils";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";

export function DepartmentDetail({
  department,
  workerQuantity = 0,
}: {
  department: Department;
  workerQuantity: number;
}) {
  const router = useRouter();
  const { open } = useModal();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();

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
        })
          .then(() => {
            setLoading(false);
            addSnack({
              message: "Você deletou um departamento",
              severity: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            addSnack({
              message: "Eita, houve um problema deletando um departamento.",
            });
          })
          .finally(() => router.push("/department"));
      },
    });

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <TitleTypography>Visualização de departamento</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Nome</Typography>
            <Typography>{capitalizeName(department?.name)}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Responsável</Typography>
            <Typography>
              {capitalizeName(department?.responsible?.worker?.name ?? "") ??
                "Excuído(a)"}
            </Typography>
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
