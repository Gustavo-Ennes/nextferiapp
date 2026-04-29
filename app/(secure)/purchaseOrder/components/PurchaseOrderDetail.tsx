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
  Tooltip,
  Alert,
} from "@mui/material";
import { useDialog } from "@/context/DialogContext";
import { TitleTypography } from "../../components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type {
  PurchaseOrderDTO,
  PurchaseOrderItemDTO,
} from "@/dto/PurchaseOrderDTO";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

export function PurchaseOrderDetail({
  purchaseOrder,
  fuels,
}: {
  purchaseOrder: PurchaseOrderDTO;
  fuels: FuelDTO[];
}) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { openConfirmationDialog } = useDialog();

  const isFuelVersionOutdated = (item: PurchaseOrderItemDTO) => {
    const fuel = fuels.find((f) => f._id === (item.fuel as FuelDTO)._id);

    if (!fuel)
      throw new Error(
        `Fuel ${(item.fuel as FuelDTO).name} not found to compare versions.`,
      );

    const fuelCurrentPriceVersion = (
      fuel.currentPriceVersion as FuelPriceVersionDTO
    ).version;
    const itemPriceVersion = (item.fuelPriceVersion as FuelPriceVersionDTO)
      .version;

    return fuelCurrentPriceVersion !== itemPriceVersion;
  };

  const getCurrentFuel = (id: string) => fuels.find((f) => f._id === id);

  const isEntirePurchaseOrderOutdated = purchaseOrder.items.every((i) =>
    isFuelVersionOutdated(i),
  );

  const isSomeItemOutdated = purchaseOrder.items.some((i) =>
    isFuelVersionOutdated(i),
  );

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

  const alertText = isEntirePurchaseOrderOutdated
    ? `  Todos os items desse pedido estão com versões de preço desatualizadas
          e não podem ser utilizados.`
    : isSomeItemOutdated
      ? "Um ou mais itens nesse pedido tem sua versão de preço desatualizada e não pode(m) ser utilizado(s)."
      : null;

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <TitleTypography>Visualização de Pedido</TitleTypography>

      {alertText && (
        <Alert
          variant="outlined"
          color={
            isSomeItemOutdated && !isEntirePurchaseOrderOutdated
              ? "warning"
              : "error"
          }
          sx={{ my: 3 }}
        >
          {alertText}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          backgroundColor: isEntirePurchaseOrderOutdated
            ? "#ebdddd"
            : "background.paper",
        }}
      >
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
              {purchaseOrder.items.map((item, i) => {
                const isItemPriceVersionOutdated = isFuelVersionOutdated(item);
                const currentFuel = getCurrentFuel((item.fuel as FuelDTO)._id);
                const currentFuelPriceVersion = (
                  currentFuel!.currentPriceVersion as FuelPriceVersionDTO
                ).version;
                const outdatedMessage = `Versão antiga. A versão atual para ${currentFuel?.name} é v${currentFuelPriceVersion}`;

                return (
                  <Tooltip
                    title={isItemPriceVersionOutdated ? outdatedMessage : ""}
                    key={`item-${i}`}
                  >
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "action.hover",
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: isItemPriceVersionOutdated
                          ? "2px solid red"
                          : "none",
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {(item.fuel as FuelDTO).name} - v
                          {
                            (item.fuelPriceVersion as FuelPriceVersionDTO)
                              .version
                          }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.quantity.toFixed(2)}{" "}
                          {(item.fuel as FuelDTO).unit} x R$
                          {(
                            item.fuelPriceVersion as FuelPriceVersionDTO
                          ).price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        R$ {item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
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
