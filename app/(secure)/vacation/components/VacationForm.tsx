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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRouter } from "next/navigation";
import { VacationFormData, VacationProps } from "../types";
import { capitalizeFirstLetter, capitalizeName } from "@/app/utils";
import { VacationValidator } from "../validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { translateEntityKey } from "@/app/translate";
import { useEffect } from "react";
import { prepareDefaults, baselineForType } from "../utils";
import { toDate, isValid as dateFNSIsValid } from "date-fns";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { SnackbarData } from "@/context/types";

export function VacationForm({
  defaultValues,
  id,
  workers,
  bosses,
  type = "normal",
}: VacationProps) {
  const router = useRouter();
  const { addSnack } = useSnackbar();
  const { setPdf } = usePdfPreview();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
  } = useForm<VacationFormData>({
    resolver: zodResolver(VacationValidator),
    mode: "onTouched",
    defaultValues: defaultValues
      ? prepareDefaults(defaultValues)
      : baselineForType(type),
  });

  const onSubmit: SubmitHandler<VacationFormData> = async (formData) => {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/vacation`;
    const translatedVacationType = translateEntityKey({
      entity: "vacation",
      key: defaultValues?.type ?? type,
    })?.toLowerCase();
    const snackbarData: SnackbarData = { message: "" };

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const {
      data: { _id },
    } = await res.json();

    if (!res.ok) {
      console.error(await res.json());

      snackbarData.message = `Eita, houve um erro na ${
        defaultValues ? "edição" : "criação"
      } do(a) ${translatedVacationType}.`;
      snackbarData.severity = "error";
    } else {
      snackbarData.message = `${capitalizeFirstLetter(
        translatedVacationType
      )} ${defaultValues ? "editado(a)" : "criado(a)"} com sucesso!`;
      snackbarData.severity = "success";

      setPdf({ type: "vacation", _id });
    }

    router.push(`/vacation${type !== "normal" ? `/${type}` : ""}`);
    addSnack(snackbarData);
  };

  const getDurations = () => {
    if (type === "normal") return [15, 30];
    if (type === "license") return [15, 30, 45, 60, 75, 90];
    if (type === "dayOff") return [0.5, 1];
    return [];
  };

  const getPeriodFromDuration = (duration: number) =>
    duration === 0.5 ? "half" : "full";

  const watchForm = watch();
  useEffect(() => {
    if (type === "dayOff") {
      errors.period = undefined;
      setValue("duration", watchForm.period === "half" ? 0.5 : 1);
    }
  }, [watchForm.period]);

  return (
    <Grid
      container
      component={"form"}
      spacing={2}
      onSubmit={handleSubmit(onSubmit)}
    >
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
                disabled={!!defaultValues}
              >
                <MenuItem value={"-"}>
                  <em>Selecione o servidor</em>
                </MenuItem>
                {workers?.map((worker) => (
                  <MenuItem key={worker._id} value={worker._id}>
                    {worker?.name}
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

      <Grid size={6}>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <>
              <DatePicker
                {...field}
                value={toDate(field.value)}
                onChange={(e: PickerValue) =>
                  e && dateFNSIsValid(e)
                    ? setValue("startDate", e.toISOString())
                    : new Date().toISOString()
                }
                sx={{ width: 1 }}
                label="Início"
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { size: "small", error: !!errors.startDate },
                }}
              />
              {errors.startDate && (
                <FormHelperText>{errors.startDate.message}</FormHelperText>
              )}
            </>
          )}
        />
      </Grid>

      <Grid size={6}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.type}>
              <InputLabel id="type-label">Tipo</InputLabel>
              <Select
                {...field}
                labelId="type-label"
                value={field.value}
                label="Tipo"
                disabled
              >
                <MenuItem value={"-"}>
                  <em>Selecione o tipo</em>
                </MenuItem>
                {["license", "normal", "dayOff"]?.map((vacationPeriod) => (
                  <MenuItem
                    key={`opt-${vacationPeriod}`}
                    value={vacationPeriod}
                  >
                    {translateEntityKey({
                      entity: "vacation",
                      key: vacationPeriod,
                    })}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <FormHelperText>{errors.type.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>

      {type === "dayOff" && (
        <Grid size={6}>
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.period}>
                <InputLabel id="period-label">Período</InputLabel>
                <Select
                  {...field}
                  labelId="period-label"
                  value={field.value}
                  label="Período"
                >
                  <MenuItem value={"-"}>
                    <em>Selecione o período</em>
                  </MenuItem>{" "}
                  {getDurations()?.map((duration) => {
                    const period = getPeriodFromDuration(duration);
                    return (
                      <MenuItem key={`opt-dayoff-${duration}`} value={period}>
                        {translateEntityKey({
                          entity: "vacation",
                          key: period,
                        })}
                      </MenuItem>
                    );
                  })}
                </Select>
                {errors.period && (
                  <FormHelperText>{errors.period.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      )}

      {(type === "normal" || type === "license") && (
        <Grid size={6}>
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.duration}>
                <InputLabel id="duration-label">Duração</InputLabel>
                <Select
                  {...field}
                  labelId="duration-label"
                  value={field.value}
                  label="Duração"
                >
                  <MenuItem value={"-"}>
                    <em>Selecione a duração</em>
                  </MenuItem>
                  {getDurations()?.map((vacationDuration) => (
                    <MenuItem
                      key={`opt-${vacationDuration}`}
                      value={vacationDuration}
                    >
                      {vacationDuration}
                    </MenuItem>
                  ))}
                </Select>
                {errors.duration && (
                  <FormHelperText>{errors.duration.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      )}

      <Grid size={6}>
        <Controller
          name="boss"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.boss}>
              <InputLabel id="boss-label">Aprovante</InputLabel>
              <Select
                {...field}
                labelId="boss-label"
                value={field.value}
                label="Aprovante"
              >
                <MenuItem value={"-"}>
                  <em>Selecione quem aprova</em>
                </MenuItem>
                {bosses?.map((boss) => (
                  <MenuItem key={`opt-${boss._id}`} value={boss._id}>
                    {capitalizeName(boss.worker?.name ?? "")}
                  </MenuItem>
                ))}
              </Select>
              {errors.boss && (
                <FormHelperText>{errors.boss.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      <Grid size={12}>
        <Controller
          name="observation"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              label="Observação"
              multiline
              fullWidth
              rows={3}
            />
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
