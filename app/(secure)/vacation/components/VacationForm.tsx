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
import type { VacationFormData, VacationProps } from "../types";
import {
  capitalizeFirstLetter,
  capitalizeName,
  startOfDaySP,
} from "@/app/utils";
import { VacationValidator } from "../validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { translateEntityKey } from "@/app/translate";
import { useEffect, useState } from "react";
import {
  prepareDefaults,
  baselineForType,
  checkOverlappingVacations,
} from "../utils";
import {
  toDate,
  isValid as dateFNSIsValid,
  startOfYear,
  format,
} from "date-fns";
import type { PickerValue } from "@mui/x-date-pickers/internals";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { SnackbarData } from "@/context/types";
import type { Vacation } from "@/app/types";
import {
  translateVacation,
  translateVacationPeriod,
} from "@/lib/pdf/vacation/utils";
import { fetchAllPaginated } from "../../utils";

export function VacationForm({
  defaultValues,
  id,
  workers,
  bosses,
  type = "normal",
  isReschedule = false,
}: VacationProps) {
  const router = useRouter();
  const [blockedByDayOffsCount, setBlockedByDayOffsCount] = useState(false);
  const [periodConflictingVacations, setPeriodConflictingVacations] = useState<
    Vacation[]
  >([]);
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
    const method = !id || isReschedule ? "post" : "put";
    const url =
      !id || isReschedule
        ? `${process.env.NEXT_PUBLIC_URL}/api/vacation`
        : `${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`;

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

      setPdf({
        items: [{ type: "vacation", id: _id as string }],
        add: isReschedule,
      });
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

  useEffect(() => {
    if (
      watchForm.worker &&
      watchForm.worker !== "-" &&
      type === "dayOff" &&
      !defaultValues
    ) {
      fetchAllPaginated<Vacation>({
        type: "vacation",
        params: {
          worker: watchForm.worker,
          type,
          from: startOfYear(toDate(watchForm.startDate)),
          cancelled: false,
        },
      }).then((authorizedDayOffs) =>
        setBlockedByDayOffsCount(authorizedDayOffs.length >= 6)
      );
    }
  }, [watchForm.worker, watchForm.startDate]);

  useEffect(() => {
    if (watchForm.worker && watchForm.worker !== "-" && watchForm.startDate) {
      checkOverlappingVacations(watchForm, id).then(
        (conflicting: Vacation[]) => {
          setPeriodConflictingVacations(conflicting);
        }
      );
    }
  }, [watchForm.startDate, watchForm.duration]);

  if (defaultValues?.worker?.isActive === false) {
    addSnack({
      message:
        "Não é possível reagendar uma folga para um trabalhador inativo.",
      severity: "warning",
    });
    router.push(`/vacation${type !== "normal" ? `/${type}` : ""}`);
  }

  const getPeriodConflictMessage = () => {
    if (!periodConflictingVacations.length) return "";

    const moreThanOneConflict = periodConflictingVacations.length > 1;
    const firstConflictingVacation = periodConflictingVacations[0];
    const vacationType = firstConflictingVacation.type;
    const translatedPeriod = translateVacationPeriod(
      firstConflictingVacation.period
    );
    const msgStart = moreThanOneConflict
      ? `Vários conflitos: 1 -`
      : "Conflito:";
    const translatedVacationType = translateVacation(vacationType);
    const period = `${format(
      toDate(firstConflictingVacation.startDate),
      "dd/MM/yyyy"
    )} ~ ${
      vacationType !== "dayOff"
        ? format(toDate(firstConflictingVacation.endDate), "dd/MM/yyyy")
        : translatedPeriod
    }`;
    const final = moreThanOneConflict ? "..." : "";

    return `${msgStart} ${translatedVacationType}(${period})${final}`;
  };

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
            <FormControl
              fullWidth
              size="small"
              error={!!errors.worker || blockedByDayOffsCount}
            >
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
                  <MenuItem
                    key={worker._id as string}
                    value={worker._id as string}
                  >
                    {capitalizeName(worker?.name)}
                  </MenuItem>
                ))}
              </Select>
              {(errors.worker || blockedByDayOffsCount) && (
                <FormHelperText>
                  {errors.worker?.message ??
                    `Esse trabalhador já fruiu suas abonadas anuais.`}
                </FormHelperText>
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
                    ? setValue("startDate", startOfDaySP(e).toISOString())
                    : new Date().toISOString()
                }
                sx={{ width: 1 }}
                label="Início"
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    error:
                      !!errors.startDate ||
                      periodConflictingVacations.length > 0,
                  },
                }}
              />
              {(errors.startDate || periodConflictingVacations.length > 0) && (
                <FormHelperText>
                  {errors.startDate?.message ?? getPeriodConflictMessage()}
                </FormHelperText>
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
                  disabled={isReschedule}
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
                disabled={isReschedule}
              >
                <MenuItem value={"-"}>
                  <em>Selecione quem aprova</em>
                </MenuItem>
                {bosses?.map((boss) => (
                  <MenuItem
                    key={`opt-${boss._id as string}`}
                    value={boss._id as string}
                  >
                    {capitalizeName(boss.worker?.name)}
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
          disabled={
            !isValid ||
            isSubmitting ||
            (blockedByDayOffsCount && type === "dayOff") ||
            periodConflictingVacations.length > 0
          }
          sx={{ width: 1 }}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Grid>
    </Grid>
  );
}
