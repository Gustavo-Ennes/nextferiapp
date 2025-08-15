"use client";

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DepartmentFormData, DepartmentProps } from "../types";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DepartmentValidator } from "../validator";

export function DepartmentForm({ defaultValues, bosses }: DepartmentProps) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentValidator),
    mode: "onTouched",
    defaultValues: {
      name: defaultValues?.name ?? "",
      responsible: defaultValues?.responsible?._id ?? "_",
    },
  });

  const onSubmit: SubmitHandler<DepartmentFormData> = async (formData) => {
    const body = JSON.stringify(formData);
    const method = defaultValues ? "PUT" : "POST";
    const url = defaultValues
      ? `${process.env.NEXT_PUBLIC_URL}/api/department/${defaultValues._id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/department`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!res.ok) {
      throw new Error("Failed to save department");
    }
    router.push("/department/");
  };
  return (
    <Grid
      container
      component="form"
      spacing={2}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid size={12}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nome"
              size="small"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />
      </Grid>

      <Grid size={12}>
        <Controller
          name="responsible"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.responsible}>
              <InputLabel id="responsible-label">Chefe</InputLabel>
              <Select
                {...field}
                labelId="responsible-label"
                value={field.value}
                label="Chefe"
              >
                <MenuItem value={"_"}>
                  <em>Selecione o responsável pelo novo departamento</em>
                </MenuItem>
                {bosses?.map((boss) => (
                  <MenuItem key={boss._id} value={boss._id}>
                    {boss.worker?.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.responsible && (
                <FormHelperText>{errors.responsible.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>

      <Grid
        component={Box}
        size={2}
        offset={10}
        alignItems={"center"}
        justifyContent={"right"}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || isSubmitting}
          sx={{ width: 1 }}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Grid>
    </Grid>
  );
}
