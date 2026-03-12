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
import type { PurchaseFormProps, PurchaseOrderFormData } from "../types";
import { PurchaseOrderValidator } from "../validator";
import { prepareDefaults, purchaseOrderBaseline } from "../utils";
import { useLoading } from "@/context/LoadingContext";
import { useRouter as useInternalRouter } from "@/context/RouterContext";
import { useSnackbar } from "@/context/SnackbarContext";

export function PurchaseOrderForm({
  defaultValues,
  departments,
  fuels,
}: PurchaseFormProps) {
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { redirectWithLoading, nextRouter } = useInternalRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    getValues,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(PurchaseOrderValidator),
    mode: "onTouched",
    defaultValues: defaultValues
      ? prepareDefaults(defaultValues)
      : purchaseOrderBaseline,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" });

  const handleAppendFuel = () => {
    const currentItems = getValues("items") || [];
    const selectedFuelIds = currentItems.map((i) => i.fuel);
    const nextAvailable = fuels.find((f) => !selectedFuelIds.includes(f._id));

    if (nextAvailable && fields.length < fuels.length) {
      append({ fuel: nextAvailable._id, quantity: 0 });
    }
  };

  const onSubmit: SubmitHandler<PurchaseOrderFormData> = async (formData) => {
    setLoading(true);
    const method = defaultValues ? "PUT" : "POST";
    const url = defaultValues
      ? `/api/purchaseOrder/${defaultValues._id}`
      : `/api/purchaseOrder`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      addSnack({
        message: `Pedido ${formData.reference} salvo com sucesso!`,
        severity: "success",
      });

      redirectWithLoading("/purchaseOrder");
    } catch (error) {
      addSnack({ message: "Erro ao salvar o pedido.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid
      container
      spacing={3}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Departamento"
              error={!!errors.department}
              helperText={errors.department?.message}
            >
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
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
        <Typography variant="h6">Itens do Pedido</Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>

      {fields.map((item, index) => {
        const otherSelectedIds =
          watchedItems?.filter((_, i) => i !== index).map((i) => i.fuel) || [];

        const availableOptions = fuels.filter(
          (f) => !otherSelectedIds.includes(f._id),
        );

        return (
          <Grid
            container
            spacing={2}
            key={item.id}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Grid size={{ xs: 6 }}>
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
                    {availableOptions.map((f) => (
                      <MenuItem key={f._id} value={f._id}>
                        {f.name} ({f.unit})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Controller
                name={`items.${index}.quantity`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Quantidade"
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
          disabled={fields.length >= fuels.length}
        >
          Adicionar Item
        </Button>
      </Grid>

      <Grid
        size={{ xs: 12 }}
        sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
      >
        <Button variant="outlined" onClick={() => nextRouter.back()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Confirmar Pedido"}
        </Button>
      </Grid>
    </Grid>
  );
}
