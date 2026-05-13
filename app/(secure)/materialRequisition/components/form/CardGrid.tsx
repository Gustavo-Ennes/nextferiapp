"use client";

import {
  Grid,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
} from "@mui/material";
import {
  Tag,
  DirectionsCar,
  LocalGasStation,
  CheckCircleOutline,
  InfoOutlined,
  Delete,
  CheckBox,
  Paid,
} from "@mui/icons-material";
import type {
  CarEntry,
  TabData,
} from "../../../../../lib/repository/weeklyFuellingSummary/types";
import { capitalizeName } from "@/app/utils";
import { useDialog } from "@/context/DialogContext";
import { type MouseEvent } from "react";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { DepartmentDTO, WeeklyFuellingSummaryDTO } from "@/dto";
import { getCarTotalValue } from "../../utils";

export const CardsGrid = ({
  tabData,
  onRemove,
  onEdit,
  weeklyFuelingSummary,
}: {
  tabData: TabData;
  onRemove: (prefix: number) => void;
  onEdit: (car: CarEntry) => void;
  weeklyFuelingSummary: WeeklyFuellingSummaryDTO | null;
}) => {
  const { selectedCar } = useMaterialRequisitionForm();
  const { openConfirmationDialog, openCarDetailDialog } = useDialog();
  const sortedCarEntries = tabData.carEntries?.sort(
    (a, b) => a.prefix - b.prefix,
  );

  const handleOpenConfirmationDialog = (car: CarEntry, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openConfirmationDialog({
      onConfirm: () => onRemove(car.prefix),
      title: `Excluir o #${car.prefix}?`,
      description: `Ao confirmar, você irá excluir ${car.vehicle} permanentemente. Deseja proceder?`,
    });
  };

  const handleOpenCarDetailDialog = (car: CarEntry, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCarDetailDialog({
      onConfirm: () => undefined,
      title: "Detalhes",
      car,
    });
  };

  const isSelected = (car: CarEntry) => selectedCar?.prefix === car.prefix;

  return (
    <Grid container spacing={2}>
      {sortedCarEntries?.map((car) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={car.prefix}>
          <Box
            sx={{
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
              cursor: "pointer",
              border: isSelected(car) ? "2px solid" : "2px solid transparent",
              borderColor: isSelected(car) ? "primary.main" : "transparent",
              transition: "all 0.2s ease",
              boxShadow: isSelected(car)
                ? "0 0 0 3px rgba(25, 118, 210, 0.15)"
                : "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
              "&:hover .card-overlay": {
                opacity: 1,
                pointerEvents: "auto",
              },
            }}
          >
            {/* Card Content */}
            <CardContent
              sx={{
                bgcolor: "background.paper",
                p: 2.5,
                pb: "16px !important",
              }}
            >
              {/* Prefix badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 1,
                  px: 1,
                  py: 0.25,
                  mb: 1.5,
                }}
              >
                {isSelected(car) && <CheckBox color="success" />}
                <Tag sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={700}>
                  {car.prefix}
                </Typography>
              </Box>

              {/* Vehicle name */}
              <Typography
                variant="subtitle1"
                fontWeight={700}
                noWrap
                sx={{ mb: 0.5, pr: 3 }}
              >
                <DirectionsCar
                  sx={{
                    fontSize: 16,
                    mr: 0.5,
                    verticalAlign: "middle",
                    color: "primary.main",
                  }}
                />
                {capitalizeName(car.vehicle)}
              </Typography>

              {/* Fuel type */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <LocalGasStation
                  sx={{ fontSize: 15, color: "secondary.main" }}
                />
                {capitalizeName((car.fuel as FuelDTO)?.name)}
              </Typography>

              {/* R$ Total */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Paid sx={{ fontSize: 15, color: "secondary.main" }} />
                R${" "}
                {getCarTotalValue(
                  car,
                  weeklyFuelingSummary,
                  (tabData.department as DepartmentDTO)._id,
                ).toFixed(2)}
              </Typography>

              {/* Fuelings count */}
              <Box sx={{ mt: 1.5 }}>
                <Chip
                  label={`${car.fuelings?.length ?? 0} abastecimento(s)`}
                  size="small"
                  variant="outlined"
                  color="default"
                  sx={{ fontSize: 11 }}
                />
              </Box>
            </CardContent>

            {/* Hover Overlay */}
            <Box
              className="card-overlay"
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(10, 20, 40, 0.72)",
                backdropFilter: "blur(2px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 0.22s ease",
                borderRadius: 2,
                zIndex: 10,
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<InfoOutlined />}
                onClick={(e) => handleOpenCarDetailDialog(car, e)}
                sx={{
                  width: 140,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "white",
                  color: "primary.dark",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                Detalhes
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckCircleOutline />}
                onClick={() => onEdit(car)}
                sx={{
                  width: 140,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                {isSelected(car) ? "Limpar seleção" : "Selecionar"}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Delete />}
                onClick={(e) => handleOpenConfirmationDialog(car, e)}
                sx={{
                  width: 140,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#FF8888",
                  "&:hover": { bgcolor: "#FF5555" },
                }}
              >
                Excluir
              </Button>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
