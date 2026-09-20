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
  // Estado único e compartilhado entre as duas colunas: expandir um item
  // colapsa automaticamente qualquer outro, em qualquer coluna.
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const half = Math.ceil(departments.length / 2);
  const columns = [departments.slice(0, half), departments.slice(half)];

  return (
    <Grid container spacing={2}>
      {columns.map((column, columnIndex) => (
        <Grid size={{ xs: 6, md: 12 }} key={columnIndex}>
          <Stack spacing={1}>
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
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      variant="outlined"
      sx={{ "&:before": { display: "none" } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: "100%", pr: 1 }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {name}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                variant="outlined"
                label={`${totalVehicles} veículos`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${invoices.length} NF's`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${totalKmHrs.toFixed(2)} km's rodados`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${totalFuelings} abastecimentos`}
              />
            </Stack>
          </Box>
          <Stack alignItems="flex-end">
            <Typography variant="body2" fontWeight={600}>
              {toMonetary(totalValue ?? 0)}
            </Typography>
            {Object.keys(totalFuels).map((key) => (
              <Typography key={key}>
                {capitalizeFirstLetter(key)}:{" "}
                {toMonetary(totalFuels[key].value)}(
                {totalFuels[key].liters.toFixed(3)})
              </Typography>
            ))}
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        <Divider sx={{ mb: 1.5 }} />

        <Typography variant="caption" color="text.secondary" gutterBottom>
          Veículos
        </Typography>
        <List dense disablePadding sx={{ mb: 1.5 }}>
          {vehicles.map((vehicle, index) => {
            return (
              <ListItem key={index} disableGutters sx={{ py: 0.25 }}>
                <ListItemText
                  primary={vehicle.prefix ?? `Veículo ${index + 1}`}
                  secondary={`Litros: ${vehicle.totals.totalLiters?.toFixed(3)}`}
                  slotProps={{
                    primary: { variant: "body2" },
                    secondary: { variant: "caption" },
                  }}
                />
                {vehicle.totals.totalValue != null && (
                  <Typography variant="caption">
                    {toMonetary(vehicle.totals.totalValue)}
                  </Typography>
                )}
              </ListItem>
            );
          })}
        </List>

        <Typography variant="caption" color="text.secondary" gutterBottom>
          Notas fiscais
        </Typography>
        {invoices.map((invoice) => (
          <Typography
            key={`dept-${(invoice.department as DepartmentDTO)._id}-invoice-${invoice.number}`}
            variant="body2"
          >
            - {invoice.number}
          </Typography>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
