import type { FuelDTO } from "@/dto/FuelDTO";
import type { PurchaseOrderItemDTO } from "@/dto/PurchaseOrderDTO";
import { Grid, TextField, MenuItem, IconButton } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldArrayWithId,
  type UseFieldArrayRemove,
  type UseFormSetValue,
} from "react-hook-form";
import type { PurchaseOrderFormData } from "../types";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import { Delete } from "@mui/icons-material";

export const PurchaseOrderFormFuelFields = ({
  watchedItems,
  index,
  fuels,
  purchaseOrder,
  control,
  setValue,
  fields,
  remove,
}: {
  watchedItems: PurchaseOrderItemDTO[];
  index: number;
  fuels: FuelDTO[];
  purchaseOrder: FieldArrayWithId<PurchaseOrderFormData, "items", "id">;
  control: Control<PurchaseOrderFormData>;
  setValue: UseFormSetValue<PurchaseOrderFormData>;
  fields: FieldArrayWithId<PurchaseOrderFormData, "items", "id">[];
  remove: UseFieldArrayRemove;
}) => {
  const otherSelectedIds =
    watchedItems?.filter((_, i) => i !== index).map((i) => i.fuel) || [];

  const availableOptions = fuels.filter(
    (f) => !otherSelectedIds.includes(f._id),
  );

  const selectedFuelId = watchedItems?.[index]?.fuel;
  const selectedFuel = fuels.find((f) => f._id === selectedFuelId);
  const versions = (selectedFuel?.priceVersions ?? []) as FuelPriceVersionDTO[];

  return (
    <Grid
      container
      spacing={2}
      key={purchaseOrder.id}
      alignItems="center"
      sx={{ mb: 1 }}
    >
      <Grid size={{ xs: 6, md: 4 }}>
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
              value={field.value ?? ""}
              onChange={(e) => {
                field.onChange(e);
                const newFuel = fuels.find((f) => f._id === e.target.value);
                setValue(
                  `items.${index}.fuelPriceVersion`,
                  (newFuel?.currentPriceVersion as FuelPriceVersionDTO)?._id ??
                    "",
                );
              }}
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

      <Grid size={{ xs: 6, md: 3 }}>
        <Controller
          name={`items.${index}.fuelPriceVersion`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              select
              fullWidth
              label="Versão / Preço"
              size="small"
            >
              {versions
                .slice()
                .sort((a, b) => b.version - a.version)
                .map((v) => (
                  <MenuItem key={v._id} value={v._id}>
                    v{v.version} — R$ {Number(v.price).toFixed(2)}
                    {v._id ===
                    (selectedFuel?.currentPriceVersion as FuelPriceVersionDTO)
                      ?._id
                      ? " (atual)"
                      : ""}
                  </MenuItem>
                ))}
            </TextField>
          )}
        />
      </Grid>

      <Grid size={{ xs: 4, md: 3 }}>
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
          <Delete />
        </IconButton>
      </Grid>
    </Grid>
  );
};
