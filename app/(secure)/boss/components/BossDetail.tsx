"use client";

import { useParams, useRouter } from "next/navigation";
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
import { Boss } from "@/app/types";
import { useModal } from "@/context/ModalContext";
import { capitalizeName } from "@/app/utils";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";

export function BossDetail({ boss }: { boss: Boss }) {
  const { id } = useParams();
  const router = useRouter();
  const { open } = useModal();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();

  const handleEdit = () => router.push(`/boss/form?id=${id}`);
  const handleDelete = () =>
    open({
      title: "Excluir chefe",
      description: `Deseja excuir o chefe ${capitalizeName(boss.name)}(${
        boss.role
      })?`,
      onConfirm: async () => {
        fetch(`/api/boss/${id}`, {
          method: "delete",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(() => {
            setLoading(false);
            addSnack({
              message: "Você deletou um chefe",
              severity: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            addSnack({
              message: "Eita, houve um problema deletando um chefe.",
            });
          })
          .finally(() => router.push("/boss"));
      },
    });

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <TitleTypography>Visualização de chefe</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Nome</Typography>
            <Typography>
              {capitalizeName(boss?.worker?.name ?? boss?.name)}
            </Typography>
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
