import React, { useMemo, useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

import { buildDepartmentFuelAnalyticsPayload } from "../../utils";
import type { AverageDepartmentAnalyticsCardProps } from "../../types";

export const AverageDepartmentAnalyticsCard = ({
  fuelingBatches,
  selectedDepartmentId,
  loading = false,
}: AverageDepartmentAnalyticsCardProps) => {
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(
    {},
  );

  const toggleExpand = (id: string) => {
    setExpandedDepts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const payload = useMemo(
    () =>
      buildDepartmentFuelAnalyticsPayload(fuelingBatches, selectedDepartmentId),
    [fuelingBatches, selectedDepartmentId],
  );

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando métricas...
        </Typography>
      </Paper>
    );
  }

  if (payload.totalBatchesProcessed === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 2, bgcolor: "#fafafa" }}
      >
        <Alert severity="info" sx={{ py: 0 }}>
          Nenhum lote encontrado para o período.
        </Alert>
      </Paper>
    );
  }

  const activeDepartments = payload.selectedDepartmentAnalytics
    ? [payload.selectedDepartmentAnalytics]
    : payload.departments;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, borderColor: "#E5E7EB", bgcolor: "#FFFFFF" }}
    >
      {/* Header Compacto */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AssessmentOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Consumo Médio por Intervalo ({payload.totalBatchesProcessed} lotes
            analisados)
          </Typography>
          <br/>
          <Typography variant="caption" fontWeight={700}>
            {payload.analizedPeriod?.months &&
              `${payload.analizedPeriod.months.toFixed(0)} mes(es), `}{" "}
            {payload.analizedPeriod?.weeks &&
              `${payload.analizedPeriod.weeks.toFixed(0)} semana(s), `}{" "}
            {payload.analizedPeriod?.days &&
              `${payload.analizedPeriod.days.toFixed(0)} dia(s)`}{" "}
            analisados
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 1.5 }} />

      {activeDepartments.map((dept) => {
        const isExpanded = !!expandedDepts[dept.departmentId];

        return (
          <Box
            key={dept.departmentId}
            sx={{ mb: 1.5, pb: 1.5, borderBottom: "1px solid #F3F4F6" }}
          >
            {/* Linha Resumida do Setor */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ cursor: "pointer", py: 0.5 }}
              onClick={() => toggleExpand(dept.departmentId)}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <IconButton
                  size="small"
                  sx={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.2s",
                    p: 0.5,
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="text.primary"
                >
                  {dept.departmentName}
                </Typography>
              </Box>

              <Box display="flex" gap={2} alignItems="center">
                <Box textAlign="right">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: "10px", lineHeight: 1 }}
                  >
                    MÉDIA MENSAL (R$)
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    R${" "}
                    {dept.monthly.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: "10px", lineHeight: 1 }}
                  >
                    MÉDIA MENSAL (L)
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {dept.monthly.quantity.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    L
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Conteúdo Detalhado no Collapse */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box
                mt={1.5}
                p={1.5}
                bgcolor="#FAFAFA"
                borderRadius={1.5}
                border="1px solid #F0F0F0"
              >
                <Grid container spacing={2}>
                  {/* Tabela com Médias Diária, Semanal e Mensal */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    >
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#F3F4F6" }}>
                          <TableRow>
                            <TableCell
                              sx={{
                                py: 0.5,
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Combustível
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                py: 0.5,
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Diária (R$ / L)
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                py: 0.5,
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Semanal (R$ / L)
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                py: 0.5,
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Mensal (R$ / L)
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dept.fuels.map((fuel) => (
                            <TableRow key={fuel.fuelName}>
                              <TableCell
                                sx={{
                                  py: 0.5,
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              >
                                {fuel.fuelName}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ py: 0.5, fontSize: "11px" }}
                              >
                                R$ {fuel.daily.amount.toFixed(2)} <br />
                                <span
                                  style={{ color: "#6B7280", fontSize: "10px" }}
                                >
                                  {fuel.daily.quantity.toFixed(1)} L
                                </span>
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ py: 0.5, fontSize: "11px" }}
                              >
                                R$ {fuel.weekly.amount.toFixed(2)} <br />
                                <span
                                  style={{ color: "#6B7280", fontSize: "10px" }}
                                >
                                  {fuel.weekly.quantity.toFixed(1)} L
                                </span>
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ py: 0.5, fontSize: "11px" }}
                              >
                                R$ {fuel.monthly.amount.toFixed(2)} <br />
                                <span
                                  style={{ color: "#6B7280", fontSize: "10px" }}
                                >
                                  {fuel.monthly.quantity.toFixed(1)} L
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* Legenda Lateral */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      height="100%"
                      px={1}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        gutterBottom
                      >
                        Participação por Combustível
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        {dept.fuels.map((fuel) => (
                          <Box
                            key={fuel.fuelName}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                width={6}
                                height={6}
                                borderRadius="50%"
                                bgcolor="primary.main"
                              />
                              <Typography
                                variant="caption"
                                fontWeight={600}
                                color="text.primary"
                              >
                                {fuel.fuelName}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${fuel.percentageByQuantity.toFixed(1)}%`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: "10px" }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Paper>
  );
};
