"use client";

import {
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useFieldArray,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { fuelTypes } from "@/lib/repository/weeklyFuellingSummary/types";
import type { PurchaseFormProps, PurchaseOrderFormData } from "../types";
import { PurchaseOrderValidator } from "../validator";
import { purchaseOrderBaseline } from "../utils";
import type { SnackbarData } from "@/context/types";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "@/context/RouterContext";
import { useSnackbar } from "@/context/SnackbarContext";

export function PurchaseOrderForm({ defaultValues }: PurchaseFormProps) {
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    getValues,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(PurchaseOrderValidator),
    mode: "onTouched",
    defaultValues: defaultValues ?? purchaseOrderBaseline,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  });

  const handleAppendFuel = () => {
    const currentItems = getValues("items");
    const selectedFuels = currentItems.map((i) => i.fuel);

    const nextAvailableFuel = fuelTypes.find((f) => !selectedFuels.includes(f));

    if (nextAvailableFuel && fields.length < 4) {
      append({ fuel: nextAvailableFuel, quantity: 0, price: 0 });
    }
  };

  const onSubmit: SubmitHandler<PurchaseOrderFormData> = async (formData) => {
    setLoading(true);
    const method = defaultValues ? "PUT" : "POST";
    const url = defaultValues
      ? `/api/purchaseOrder/${defaultValues._id}`
      : `/api/purchaseOrder`;

    const snackbarData: SnackbarData = { message: "" };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      snackbarData.message = `Pedido ${formData.reference} ${defaultValues ? "editado" : "criado"} com sucesso!`;
      snackbarData.severity = "success";
    } catch (error) {
      snackbarData.message = "Erro ao salvar o pedido.";
      snackbarData.severity = "error";
    } finally {
      setLoading(false);
      router.redirectWithLoading("/purchaseOrder");
      addSnack(snackbarData);
    }
  };

  return (
    <Grid
      container
      spacing={3}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Grid size={{ xs: 12 }}>
        <Controller
          name="reference"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Referência (xxx/25)"
              error={!!errors.reference}
              helperText={errors.reference?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Combustíveis</Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>

      {fields.map((item, index) => {
        // Lógica de filtro: Mantém o combustível atual do select + os que não foram escolhidos em outros campos
        const otherSelectedFuels = watchedItems
          .filter((_, i) => i !== index)
          .map((i) => i.fuel);

        const availableOptions = fuelTypes.filter(
          (f) => !otherSelectedFuels.includes(f),
        );

        return (
          <Grid
            container
            spacing={2}
            key={item.id}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Grid size={{ xs: 4 }}>
              <Controller
                name={`items.${index}.fuel`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Combustível"
                    size="small"
                  >
                    {availableOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Controller
                name={`items.${index}.quantity`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Qtd (L)"
                    size="small"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Controller
                name={`items.${index}.price`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Preço (R$)"
                    size="small"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 2 }}>
              <IconButton
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        );
      })}

      <Grid size={{ xs: 12 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAppendFuel}
          disabled={fields.length >= 4 || fields.length >= fuelTypes.length}
        >
          Adicionar Combustível
        </Button>
      </Grid>

      <Grid
        size={{ xs: 12 }}
        sx={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Pedido"}
        </Button>
      </Grid>
    </Grid>
  );
}
