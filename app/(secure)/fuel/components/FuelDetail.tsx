"use client";

import { useRouter } from "@/context/RouterContext";
import {
  Container,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import { useDialog } from "@/context/DialogContext";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { FuelDTO } from "@/dto/FuelDTO";

export function FuelDetail({ fuel }: { fuel: FuelDTO }) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { openConfirmationDialog } = useDialog();

  const handleEdit = () =>
    router.redirectWithLoading(`/fuel/form?id=${fuel._id}`);

  const handleDelete = () =>
    openConfirmationDialog({
      title: "Excluir cadastro de combustível?",
      description: `Deseja excluir o combustível ${fuel.name}? Esta ação pode afetar relatórios de pedidos.`,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/fuel/${fuel._id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error();

          addSnack({
            message: "Combustível excluído com sucesso",
            severity: "success",
          });
        } catch (err) {
          console.error(err);
          addSnack({
            message: "Erro ao excluir combustível.",
            severity: "error",
          });
        } finally {
          router.redirectWithLoading("/fuel");
        }
      },
    });

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <TitleTypography>Detalhes do Combustível</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h5" textAlign="center" fontWeight="bold">
              {fuel.name}
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              textAlign="center"
            >
              ID: {fuel._id}
            </Typography>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Unidade de Medida
            </Typography>
            <Typography variant="h6">{fuel.unit}</Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Preço por Unidade
            </Typography>
            <Typography variant="h6" color="primary.main">
              R$ {fuel.pricePerUnit.toFixed(2)}
            </Typography>
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: "info.soft",
                borderRadius: 1,
                borderLeft: "4px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="body2">
                Este valor é utilizado como base para o cálculo automático de
                novos pedidos de compra.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} my={3} justifyContent="space-between">
        <Grid>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Excluir
          </Button>
        </Grid>
        <Grid>
          <Button variant="contained" onClick={handleEdit}>
            Editar Preço/Cadastro
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
