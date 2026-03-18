"use client";

import {
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Autocomplete,
  Box,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  type SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "@/context/RouterContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useDialog } from "@/context/DialogContext";
import { CombinedFuelValidator } from "../validator";
import type { CombinedFuelFormData, FuelFormProps } from "../types";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { prepareDefaults } from "../utils";

export function FuelForm({ defaultValues, fuels }: FuelFormProps) {
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { redirectWithLoading, nextRouter } = useRouter();
  const { openConfirmationDialog, openInputDialog } = useDialog();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CombinedFuelFormData>({
    resolver: zodResolver(CombinedFuelValidator),
    mode: "onTouched",
    defaultValues: defaultValues ? prepareDefaults(defaultValues) : {
      name: "",
      unit: "L",
      price: 0,
      version: 1,
    },
  });

  const watchedName = useWatch({ control, name: "name" });
  const watchedPrice = useWatch({ control, name: "price" });

  const selectedFuel = fuels.find(
    (f) => f.name.toLowerCase() === watchedName?.toLowerCase(),
  );

  const existingVersions = (selectedFuel?.priceVersions ??
    []) as FuelPriceVersionDTO[];

  const duplicateVersion = existingVersions.find(
    (v) => Number(v.price) === Number(watchedPrice) && watchedPrice > 0,
  );

  const nextVersion =
    existingVersions.length > 0
      ? Math.max(...existingVersions.map((v) => v.version)) + 1
      : 1;

  const isNewFuel = watchedName && !selectedFuel;
  const isSubmitDisabled = false;

  const handleRename = () => {
    if (!selectedFuel) return;

    openInputDialog({
      title: `Renomear "${selectedFuel.name}"`,
      description: "Insira o novo nome do combustível. Mínimo 3 caracteres.",
      inputLabel: "Novo nome",
      confirmLabel: "Renomear",
      cancelLabel: "Cancelar",
      onConfirm: async (newName?: string) => {
        const trimmed = newName?.trim() ?? "";
        if (trimmed.length < 3) {
          addSnack({
            message: "Nome deve ter ao menos 3 caracteres.",
            severity: "warning",
          });
          return;
        }

        setLoading(true);

        try {
          const res = await fetch(`/api/fuel/${selectedFuel._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed, unit: "L" }),
          });

          if (!res.ok) {
            throw new Error("Erro ao renomear combustível");
            return;
          }

          addSnack({
            message: `Renomeado para "${trimmed}" com sucesso!`,
            severity: "success",
          });
          setValue("name", trimmed);

          redirectWithLoading("/fuel");
        } catch (error) {
          addSnack({
            message:
              error instanceof Error ? error.message : "Erro ao renomear",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const doSubmit = async (formData: CombinedFuelFormData) => {
    setLoading(true);
    try {
      let fuelId = selectedFuel?._id;

      if (!fuelId) {
        const fuelRes = await fetch("/api/fuel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name, unit: formData.unit }),
        });
        if (!fuelRes.ok) throw new Error("Erro ao criar base do combustível");
        const newFuel = await fuelRes.json();
        fuelId = newFuel._id;
      }

      const versionRes = await fetch("/api/fuelPriceVersion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fuel: fuelId,
          price: formData.price,
          version: formData.version,
        }),
      });

      if (!versionRes.ok) throw new Error("Erro ao criar versão de preço");

      addSnack({
        message: `${formData.name} atualizado com sucesso!`,
        severity: "success",
      });
      redirectWithLoading("/fuel");
    } catch (error) {
      addSnack({
        message: error instanceof Error ? error.message : "Erro na operação",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CombinedFuelFormData> = (formData) => {
    const label = isNewFuel
      ? `Criar "${formData.name}" com preço R$ ${formData.price.toFixed(2)}`
      : `Criar versão v${nextVersion} de "${formData.name}" com preço R$ ${formData.price.toFixed(2)}`;

    openConfirmationDialog({
      title: isNewFuel ? "Novo combustível" : `Nova versão — v${nextVersion}`,
      description: label,
      confirmLabel: "Confirmar",
      cancelLabel: "Cancelar",
      onConfirm: () => doSubmit(formData),
    });
  };

  return (
    <Grid
      container
      spacing={3}
      component="form"
      onSubmit={handleSubmit(onSubmit, (errors) =>
        console.warn(`FORM ERRORS: ${JSON.stringify(errors, null, 2)}`),
      )}
    >
      <Grid size={12}>
        <Typography variant="h6">Gestão de Combustíveis e Preços</Typography>
        <Typography variant="body2" color="text.secondary">
          Cadastre novos itens ou atualize o preço de itens existentes gerando
          novas versões.
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Autocomplete
                freeSolo
                fullWidth
                options={Array.from(new Set(fuels.map((f) => f.name)))}
                value={value ?? ""} // ← fix: nunca undefined
                onInputChange={(_, newValue) => onChange(newValue ?? "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    {...field}
                    label="Nome do Combustível"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            )}
          />
          {selectedFuel && (
            <Tooltip title="Renomear combustível">
              <IconButton onClick={handleRename} sx={{ mt: 1 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 2 }}>
        <Controller
          name="version"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={nextVersion}
              fullWidth
              disabled
              label="v."
              variant="filled"
              slotProps={{ input: { readOnly: true } }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 2 }}>
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              disabled
              label="Unidade"
              error={!!errors.unit}
              helperText={errors.unit?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? 0} // ← fix: nunca undefined
              fullWidth
              type="number"
              label="Preço (R$)"
              onChange={(e) => field.onChange(Number(e.target.value))}
              error={!!errors.price || !!duplicateVersion}
              helperText={
                duplicateVersion
                  ? `Este preço já existe na v${duplicateVersion.version}. Insira um valor diferente para criar uma nova versão.`
                  : selectedFuel && !duplicateVersion && watchedPrice > 0
                    ? `Será criada a versão v${nextVersion} para ${selectedFuel.name}.`
                    : errors.price?.message
              }
              slotProps={{ htmlInput: { step: "0.01" } }}
            />
          )}
        />
      </Grid>

      {selectedFuel && existingVersions.length > 0 && (
        <Grid size={12}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Versões existentes — <strong>{selectedFuel.name}</strong>
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {[...existingVersions]
                .sort((a, b) => b.version - a.version)
                .map((v) => {
                  const isActive =
                    Number(watchedPrice) === Number(v.price) &&
                    watchedPrice > 0;
                  return (
                    <Chip
                      key={v._id?.toString()}
                      label={`v${v.version} — R$ ${Number(v.price).toFixed(2)}`}
                      color={isActive ? "error" : "default"}
                      variant={isActive ? "filled" : "outlined"}
                      size="small"
                    />
                  );
                })}
            </Box>
            {!duplicateVersion && watchedPrice > 0 && (
              <Alert severity="info" sx={{ mt: 2 }} icon={false}>
                O preço R$ {Number(watchedPrice).toFixed(2)} é novo —{" "}
                <strong>v{nextVersion}</strong> será criada para{" "}
                {selectedFuel.name}.
              </Alert>
            )}
          </Box>
        </Grid>
      )}

      <Grid
        size={12}
        sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
      >
        <Button variant="outlined" onClick={() => nextRouter.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
          {isSubmitting ? "Processando..." : "Salvar Alterações"}
        </Button>
      </Grid>

      {process.env.NODE_ENV === "development" && (
        <pre style={{ fontSize: 11 }}>
          {JSON.stringify({ values: watch(), errors, isValid }, null, 2)}
        </pre>
      )}
    </Grid>
  );
}
