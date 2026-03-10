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
import { capitalizeName } from "@/app/utils";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { translateFuelType } from "../utils";

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
      description: `Deseja excluir o pedido ${capitalizeName(purchaseOrder.reference)}?`,
      onConfirm: async () => {
        setLoading(true);

        fetch(`/api/purchaseOrder/${purchaseOrder._id}`, {
          method: "delete",
        })
          .then(() => {
            addSnack({
              message: "Você deletou um pedido",
              severity: "success",
            });
          })
          .catch((err) => {
            console.error(err);
            addSnack({
              message: "Eita, houve um problema deletando um pedido.",
            });
          })
          .finally(() => router.redirectWithLoading("/purchaseOrder"));
      },
    });

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <TitleTypography>Visualização de pedido</TitleTypography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="h5" textAlign={"center"}>
              {capitalizeName(purchaseOrder?.reference)}
            </Typography>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} spacing={2}>
            {purchaseOrder.items.map((item, i) => (
              <Box p={1} key={`purchaseOrder${i}`}>
                <Typography variant="subtitle1">
                  {translateFuelType(item.fuel)}
                </Typography>
                <Typography variant="body1">
                  {item.quantity.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  {`R$${item.price.toFixed(2)}`}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
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
