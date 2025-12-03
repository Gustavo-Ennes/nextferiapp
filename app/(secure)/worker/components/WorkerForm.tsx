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
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useRouter } from "next/navigation";
import type { WorkerFormData, WorkerProps } from "../types";
import { DatePicker } from "@mui/x-date-pickers";
import { WorkerValidator } from "../validator";
import { prepareDefaults, workerBaseline } from "../utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toDate, isValid as dateFnsIsValid } from "date-fns";
import type { PickerValue } from "@mui/x-date-pickers/internals";
import { capitalizeFirstLetter } from "@/app/utils";
import { useSnackbar } from "@/context/SnackbarContext";
import type { SnackbarData } from "@/context/types";

export function WorkerForm({ defaultValues, departments = [] }: WorkerProps) {
  const router = useRouter();
  const { addSnack } = useSnackbar();
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
      ? `${process.env.NEXT_PUBLIC_URL}/api/worker/${
          defaultValues._id as string
        }`
      : `${process.env.NEXT_PUBLIC_URL}/api/worker`;
    const snackbarData: SnackbarData = { message: "" };

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      console.error("Erro ao salvar servidor");
      snackbarData.message = "Error ao salvar o servidor.";
      snackbarData.severity = "error";
    } else {
      snackbarData.message = `Servidor ${capitalizeFirstLetter(
        formData.name.split(" ")[0]
      )} ${defaultValues ? "editado(a)" : "criado(a)"} com sucesso!`;
      snackbarData.severity = "success";
    }

    router.push("/worker");
    addSnack(snackbarData);
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

      <Grid size={7} component={FormControl} fullWidth>
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
                    key={`opt-${department._id as string}`}
                    value={department._id as string}
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
      <Grid size={5}>
        <Controller
          name="isExternal"
          control={control}
          render={({ field }) => (
            <FormGroup>
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                slotProps={{ typography: { fontSize: 12 } }}
                label="Trabalhador externo?"
              />
            </FormGroup>
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
