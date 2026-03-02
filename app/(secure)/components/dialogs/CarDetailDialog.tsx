"use client";

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Fade,
} from "@mui/material";
import {
  Close,
  LocalGasStation,
  Tag,
  CalendarMonth,
  LocalDrink,
  Speed,
  WaterDrop,
} from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FuelingData } from "@/lib/repository/weeklyFuellingSummary/types";
import { capitalizeName } from "@/app/utils";
import { sortCarFuelings } from "../../materialRequisition/utils";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import type { DialogOptions } from "@/context/types";

const FadeTransition = forwardRef(function FadeTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

const FuelingRow = ({
  fueling,
  index,
}: {
  fueling: FuelingData;
  index: number;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      px: 2.5,
      py: 1.75,
      borderRadius: 2,
      transition: "background 0.15s ease",
      "&:hover": {
        bgcolor: "action.hover",
      },
    }}
  >
    {/* Index badge */}
    <Box
      sx={{
        minWidth: 32,
        height: 32,
        borderRadius: "50%",
        bgcolor: "primary.main",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 12,
        flexShrink: 0,
      }}
    >
      {index + 1}
    </Box>

    {/* Date */}
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 110 }}
    >
      <CalendarMonth sx={{ fontSize: 15, color: "text.secondary" }} />
      <Typography variant="body2" fontWeight={500}>
        {format(new Date(fueling.date), "dd/MM/yyyy", { locale: ptBR })}
      </Typography>
    </Box>

    <Divider orientation="vertical" flexItem />

    {/* Quantity */}
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 90 }}
    >
      <WaterDrop sx={{ fontSize: 15, color: "secondary.main" }} />
      <Typography variant="body2">
        <strong>{fueling.quantity.toFixed(3)}</strong>
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ ml: 0.4 }}
        >
          L
        </Typography>
      </Typography>
    </Box>

    <Divider orientation="vertical" flexItem />

    {/* KmHr */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flex: 1 }}>
      <Speed sx={{ fontSize: 15, color: "text.secondary" }} />
      {fueling.kmHr != null ? (
        <Typography variant="body2">
          <strong>{fueling.kmHr.toFixed(0)}</strong>
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ ml: 0.4 }}
          >
            km/h
          </Typography>
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled" fontStyle="italic">
          —
        </Typography>
      )}
    </Box>
  </Box>
);

export const CarDetailDialog = ({
  car,
  openState,
  onClose,
  title,
}: DialogOptions) => {
  if (!car) return null;

  const sorted = sortCarFuelings(car.fuelings ?? []);
  const totalQuantity = sorted.reduce((acc, f) => acc + f.quantity, 0);

  return (
    <Dialog
      open={openState ?? false}
      onClose={onClose}
      slots={{ transition: FadeTransition }}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          px: 3,
          pt: 3,
          pb: 2.5,
          position: "relative",
          borderRadius: 3,
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "rgba(255,255,255,0.8)",
            "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.15)" },
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        {/* Prefix badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: "rgba(255,255,255,0.18)",
            borderRadius: 1,
            px: 1,
            py: 0.25,
            mb: 1,
          }}
        >
          <Tag sx={{ fontSize: 13 }} />
          <Typography variant="caption" fontWeight={700}>
            {title ?? car.prefix}
          </Typography>
        </Box>

        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {capitalizeName(car.vehicle)}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
          <Chip
            icon={
              <LocalGasStation
                sx={{ fontSize: 14, color: "white !important" }}
              />
            }
            label={capitalizeName(car.fuel)}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              color: "white",
              fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          <Chip
            icon={
              <LocalDrink sx={{ fontSize: 14, color: "white !important" }} />
            }
            label={`${totalQuantity.toFixed(3)} L total`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              color: "white",
              fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </Box>
      </Box>

      {/* Section title */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={700}
          letterSpacing={1.2}
        >
          Abastecimentos ({sorted.length})
        </Typography>
      </Box>

      {/* Fuelings list */}
      <DialogContent
        sx={{
          px: 1.5,
          pt: 0.5,
          pb: 2,
          maxHeight: 380,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          // Custom scrollbar
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 3,
          },
        }}
      >
        {sorted.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.disabled" fontStyle="italic">
              Nenhum abastecimento registrado.
            </Typography>
          </Box>
        ) : (
          sorted.map((fueling, i) => (
            <FuelingRow key={i} fueling={fueling} index={i} />
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};
