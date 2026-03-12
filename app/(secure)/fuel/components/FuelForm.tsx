"use client";

import { Button, TextField, Grid, Typography, Divider } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useLoading } from "@/context/LoadingContext";
import { useRouter as useInternalRouter } from "@/context/RouterContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { FuelValidator } from "../validator";
import type { FuelFormData } from "../types";
import type { FuelFormProps } from "../types";

export function FuelForm({ defaultValues }: FuelFormProps) {
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { redirectWithLoading, nextRouter } = useInternalRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FuelFormData>({
    resolver: zodResolver(FuelValidator),
    mode: "onTouched",
    defaultValues: defaultValues ?? {
      name: "",
      unit: "L",
      pricePerUnit: 0,
    },
  });

  const onSubmit: SubmitHandler<FuelFormData> = async (formData) => {
    setLoading(true);
    const method = defaultValues?._id ? "PUT" : "POST";
    const url = defaultValues?._id
      ? `/api/fuel/${defaultValues._id}`
      : `/api/fuel`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      addSnack({
        message: `Combustível ${formData.name} salvo com sucesso!`,
        severity: "success",
      });

      redirectWithLoading("/fuel");
    } catch (error) {
      addSnack({ message: "Erro ao salvar o combustível.", severity: "error" });
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
      <Grid size={12}>
        <Typography variant="h6">Cadastro de Combustível</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure o nome, unidade de medida e o preço base para cálculos
          automáticos.
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Nome do Combustível (ex: Gasolina)"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Unidade (ex: L, m³)"
              error={!!errors.unit}
              helperText={errors.unit?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Controller
          name="pricePerUnit"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label="Preço Base (R$)"
              onChange={(e) => field.onChange(Number(e.target.value))}
              error={!!errors.pricePerUnit}
              helperText={errors.pricePerUnit?.message}
              slotProps={{
                htmlInput: { step: "0.01" },
              }}
            />
          )}
        />
      </Grid>

      <Grid
        size={12}
        sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
      >
        <Button variant="outlined" onClick={() => nextRouter.back()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Configuração"}
        </Button>
      </Grid>
    </Grid>
  );
}
