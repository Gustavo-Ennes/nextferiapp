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
} from "@mui/material";
import { useDialog } from "@/context/DialogContext";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

export function PurchaseOrderDetail({
  purchaseOrder,
}: {
  purchaseOrder: PurchaseOrderDTO;
}) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { openConfirmationDialog } = useDialog();

  const handleEdit = () =>
    router.redirectWithLoading(`/purchaseOrder/form?id=${purchaseOrder._id}`);

  const handleDelete = () =>
    openConfirmationDialog({
      title: "Excluir saldo de pedido?",
      description: `Deseja excluir o pedido ${purchaseOrder.reference}?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/purchaseOrder/${purchaseOrder._id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error();

          addSnack({
            message: "Pedido excluído com sucesso",
            severity: "success",
          });
        } catch (err) {
          console.error(err);
          addSnack({
            message: "Houve um problema ao excluir o pedido.",
            severity: "error",
          });
        } finally {
          router.redirectWithLoading("/purchaseOrder");
        }
      },
    });

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <TitleTypography>Visualização de Pedido</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="h5" textAlign="center" gutterBottom>
              Ref: {purchaseOrder.reference}
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              textAlign="center"
            >
              Departamento: {(purchaseOrder.department as DepartmentDTO).name}
            </Typography>
          </Grid>

          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={12}>
            <Stack spacing={2}>
              {purchaseOrder.items.map((item, i) => (
                <Box
                  key={`item-${i}`}
                  sx={{
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {(item.fuel as FuelDTO).name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity.toFixed(2)} {(item.fuel as FuelDTO).unit} x
                      R$
                      {(
                        item.fuelPriceVersion as FuelPriceVersionDTO
                      ).price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    R$ {item.price.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
                px: 1,
              }}
            >
              <Typography variant="h6">Total do Pedido</Typography>
              <Typography variant="h6" color="primary.main">
                R$ {purchaseOrder.total.toFixed(2)}
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
            Editar
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
