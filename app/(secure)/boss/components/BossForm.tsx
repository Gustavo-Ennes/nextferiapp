"use client";

import {
  TextField,
  MenuItem,
  Select,
  Grid,
  Button,
  FormHelperText,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import type { BossFormData, BossProps } from "../types";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { BossValidator } from "../validator";
import { useSnackbar } from "@/context/SnackbarContext";
import type { SnackbarData } from "@/context/types";
import { capitalizeName } from "@/app/utils";

export function BossForm({ defaultValues, workers }: BossProps) {
  const router = useRouter();
  const { addSnack } = useSnackbar();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<BossFormData>({
    resolver: zodResolver(BossValidator),
    mode: "onTouched",
    defaultValues: {
      worker: (defaultValues?.worker?._id as string) ?? "_",
      role: defaultValues?.role ?? "",
      isDirector: defaultValues?.isDirector ?? false,
    },
  });

  const onSubmit: SubmitHandler<BossFormData> = async (formData) => {
    const snackbarData: SnackbarData = { message: "" };

    try {
      const method = defaultValues ? "PUT" : "POST";
      const url = defaultValues
        ? `${process.env.NEXT_PUBLIC_URL}/api/boss/${
            defaultValues._id as string
          }`
        : `${process.env.NEXT_PUBLIC_URL}/api/boss`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar chefe");
      }

      snackbarData.message = `Chefe ${
        defaultValues ? "editado" : "criado"
      } com sucesso!`;
    } catch (err) {
      console.error(err);

      snackbarData.message = `Eita, houve um erro na ${
        defaultValues ? "edição" : "criação"
      } do chefe.`;
    } finally {
      router.push("/boss");

      addSnack(snackbarData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Controller
            name="worker"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.worker}>
                <InputLabel id="worker-label">Servidor</InputLabel>
                <Select
                  {...field}
                  labelId="worker-label"
                  value={field.value}
                  label="Servidor"
                >
                  <MenuItem value={"_"}>
                    <em>Selecione o servidor</em>
                  </MenuItem>
                  {workers.map((worker) => (
                    <MenuItem
                      key={worker._id as string}
                      value={worker._id as string}
                    >
                      {capitalizeName(worker.name)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.worker && (
                  <FormHelperText>{errors.worker.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={12}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cargo"
                size="small"
                fullWidth
                error={!!errors.role}
                helperText={errors.role?.message}
              />
            )}
          />
        </Grid>

        {/* Botão Salvar */}
        <Grid size={2} sx={{ ml: "auto" }}>
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
    </form>
  );
}
