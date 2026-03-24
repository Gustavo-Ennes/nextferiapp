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
  Stack,
  Chip,
} from "@mui/material";
import { useDialog } from "@/context/DialogContext";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { FuelDetailParam } from "../types";

export function FuelDetail({ fuel }: FuelDetailParam) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { openConfirmationDialog } = useDialog();
  const priceVersions = (fuel.priceVersions ?? []) as FuelPriceVersionDTO[];

  // Ordena as versões da mais recente para a mais antiga para exibição
  const sortedVersions = [...priceVersions].sort(
    (a, b) => b.version - a.version,
  );
  const currentPriceVersion = fuel.currentPriceVersion as FuelPriceVersionDTO;

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

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
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
              Unidade: {fuel.unit}
            </Typography>
          </Grid>

          <Grid size={12}>
            <Divider>
              <Chip label="Preço Atual" size="small" color="primary" />
            </Divider>
          </Grid>

          <Grid size={12} textAlign="center">
            <Typography variant="h4" color="primary.main" fontWeight="medium">
              R$ {currentPriceVersion.price.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Versão atual: {currentPriceVersion.version}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção de Histórico de Versões */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Histórico de Versões
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1} divider={<Divider flexItem />}>
          {sortedVersions.map((v) => (
            <Box
              key={v._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                bgcolor:
                  v.version === currentPriceVersion.version
                    ? "action.selected"
                    : "transparent",
                borderRadius: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle2">Versão {v.version}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(v.createdAt!).toLocaleDateString("pt-BR")}
                </Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                R$ {v.price.toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Grid container spacing={2} my={4} justifyContent="space-between">
        <Grid>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Excluir
          </Button>
        </Grid>
        <Grid>
          <Button variant="contained" onClick={handleEdit}>
            Nova Versão / Editar
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
