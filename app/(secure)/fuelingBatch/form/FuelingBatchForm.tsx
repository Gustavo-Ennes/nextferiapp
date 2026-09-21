"use client";

import {
  Box,
  Button,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  fuelingValuesMatchInvoiceValues,
  getEmptyFuelingBatch,
  getInvoicesTotalFuels,
  hasFuelings,
} from "../utils";
import { Tab as FuelingBatchTab } from "../components/form/Tab";
import { TabPanel } from "../components/form/TabPanel";
import { Close, DoneAll } from "@mui/icons-material";
import { isEmpty } from "ramda";
import { TitleTypography } from "../../components/TitleTypography";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import {
  createFuelingBatch,
  deleteFuelingBatch,
  updateFuelingBatch,
} from "../../utils";
import { useFuelingBatchForm } from "@/context/FuelingBatchFormContext";
import { useDialog } from "@/context/DialogContext";
import type {
  DepartmentDTO,
  FuelingBatchDTO,
  FuelingBatchDTODepartment,
} from "@/dto";
import { capitalizeFirstLetter } from "@/app/utils";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { FuelingBatchFormProps, OnTabsDataChangeParam } from "../types";
import { useRouter } from "@/context/RouterContext";
import { toMonetary } from "../utils";
import { FuelingBatchHeader } from "../components/form/FuelingBatchHeader";
import { format, toDate } from "date-fns";
import { getFuelInventory } from "@/lib/repository/fuelingBatch/utils";

export const FuelingBatchForm = ({
  fuelingBatch: loadedFuelingBatch,
  fuels,
  departments,
  purchaseOrders,
}: FuelingBatchFormProps) => {
  const { setSelectedDepartment, setSelectedCar, selectedDepartment } =
    useFuelingBatchForm();
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { openConfirmationDialog, openSelectDialog } = useDialog();
  const { setPdf } = usePdfPreview();
  const [fuelingBatch, setFuelingBatch] = useState<FuelingBatchDTO>(
    loadedFuelingBatch ?? getEmptyFuelingBatch(),
  );
  const { redirectWithLoading } = useRouter();

  useEffect(() => {
    setSelectedCar(null);
  }, [selectedDepartment]);

  useEffect(() => {
    if (
      fuelingBatch &&
      fuelingBatch.departments.length > 0 &&
      !selectedDepartment
    ) {
      setSelectedDepartment(fuelingBatch?.departments[0]);
    }
  }, []);

  const fuelingBatchInvoices = useMemo(
    () =>
      fuelingBatch.departments
        ? fuelingBatch.departments.flatMap((f) => f.invoices)
        : [],
    [fuelingBatch.departments],
  );

  const fuelingBatchFuelInventory = useMemo(
    () =>
      getFuelInventory({
        departmentTotalFuels: fuelingBatch.totals.totalFuels,
        invoiceTotalFuels: getInvoicesTotalFuels(fuelingBatchInvoices, fuels),
      }),
    [fuelingBatch.totals],
  );

  const createOrUpdateApiCall = async (
    rawFuelingBatch: Partial<FuelingBatchDTO>,
  ) => {
    setLoading(true);

    let returnedFuelingBatch: FuelingBatchDTO | null = null;
    const isFuelingBatchDraft =
      !rawFuelingBatch._id && !hasFuelings(rawFuelingBatch as FuelingBatchDTO);

    if (isFuelingBatchDraft) {
      setFuelingBatch(rawFuelingBatch as FuelingBatchDTO);
      setLoading(false);
      return;
    }

    let action = "";

    try {
      if (!rawFuelingBatch._id) {
        action = "criação";
        returnedFuelingBatch = await createFuelingBatch(
          rawFuelingBatch as Omit<
            FuelingBatchDTO,
            "_id" | "createdAt" | "updatedAt"
          >,
        );

        redirectWithLoading(
          `/fuelingBatch/form?id=${returnedFuelingBatch._id}`,
        );

        addSnack({
          message: `Novo lote criado com sucesso!`,
          severity: "success",
        });
      } else {
        action = "atualização";
        returnedFuelingBatch = await updateFuelingBatch(
          rawFuelingBatch as FuelingBatchDTO,
        );

        addSnack({
          message: `Novo lote atualizado com sucesso!`,
          severity: "success",
        });
      }

      setFuelingBatch(returnedFuelingBatch);
    } catch (error) {
      addSnack({
        message: `Houve um erro com a ${action}, veja os logs para mais detalhes.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setSelectedCar(null);

      if (returnedFuelingBatch) {
        setPdf({
          items: [{ data: returnedFuelingBatch, type: "fuelingBatch" }],
          open: false,
        });
      }
    }
  };

  const createTab = async (departmentId: string) => {
    setLoading(true);

    if (!fuelingBatch) {
      addSnack({
        message: "Nenhum lote de abastecimentos encontrado.",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    const department = departments.find((dept) => dept._id === departmentId);

    if (!department) {
      console.warn("Selected department not found.");
      setLoading(false);
      return;
    }
    const newFuelingBatchDepartment: FuelingBatchDTODepartment = {
      department,
      totals: {
        totalValue: 0,
        totalFuels: {},
        totalFuelings: 0,
        totalKmHrs: 0,
        totalVehicles: 0,
      },
      vehicles: [],
      invoices: [],
      name: capitalizeFirstLetter(department.name),
    };

    const newDepartments = [
      ...(fuelingBatch?.departments ?? []),
      newFuelingBatchDepartment,
    ];

    const fuelingBatchPayload = {
      ...fuelingBatch,
      departments: newDepartments,
    };

    createOrUpdateApiCall(fuelingBatchPayload).then(() => {
      setSelectedDepartment(newFuelingBatchDepartment);
    });
  };

  const onTabsDataChange = async ({
    modifiedDepartment,
    remove,
  }: OnTabsDataChangeParam) => {
    if (!fuelingBatch) {
      return;
    }

    if (!modifiedDepartment) {
      console.warn("Provide a fueling batch department to update.");
      return;
    }

    const departmentId = (modifiedDepartment.department as DepartmentDTO)._id;
    const anotherDepartments = fuelingBatch.departments.filter(
      ({ department }) => (department as DepartmentDTO)._id !== departmentId,
    );

    const fuelingBatchPayload = {
      ...fuelingBatch,
      departments: [...anotherDepartments],
    };

    if (!remove) fuelingBatchPayload.departments!.push(modifiedDepartment);

    setSelectedDepartment(
      remove
        ? (fuelingBatchPayload.departments![0] ?? null)
        : modifiedDepartment,
    );

    await createOrUpdateApiCall(fuelingBatchPayload);
  };

  const onTabClose = async (
    fuelingBatchDepartment: FuelingBatchDTODepartment,
  ) => {
    onTabsDataChange({
      modifiedDepartment: fuelingBatchDepartment,
      remove: true,
    });
  };

  const handleDeleteFuelingBatch = async () => {
    if (fuelingBatch && fuelingBatch._id) {
      deleteFuelingBatch(fuelingBatch._id)
        .then((success: boolean) => {
          if (!success) {
            throw new Error("Erro ao deletar lote de abastecimentos");
          }

          addSnack({
            message: "Lote de abastecimentos deletado com sucesso!",
            severity: "success",
          });

          redirectWithLoading("/fuelingBatch/form");
        })
        .catch((error: any) => {
          addSnack({
            message:
              error instanceof Error
                ? error.message
                : "Erro ao deletar lote de abastecimentos",
            severity: "error",
          });
        })
        .finally(() => {
          setLoading(false);
          setSelectedCar(null);
          setSelectedDepartment(null);
        });
    } else if (fuelingBatch && !fuelingBatch._id) {
      addSnack({
        message: "Rascunho de lote de abastecimentos deletado com sucesso .",
        severity: "success",
      });

      redirectWithLoading("/fuelingBatch/form");
    }
  };

  const handleSaveAndClose = async () => {
    if (fuelingBatch && fuelingBatch._id) {
      createOrUpdateApiCall(fuelingBatch)
        .then(() => {
          addSnack({
            message: "Lote de abastecimentos salvo com sucesso!",
            severity: "success",
          });
        })
        .catch((error) => {
          addSnack({
            message:
              error instanceof Error
                ? error.message
                : "Erro ao salvar o lote de abastecimentos",
            severity: "error",
          });
        })
        .finally(() => {
          setLoading(false);
          setSelectedCar(null);
          redirectWithLoading("/fuelingBatch");
        });
    } else if (fuelingBatch && !fuelingBatch._id) {
      addSnack({
        message: "Crie algum abastecimento antes de salvar o lote.",
        severity: "success",
      });
    }
  };

  const openResetDialog = () => {
    const {
      totals: { totalFuelings, totalVehicles },
      departments,
    } = fuelingBatch;
    openConfirmationDialog({
      title: "Começar tudo novamente?",
      description: `Ao confirmar, você apagará ${totalVehicles} requisições de materiais, ${totalFuelings} abastecimentos de ${departments.length} departamentos. Quer prosseguir?`,
      onConfirmAction: () => {
        handleDeleteFuelingBatch();
      },
    });
  };

  const openSaveAndCloseDialog = () => {
    openConfirmationDialog({
      title: "Salvar e fechar?",
      description:
        "Ao confirmar, você salvará todas as abas e seu conteúdo e fechará o resumo. Quer prosseguir?",
      onConfirmAction: () => {
        handleSaveAndClose();
      },
    });
  };

  const openCloseTabDialog = (
    fuelingBatchDepartment: FuelingBatchDTODepartment,
  ) => {
    const {
      totals: { totalFuelings, totalVehicles, totalValue },
      name,
    } = fuelingBatchDepartment;
    const formatedName = capitalizeFirstLetter(name);
    openConfirmationDialog({
      title: `Excluir ${formatedName}?`,
      description: `Ao confirmar, você apagará ${totalFuelings} requisições de materiais, ${totalVehicles} abastecimentos, somando ${toMonetary(totalValue)}. Quer prosseguir?`,
      onConfirmAction: () => onTabClose(fuelingBatchDepartment),
    });
  };

  const availableDepartments = useMemo(() => {
    return departments
      .filter(
        (dept) =>
          !fuelingBatch?.departments.some(
            (sd) => (sd.department as DepartmentDTO)._id === dept._id,
          ),
      )
      .map((d) => ({ ...d, name: capitalizeFirstLetter(d.name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [departments, fuelingBatch]);

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
    department,
  }: {
    department: FuelingBatchDTODepartment;
  }) => (
    <Tooltip title="Fechar a aba">
      <Close
        sx={{ fontSize: 12, zIndex: 2000 }}
        onClick={() => openCloseTabDialog(department)}
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
          LOTE DE ABASTECIMENTO{" "}
          {fuelingBatch.departments.length > 0 &&
          fuelingValuesMatchInvoiceValues(fuelingBatchFuelInventory.totals) ? (
            <DoneAll fontSize="inherit" color="success" />
          ) : (
            ""
          )}
        </TitleTypography>
        <small style={{ textAlign: "right", width: "100%", display: "block" }}>
          Criado em: {format(toDate(fuelingBatch.createdAt), "dd/MM/yy")}
          {" - "}
          {fuelingBatch.updatedAt
            ? `atualizado em: ${format(toDate(fuelingBatch.updatedAt), "dd/MM/yy")}`
            : ""}
        </small>
      </Grid>

      <Grid size={12} container justifyContent="center" alignItems="center">
        <FuelingBatchHeader fuelingBatch={fuelingBatch} fuels={fuels} />
      </Grid>

      <Grid size={2} justifyContent="center" alignItems="center" px={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={openNewTabDialog}
          sx={{ width: 1, padding: 1, m: 1 }}
          disabled={availableDepartments.length === 0}
        >
          Adicionar aba
        </Button>

        <Button
          variant="outlined"
          size="small"
          color="primary"
          disabled={!fuelingBatch}
          onClick={openSaveAndCloseDialog}
          sx={{ width: 1, padding: 1, m: 1 }}
        >
          Salvar e fechar
        </Button>

        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={openResetDialog}
          sx={{ width: 1, padding: 1, m: 1 }}
        >
          Resetar lote
        </Button>

        <Tabs
          value={
            (selectedDepartment?.department as DepartmentDTO)?._id || false
          }
          onChange={(_, newDepartmentId: string) => {
            const newSelectedDepartment = fuelingBatch?.departments.find(
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
          {fuelingBatch?.departments.map((department, idx) => (
            <Tab
              key={(department.department as DepartmentDTO)._id}
              value={(department.department as DepartmentDTO)._id}
              label={
                capitalizeFirstLetter(
                  (department.department as DepartmentDTO)?.name,
                ) ?? `Departamento ${idx + 1}`
              }
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{ fontSize: 12, zIndex: 1 }}
              icon={<TabCloseIcon department={department} />}
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Grid>

      <Grid size={10}>
        {!isEmpty(fuelingBatch?.departments) ? (
          fuelingBatch?.departments.map((department) => (
            <TabPanel
              key={`fuelingBatchTab-${(department.department as DepartmentDTO)._id}`}
              value={(selectedDepartment?.department as DepartmentDTO)?._id}
              index={(department?.department as DepartmentDTO)?._id}
            >
              <FuelingBatchTab
                fuels={fuels}
                fuelingBatchDepartment={department}
                fuelingBatchInvoices={fuelingBatchInvoices}
                purchaseOrders={purchaseOrders}
                onDataChangeAction={(
                  modifiedDepartment: FuelingBatchDTODepartment,
                ) =>
                  onTabsDataChange({
                    modifiedDepartment,
                    remove: false,
                  })
                }
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
