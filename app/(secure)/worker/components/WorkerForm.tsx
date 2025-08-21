"use client";

import {
  Box,
  Button,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  FormHelperText,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { WorkerFormData, WorkerProps } from "../types";
import { DatePicker } from "@mui/x-date-pickers";
import { WorkerValidator } from "../validator";
import { prepareDefaults, workerBaseline } from "../utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toDate, isValid as dateFnsIsValid } from "date-fns";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { capitalizeFirstLetter } from "@/app/utils";

export function WorkerForm({ defaultValues, departments = [] }: WorkerProps) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },

    setValue,
  } = useForm<WorkerFormData>({
    resolver: zodResolver(WorkerValidator),
    mode: "onTouched",
    defaultValues: defaultValues
      ? prepareDefaults(defaultValues)
      : workerBaseline,
  });

  const onSubmit: SubmitHandler<WorkerFormData> = async (
    formData: WorkerFormData
  ) => {
    const method = defaultValues ? "PUT" : "POST";
    const url = defaultValues
      ? `${process.env.NEXT_PUBLIC_URL}/api/worker/${defaultValues._id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/worker`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("Erro ao salvar servidor");
    }
    router.push("/worker");
  };

  return (
    <Grid
      container
      spacing={2}
      component={"form"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Grid size={12}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size="small"
              required
              name="name"
              label="Nome"
              helperText={errors.name?.message}
              error={!!errors.name}
            />
          )}
        />
      </Grid>

      <Grid size={6}>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size="small"
              required
              name="role"
              label="Cargo"
              helperText={errors.role?.message}
              error={!!errors.role}
            />
          )}
        />
      </Grid>

      <Grid size={6}>
        <Controller
          name="registry"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size="small"
              required
              name="registry"
              label="N. registro"
              helperText={errors.registry?.message}
              error={!!errors.registry}
            />
          )}
        />
      </Grid>

      <Grid size={6}>
        <Controller
          name="matriculation"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size="small"
              required
              name="matriculation"
              label="N. matrícula"
              helperText={errors.matriculation?.message}
              error={!!errors.matriculation}
            />
          )}
        />
      </Grid>

      <Grid size={6}>
        <Controller
          name="admissionDate"
          control={control}
          render={({ field }) => (
            <>
              <DatePicker
                {...field}
                value={toDate(field.value)}
                onChange={(e: PickerValue) =>
                  e && dateFnsIsValid(e)
                    ? setValue("admissionDate", e.toISOString())
                    : new Date().toISOString()
                }
                sx={{ width: 1 }}
                label="Admissão"
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { size: "small", error: !!errors.admissionDate },
                }}
              />
              {errors.admissionDate && (
                <FormHelperText>{errors.admissionDate.message}</FormHelperText>
              )}
            </>
          )}
        />
      </Grid>

      <Grid size={12} component={FormControl} fullWidth>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.department}>
              <InputLabel id="department-label">Departamento</InputLabel>
              <Select
                {...field}
                labelId="department-label"
                value={field.value}
                label="Departamento"
              >
                <MenuItem value={"-"}>
                  <em>Selecione o departamento</em>
                </MenuItem>
                {departments?.map((department) => (
                  <MenuItem
                    key={`opt-${department._id}`}
                    value={department._id}
                  >
                    {capitalizeFirstLetter(department.name)}
                  </MenuItem>
                ))}
              </Select>
              {errors.department && (
                <FormHelperText>{errors.department.message}</FormHelperText>
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
          fullWidth
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Grid>
    </Grid>
  );
}
