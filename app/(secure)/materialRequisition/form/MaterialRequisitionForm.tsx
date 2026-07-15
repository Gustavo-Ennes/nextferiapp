"use client";

import {
  Box,
  Button,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { prepareSummaryPayload, removeAllVechiles } from "../utils";
import { Tab as MaterialRequisitionTab } from "../components/form/Tab";
import { TabPanel } from "../components/form/TabPanel";
import { Close } from "@mui/icons-material";
import { head, isEmpty, pluck, sum } from "ramda";
import { TitleTypography } from "../../components/TitleTypography";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { deleteWeeklySummary } from "../../utils";
import type {
  WeeklyFuellingSummaryDepartment,
  WeeklyFuellingSummaryDTO,
} from "@/dto/WeeklyFuellingSummaryDTO";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { MaterialRequisitionHeader } from "../components/form/MaterialRequisitionHeader";
import { useDialog } from "@/context/DialogContext";
import type { DepartmentDTO } from "@/dto";
import { capitalizeFirstLetter } from "@/app/utils";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { MaterialRequisitionFormProps } from "../types";

export const MaterialRequisitionForm = ({
  summary: initialSummary,
  fuels,
  departments,
}: MaterialRequisitionFormProps) => {
  const { setSelectedDepartment, setSelectedCar, selectedDepartment } =
    useMaterialRequisitionForm();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { openConfirmationDialog, openSelectDialog } = useDialog();
  const { setPdf } = usePdfPreview();
  const [summary, setSummary] = useState(initialSummary);

  const weeklyTotalValue = useMemo(() => {
    if (!summary) return 0;

    return sum(pluck("totalValue", summary.departments));
  }, [summary]);

  const getDepartmentTotalValue = (departmentId: string) => {
    const department = summary?.departments.find(
      (dept) => (dept.department as DepartmentDTO)._id === departmentId,
    );
    return department ? department.totalValue : 0;
  };

  useEffect(() => {
    setSelectedCar(null);
  }, [selectedDepartment]);

  useEffect(() => {
    if (summary.departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(summary.departments[0]);
    }
  }, []);

  const createOrUpdateApiCall = async (summary: WeeklyFuellingSummaryDTO) => {
    setLoading(true);

    const payload = prepareSummaryPayload(summary);

    fetch(`/api/weeklyFuelingSummary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Erro ao criar nova aba");
        }

        if (res?.body) {
          const { data } = await res.json();
          setSummary(data as WeeklyFuellingSummaryDTO);
        }

        addSnack({
          message: `Nova aba criada com sucesso!`,
          severity: "success",
        });
      })
      .catch((error) => {
        addSnack({
          message:
            error instanceof Error ? error.message : "Erro ao criar nova aba",
          severity: "error",
        });
      })
      .finally(() => {
        setLoading(false);
        setSelectedCar(null);
        setPdf({
          items: [{ data: summary, type: "materialRequisition" }],
          open: false,
        });
      });
  };

  const createTab = async (departmentId: string) => {
    setLoading(true);

    const department = departments.find((dept) => dept._id === departmentId);

    if (!department) {
      console.warn("Selected department not found.");
      setLoading(false);
      return;
    }
    const newSummaryDepartment: WeeklyFuellingSummaryDepartment = {
      department,
      totalValue: 0,
      vehicles: [],
      name: capitalizeFirstLetter(department.name),
    };

    const newDepartments = [
      ...(summary.departments ?? []),
      newSummaryDepartment,
    ];

    const summaryPayload = { ...summary, departments: newDepartments };

    createOrUpdateApiCall(summaryPayload).then(() => {
      setSelectedDepartment(newSummaryDepartment);
    });
  };

  const onTabsDataChange = async (
    modifiedDepartment: WeeklyFuellingSummaryDepartment,
  ) => {
    if (!modifiedDepartment) {
      console.warn("Provide a summary department to update.");
      return;
    }

    const departmentId = (modifiedDepartment.department as DepartmentDTO)._id;
    const anotherDepartments = summary.departments.filter(
      ({ department }) => (department as DepartmentDTO)._id !== departmentId,
    );

    const summaryPayload = {
      ...summary,
      departments: [...anotherDepartments, modifiedDepartment],
    };

    createOrUpdateApiCall(summaryPayload).then(() => {
      setSelectedDepartment(
        modifiedDepartment?.vehicles.length > 0
          ? modifiedDepartment
          : (summary.departments[0] ?? null),
      );
    });
  };

  const onTabClose = async (
    summaryDepartment: WeeklyFuellingSummaryDepartment,
  ) => {
    // removing car entries to remove tab
    const summaryWithoutVehicles = removeAllVechiles(summaryDepartment);
    setSelectedDepartment(head(summary.departments) ?? null);
    onTabsDataChange(summaryWithoutVehicles);
  };

  const handleDeleteWeeklySummary = async () => {
    if (summary) {
      deleteWeeklySummary(summary._id)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Erro ao deletar resumo semanal");
          }

          addSnack({
            message: "Resumo semanal deletado com sucesso!",
            severity: "success",
          });
        })
        .catch((error) => {
          addSnack({
            message:
              error instanceof Error
                ? error.message
                : "Erro ao deletar resumo semanal",
            severity: "error",
          });
        })
        .finally(() => {
          setLoading(false);
          setSelectedCar(null);
        });
    }
  };

  const openResetDialog = () => {
    openConfirmationDialog({
      title: "Começar tudo novamente?",
      description:
        "Ao confirmar, você apagará todas as abas e seu conteúdo. Quer prosseguir?",
      onConfirmAction: () => {
        handleDeleteWeeklySummary();
      },
    });
  };

  const openCloseTabDialog = (
    summaryDepartment: WeeklyFuellingSummaryDepartment,
  ) => {
    openConfirmationDialog({
      title: "Excluir aba?",
      description:
        "Ao confirmar, todas os carros e abastecimentos dessa aba serão perdidos. Quer prosseguir?",
      onConfirmAction: () => onTabClose(summaryDepartment),
    });
  };

  const availableDepartments = useMemo(() => {
    return departments
      .filter(
        (dept) =>
          !summary.departments.some(
            (sd) => (sd.department as DepartmentDTO)._id === dept._id,
          ),
      )
      .map((d) => ({ ...d, name: capitalizeFirstLetter(d.name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [departments, summary]);

  const openNewTabDialog = () => {
    openSelectDialog({
      title: "Selecione o departamento",
      options: availableDepartments.map((dept) => ({
        label: dept.name,
        value: dept._id,
      })),
      onConfirmAction: (selectedDepartmentId) => {
        const selectedDepartment = departments.find(
          (dept) => dept._id === selectedDepartmentId,
        );
        if (selectedDepartment) {
          createTab(selectedDepartment._id);
        }
      },
    });
  };

  const TabCloseIcon = ({
    summaryDepartment,
  }: {
    summaryDepartment: WeeklyFuellingSummaryDepartment;
  }) => (
    <Tooltip title="Fechar a aba">
      <Close
        sx={{ fontSize: 12, zIndex: 2000 }}
        onClick={() => openCloseTabDialog(summaryDepartment)}
      />
    </Tooltip>
  );

  return (
    <Grid
      container
      component={Box}
      spacing={1}
      sx={{
        flexGrow: 1,
        display: "flex",
      }}
    >
      <Grid size={12}>
        <TitleTypography>
          Requisições de materiais - combustível
        </TitleTypography>
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: 1, mb: 1, mx: 4 }}>
          <Grid size={12} container alignItems="center">
            <Grid size={6}>
              <Typography variant="h6" color="text.secondary">
                Total da semana R$ {weeklyTotalValue.toFixed(2)}
              </Typography>
            </Grid>
            {selectedDepartment && (
              <Grid size={6} justifyContent="flex-end">
                <Typography variant="h6" color="text.secondary" align="right">
                  Total para{" "}
                  {capitalizeFirstLetter(
                    (selectedDepartment?.department as DepartmentDTO)?.name,
                  )}{" "}
                  R${" "}
                  {getDepartmentTotalValue(
                    (selectedDepartment?.department as DepartmentDTO)?._id,
                  ).toFixed(2)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>

      <Grid size={12} container justifyContent="center" alignItems="center">
        <MaterialRequisitionHeader summary={summary} />
      </Grid>

      <Grid size={2} justifyContent="center" alignItems="center" px={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={openNewTabDialog}
          sx={{ width: 1, padding: 1, m: 1 }}
          disabled={availableDepartments.length === 0}
        >
          Adicionar
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          disabled={!summary.departments.length}
          onClick={openResetDialog}
          sx={{ width: 1, padding: 1, m: 1 }}
        >
          Resetar
        </Button>

        <Tabs
          value={
            (selectedDepartment?.department as DepartmentDTO)?._id || false
          }
          onChange={(_, newDepartmentId: string) => {
            const newSelectedDepartment = summary.departments.find(
              (dept) =>
                (dept.department as DepartmentDTO)._id === newDepartmentId,
            );
            setSelectedDepartment(newSelectedDepartment ?? null);
            setSelectedCar(null);
          }}
          variant="scrollable"
          scrollButtons="auto"
          orientation="vertical"
          sx={{ mb: 2, m: "auto", mt: 1 }}
        >
          {summary.departments.map((summaryDepartment, idx) => (
            <Tab
              key={(summaryDepartment.department as DepartmentDTO)._id}
              value={(summaryDepartment.department as DepartmentDTO)._id}
              label={
                capitalizeFirstLetter(
                  (summaryDepartment.department as DepartmentDTO)?.name,
                ) ?? `Departamento ${idx + 1}`
              }
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{ fontSize: 12, zIndex: 1 }}
              icon={<TabCloseIcon summaryDepartment={summaryDepartment} />}
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Grid>

      <Grid size={10}>
        {!isEmpty(summary.departments) ? (
          summary.departments.map((summaryDepartment) => (
            <TabPanel
              key={`materialRequisitionTab-${(summaryDepartment.department as DepartmentDTO)._id}`}
              value={(selectedDepartment?.department as DepartmentDTO)?._id}
              index={(summaryDepartment.department as DepartmentDTO)._id}
            >
              <MaterialRequisitionTab
                fuels={fuels}
                summaryDepartment={summaryDepartment}
                onDataChangeAction={onTabsDataChange}
              />
            </TabPanel>
          ))
        ) : (
          <Typography sx={{ p: 2 }}>
            Adicione uma aba para requisições de um departamento.
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};
