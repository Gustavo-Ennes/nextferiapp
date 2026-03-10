"use client";

import { useParams } from "next/navigation";
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
import { useDialog } from "@/context/DialogContext";
import { capitalizeName } from "@/app/utils";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { BossDTO, WorkerDTO } from "@/dto";
import { useRouter } from "@/context/RouterContext";

export function BossDetail({ boss }: { boss: BossDTO }) {
  const { id } = useParams();
  const { openConfirmationDialog } = useDialog();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { redirectWithLoading } = useRouter();

  const handleEdit = () => redirectWithLoading(`/boss/form?id=${id}`);
  const handleDelete = () =>
    openConfirmationDialog({
      title: "Excluir chefe",

      description: `Deseja excuir o chefe ${capitalizeName(
        (boss.worker as WorkerDTO).name,
      )}(${boss.role})?`,

      onConfirm: async () => {
        setLoading(true);
        fetch(`/api/boss/${id}`, {
          method: "delete",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(() => {
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
          .finally(() => redirectWithLoading("/boss"));
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
              {capitalizeName((boss?.worker as WorkerDTO)?.name)}
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
