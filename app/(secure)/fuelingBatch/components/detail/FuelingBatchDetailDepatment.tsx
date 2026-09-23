// FuelingBatchDetailDepatment.tsx
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { DepartmentDTO, FuelingBatchDTODepartment } from "@/dto";
import type { DepartmentAccordionProps } from "../../types";
import { toMonetary } from "../../utils";
import { capitalizeFirstLetter } from "@/app/utils";

export function FuelingBatchDetailDepartments({
  departments,
}: {
  departments: FuelingBatchDTODepartment[];
}) {
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const half = Math.ceil(departments.length / 2);
  const columns = [departments.slice(0, half), departments.slice(half)];

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="subtitle2"
        fontWeight={700}
        color="#1E3A8A"
        sx={{ mb: 1.5 }}
      >
        Departamentos
      </Typography>

      <Grid container spacing={2}>
        {columns.map((column, columnIndex) => (
          <Grid size={{ xs: 12, sm: 6 }} key={columnIndex} sx={{ minWidth: 0 }}>
            <Stack spacing={1.5}>
              {column.map((dept) => (
                <DepartmentAccordion
                  key={dept.name}
                  department={dept}
                  expanded={expandedName === dept.name}
                  onToggle={() =>
                    setExpandedName((current) =>
                      current === dept.name ? null : dept.name,
                    )
                  }
                />
              ))}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function DepartmentAccordion({
  department: {
    name,
    invoices,
    vehicles,
    totals: {
      totalFuelings,
      totalKmHrs,
      totalValue,
      totalVehicles,
      totalFuels,
    },
  },
  expanded,
  onToggle,
}: DepartmentAccordionProps) {
  return (
    <Accordion
      component={Paper}
      variant="outlined"
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      sx={{
        borderColor: expanded ? "#2563EB" : "#E2E8F0",
        borderRadius: 2,
        overflow: "hidden",
        "&:before": { display: "none" },
        transition: "border-color 0.15s ease",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#2563EB" }} />}
        sx={{
          minWidth: 0,
          "& .MuiAccordionSummary-content": { minWidth: 0 },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
          sx={{ width: "100%", minWidth: 0 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ overflowWrap: "anywhere" }}
            >
              {name}
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              spacing={0.5}
              useFlexGap
              sx={{ mt: 0.75 }}
            >
              <Chip
                size="small"
                label={`${totalVehicles} veículos`}
                sx={chipSx}
              />
              <Chip
                size="small"
                label={`${invoices.length} NF's`}
                sx={chipSx}
              />
              <Chip
                size="small"
                label={`${totalKmHrs.toFixed(2)} km`}
                sx={chipSx}
              />
              <Chip
                size="small"
                label={`${totalFuelings} abast.`}
                sx={chipSx}
              />
            </Stack>
          </Box>

          <Stack alignItems="flex-end" sx={{ flexShrink: 0 }}>
            <Typography variant="body2" fontWeight={700} color="#2563EB">
              {toMonetary(totalValue ?? 0)}
            </Typography>
            {Object.keys(totalFuels).map((key) => (
              <Typography
                key={key}
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap" }}
              >
                {capitalizeFirstLetter(key)}:{" "}
                {toMonetary(totalFuels[key].value)}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, minWidth: 0 }}>
        <Divider sx={{ mb: 1.5 }} />

        <Typography
          variant="caption"
          color="#2563EB"
          fontWeight={600}
          gutterBottom
        >
          Veículos
        </Typography>
        <List dense disablePadding sx={{ mb: 1.5 }}>
          {vehicles.map((vehicle, index) => (
            <ListItem
              key={index}
              disableGutters
              sx={{ py: 0.25, minWidth: 0, gap: 1 }}
            >
              <ListItemText
                sx={{ minWidth: 0 }}
                primary={vehicle.prefix ?? `Veículo ${index + 1}`}
                secondary={`Litros: ${vehicle.totals.totalLiters?.toFixed(3)}`}
                slotProps={{
                  primary: { variant: "body2", noWrap: true },
                  secondary: { variant: "caption" },
                }}
              />
              {vehicle.totals.totalValue != null && (
                <Typography
                  variant="caption"
                  sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                >
                  {toMonetary(vehicle.totals.totalValue)}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>

        <Typography
          variant="caption"
          color="#2563EB"
          fontWeight={600}
          gutterBottom
        >
          Notas fiscais
        </Typography>
        <Stack spacing={0.25}>
          {invoices.map((invoice) => (
            <Typography
              key={`dept-${(invoice.department as DepartmentDTO)._id}-invoice-${invoice.number}`}
              variant="body2"
              sx={{ overflowWrap: "anywhere" }}
            >
              — {invoice.number}
            </Typography>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

const chipSx = {
  bgcolor: "#EFF6FF",
  color: "#1E3A8A",
  fontWeight: 500,
  border: "none",
};
