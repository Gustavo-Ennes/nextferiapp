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
import { useState, useEffect, useMemo } from "react";
import type {
  LocalStorageData,
  TabData,
} from "../../../../lib/repository/weeklyFuellingSummary/types";
import {
  getLocalStorageData,
  populateLocalStorage,
  removeAllCarEntries,
  setLocalStorageData,
  unpopulateLocalStorage,
} from "../utils";
import { Tab as MaterialRequisitionTab } from "../components/form/Tab";
import { TabPanel } from "../components/form/TabPanel";
import { Close } from "@mui/icons-material";
import {
  head,
  insert,
  isEmpty,
  isNil,
  pluck,
  reject,
  remove,
  sum,
} from "ramda";
import { TitleTypography } from "../../components/TitleTypography";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { createOrUpdateWeeklySummary, deleteWeeklySummary } from "../../utils";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { MaterialRequisitionHeader } from "../components/form/MaterialRequisitionHeader";
import { useDialog } from "@/context/DialogContext";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { DepartmentDTO } from "@/dto";

export const MaterialRequisitionForm = ({
  actualWeeklyFuelingSummary,
  fuels,
  departments,
}: {
  actualWeeklyFuelingSummary: WeeklyFuellingSummaryDTO | null;
  fuels: FuelDTO[];
  departments: DepartmentDTO[];
}) => {
  const { setSelectedTabData, setSelectedCar, selectedTabData } =
    useMaterialRequisitionForm();
  const { openConfirmationDialog, openSelectDialog } = useDialog();
  const [tabsData, setTabsData] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [weeklyFuellingSummary, setWeeklyFuellingSummary] =
    useState<WeeklyFuellingSummaryDTO | null>(actualWeeklyFuelingSummary);
  const { setPdf } = usePdfPreview();

  const weeklyTotalValue = useMemo(() => {
    if (!weeklyFuellingSummary) return 0;

    return sum(pluck("totalValue", weeklyFuellingSummary.departments));
  }, [weeklyFuellingSummary]);

  const getDepartmentTotalValue = (departmentId: string) => {
    const department = weeklyFuellingSummary?.departments.find(
      (dept) => (dept.department as DepartmentDTO)._id === departmentId,
    );
    return department ? department.totalValue : 0;
  };

  // Load
  useEffect(() => {
    getLocalStorageData()
      .then((localStorageData: LocalStorageData) => {
        const { activeTab, data } = populateLocalStorage({
          localStorageData,
          departments,
          fuels,
        });

        if (data.length > 0) {
          setTabsData(data);
          setActiveTab(activeTab);
          setSelectedTabData(data[activeTab] ?? null);
        }

        if (!weeklyFuellingSummary) {
          createOrUpdateWeeklySummary({
            payload: unpopulateLocalStorage(localStorageData),
          }).then((summary) => {
            setWeeklyFuellingSummary(summary);
          });
        }
      })
      .catch((err) => {
        console.error("Error parsing material requisition data: ", err);
      });
  }, []);

  // Persist
  useEffect(() => {
    getLocalStorageData().then((oldData: LocalStorageData) => {
      const newData = populateLocalStorage({
        localStorageData: { ...oldData, data: tabsData },
        departments,
        fuels,
      });
      setLocalStorageData({ data: newData });
      setPdf({
        items: [{ data: tabsData, type: "materialRequisition" }],
        open: false,
      });

      createOrUpdateWeeklySummary({
        payload: unpopulateLocalStorage(newData),
      }).then((summary) => setWeeklyFuellingSummary(summary));
    });
  }, [tabsData]);

  useEffect(() => {
    getLocalStorageData().then((oldData: LocalStorageData) => {
      const newData = populateLocalStorage({
        localStorageData: { ...oldData, activeTab },
        departments,
        fuels,
      });
      setLocalStorageData({ data: newData });
    });
    setSelectedTabData(tabsData[activeTab] ?? null);
    setSelectedCar(null);
  }, [activeTab]);

  const createTab = (departmentId: string) => {
    const existingTab = tabsData.find((tab) => tab.department === departmentId);
    const department = departments.find((dept) => dept._id === departmentId);

    if (!department) {
      console.warn("Selected department not found.");
      return;
    }

    if (existingTab) {
      const existingIndex = tabsData.indexOf(existingTab);
      setActiveTab(existingIndex);
      setSelectedTabData(tabsData[existingIndex] ?? null);
    } else {
      const orders = pluck("order", tabsData);
      const newOrder = orders.length > 0 ? Math.max(...orders) + 1 : 1;
      const newTab: TabData = {
        order: newOrder,
        department,
        carEntries: [],
      };

      const newTabsData = [...tabsData, newTab];

      setTabsData(newTabsData);
      setActiveTab(newTabsData.length - 1);
      setSelectedTabData(newTabsData[tabsData.length - 1] ?? null);
    }
    setSelectedCar(null);
  };

  const onTabsDataChange = (newTabData: TabData) => {
    const updatedTabData = tabsData.find(
      (tabData) =>
        (tabData.department as DepartmentDTO)._id ===
        (newTabData.department as DepartmentDTO)._id,
    );

    if (!updatedTabData) {
      console.warn("Provide a tabData to update.");
      return;
    }

    const tabDataId = tabsData.indexOf(updatedTabData);
    const anotherTabs = remove(tabDataId, 1, tabsData);

    if (newTabData.carEntries.length > 0) {
      setTabsData(insert(tabDataId, newTabData, anotherTabs));
    } else {
      const firstElement = head(reject(isNil, tabsData));
      const newActiveTab = firstElement ? tabsData.indexOf(firstElement) : 0;

      setTabsData(anotherTabs);
      setActiveTab(newActiveTab);
      setSelectedTabData(anotherTabs[newActiveTab] ?? null);
      setSelectedCar(null);
    }
  };

  const onTabClose = (tabData: TabData) => {
    // removing car entries to remove tab
    const tabWithoutCarEntries = removeAllCarEntries(tabData);
    const firstElement = head(reject(isNil, tabsData));
    const newActiveTab = firstElement ? tabsData.indexOf(firstElement) : 0;
    setActiveTab(newActiveTab);
    setSelectedTabData(tabsData[newActiveTab] ?? null);
    onTabsDataChange(tabWithoutCarEntries);
    setSelectedCar(null);
  };

  const handleDeleteWeeklySummary = async () => {
    if (weeklyFuellingSummary) {
      deleteWeeklySummary(weeklyFuellingSummary._id).then(() => {
        setWeeklyFuellingSummary(null);
      });
    }
  };

  const openResetDialog = () => {
    openConfirmationDialog({
      title: "Começar tudo novamente?",
      description:
        "Ao confirmar, você apagará todas as abas e seu conteúdo. Quer prosseguir?",
      onConfirm: () => {
        setTabsData([]);
        handleDeleteWeeklySummary();
      },
    });
  };

  const openCloseTabDialog = (tabData: TabData) => {
    openConfirmationDialog({
      title: "Excluir aba?",
      description:
        "Ao confirmar, todas os carros e abastecimentos dessa aba serão perdidos. Quer prosseguir?",
      onConfirm: () => onTabClose(tabData),
    });
  };

  const availableDepartments = useMemo(() => {
    return departments.filter(
      (dept) =>
        !tabsData.some(
          (tab) => (tab.department as DepartmentDTO)._id === dept._id,
        ),
    );
  }, [departments, tabsData]);

  const openNewTabDialog = () => {
    openSelectDialog({
      title: "Selecione o departamento",
      options: availableDepartments.map((dept) => ({
        label: dept.name,
        value: dept._id,
      })),
      onConfirm: (selectedDepartmentId) => {
        const selectedDepartment = departments.find(
          (dept) => dept._id === selectedDepartmentId,
        );
        if (selectedDepartment) {
          createTab(selectedDepartment._id);
        }
      },
    });
  };

  const TabCloseIcon = ({ tabData }: { tabData: TabData }) => (
    <Tooltip title="Fechar a aba">
      <Close
        sx={{ fontSize: 12, zIndex: 2000 }}
        onClick={() => openCloseTabDialog(tabData)}
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
            {selectedTabData && (
              <Grid size={6} justifyContent="flex-end">
                <Typography variant="h6" color="text.secondary" align="right">
                  Total do{" "}
                  {(selectedTabData?.department as DepartmentDTO)?.name} R${" "}
                  {getDepartmentTotalValue(
                    (selectedTabData?.department as DepartmentDTO)?._id,
                  ).toFixed(2)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>

      <Grid size={12} container justifyContent="center" alignItems="center">
        <MaterialRequisitionHeader tabsData={tabsData} />
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
          disabled={!tabsData.length}
          onClick={openResetDialog}
          sx={{ width: 1, padding: 1, m: 1 }}
        >
          Resetar
        </Button>

        <Tabs
          value={activeTab}
          onChange={(_, v) => {
            setActiveTab(v);
            setSelectedTabData(tabsData[v] ?? null);
            setSelectedCar(null);
          }}
          variant="scrollable"
          scrollButtons="auto"
          orientation="vertical"
          sx={{ mb: 2, m: "auto", mt: 1 }}
        >
          {tabsData
            .sort((a, b) => a.order - b.order)
            .map((tabData, idx) => (
              <Tab
                key={idx}
                label={
                  (tabData.department as DepartmentDTO)?.name ??
                  `Departamento ${idx + 1}`
                }
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                sx={{ fontSize: 12, zIndex: 1 }}
                icon={<TabCloseIcon tabData={tabData} />}
                iconPosition="end"
              />
            ))}
        </Tabs>
      </Grid>

      <Grid size={10}>
        {!isEmpty(tabsData) ? (
          tabsData
            .sort((a, b) => a.order - b.order)
            .map((tabData, idx) => (
              <TabPanel
                index={activeTab}
                value={idx}
                key={`materialRequisitionTab${idx}`}
              >
                <MaterialRequisitionTab
                  fuels={fuels}
                  data={tabData}
                  onDataChange={onTabsDataChange}
                  weeklyFuelingSummary={weeklyFuellingSummary}
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
