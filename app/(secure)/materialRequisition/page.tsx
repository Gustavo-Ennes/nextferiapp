"use client";

import {
  Box,
  Button,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { NewTabDialog } from "./components/TabDialog";
import type { DialogData, LocalStorageData, TabData } from "./types";
import {
  getLocalStorageData,
  removeAllCarEntries,
  resumeTabData,
  setLocalStorageData,
} from "./utils";
import { Tab as MaterialRequisitionTab } from "./components/Tab";
import { TabPanel } from "./components/TabPanel";
import { Close, CorporateFareOutlined } from "@mui/icons-material";
import { head, insert, isNil, pluck, reject, remove } from "ramda";
import { TitleTypography } from "../components/TitleTypography";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { ConfirmationDialog } from "../components/ConfirmationDialog";

export default function MaterialRequisitionPage() {
  const [tabsData, setTabsData] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [newTabDialog, setNewTabDialog] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [dialogData, setDialogData] = useState<DialogData>();
  const { setPdf } = usePdfPreview();

  // Load
  useEffect(() => {
    getLocalStorageData()
      .then(({ activeTab, data }: LocalStorageData) => {
        if (data.length) {
          setTabsData(data);
          setActiveTab(activeTab);
        }
      })
      .catch((err) => {
        console.error("Error parsing material requisition data: ", err);
      });
  }, []);

  // Persist
  useEffect(() => {
    getLocalStorageData().then((oldData: LocalStorageData) => {
      const newData = { ...oldData, data: tabsData };
      setLocalStorageData({ data: newData });
      setPdf({
        items: [{ data: tabsData, type: "materialRequisition" }],
        open: false,
      });
    });
  }, [tabsData]);

  useEffect(() => {
    getLocalStorageData().then((oldData: LocalStorageData) => {
      const newData = { ...oldData, activeTab };
      setLocalStorageData({ data: newData });
    });
  }, [activeTab]);

  const createTab = (name: string) => {
    const existingTab = tabsData.find((tab) => tab.department === name);

    if (existingTab) {
      setActiveTab(tabsData.indexOf(existingTab));
    } else {
      const ids = pluck("id", tabsData);
      const newId = Math.max(...ids) + 1;
      const newTab: TabData = {
        id: newId ?? 1,
        department: name,
        carEntries: [],
      };
      setTabsData((prev) => [...prev, newTab]);
      setActiveTab(tabsData.length);
      setNewTabDialog(false);
    }
  };

  const onTabsDataChange = (tabData: TabData) => {
    const tabDataId = tabsData.indexOf(tabData);
    const anotherTabs = remove(tabDataId, 1, tabsData);
    if (tabData.carEntries.length)
      setTabsData(insert(tabDataId, tabData, anotherTabs));
    else setTabsData(anotherTabs);
  };

  const onTabClose = (tabData: TabData) => {
    // removing car entries to remove tab
    const tabWithoutCarEntries = removeAllCarEntries(tabData);
    const firstElement = head(reject(isNil, tabsData));
    const newActiveTab = firstElement ? tabsData.indexOf(firstElement) : 0;
    setActiveTab(newActiveTab);
    onTabsDataChange(tabWithoutCarEntries);
  };

  const openResetDialog = () => {
    setDialogData({
      title: "Começar tudo novamente?",
      message:
        "Ao confirmar, você apagará todas as abas e seu conteúdo. Quer prosseguir?",
      onConfirm: () => setTabsData([]),
    });
    setConfirmationDialog(true);
  };

  const openCloseTabDialog = (tabData: TabData) => {
    setDialogData({
      title: "Excluir aba?",
      message:
        "Ao confirmar, todas os carros e abastecimentos dessa aba serão perdidos. Quer prosseguir?",
      onConfirm: () => onTabClose(tabData),
    });
    setConfirmationDialog(true);
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
        <Chip
          color="primary"
          icon={<CorporateFareOutlined />}
          size="small"
          label={resumeTabData(tabsData[activeTab])}
          sx={{ float: "right", fontSize: 10, px: 2 }}
        ></Chip>
      </Grid>
      <Grid size={2} justifyContent="center" alignItems="center" px={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setNewTabDialog(true)}
          sx={{ width: 1, padding: 1, m: 1 }}
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
          }}
          variant="scrollable"
          scrollButtons="auto"
          orientation="vertical"
          sx={{ mb: 2, m: "auto", mt: 1 }}
        >
          {tabsData
            .sort((a, b) => a.id - b.id)
            .map((tabData, idx) => (
              <Tab
                key={idx}
                label={tabData.department}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                sx={{ fontSize: 12, zIndex: 1 }}
                icon={<TabCloseIcon tabData={tabData} />}
                iconPosition="end"
              />
            ))}
        </Tabs>
      </Grid>

      <Grid size={10}>
        {tabsData.length ? (
          tabsData
            .sort((a, b) => a.id - b.id)
            .map((tabData, idx) => (
              <TabPanel
                index={activeTab}
                value={idx}
                key={`materialRequisitionTab${idx}`}
              >
                <MaterialRequisitionTab
                  data={tabData}
                  onDataChange={onTabsDataChange}
                />
              </TabPanel>
            ))
        ) : (
          <Typography sx={{ p: 2 }}>
            Adicione uma aba para requisições de um departamento.
          </Typography>
        )}
      </Grid>

      <NewTabDialog
        open={newTabDialog}
        onClose={() => setNewTabDialog(false)}
        onCreate={createTab}
      />

      {dialogData && (
        <ConfirmationDialog
          message={dialogData.message}
          onClose={() => setConfirmationDialog(false)}
          open={confirmationDialog}
          onConfirm={() => {
            setConfirmationDialog(false);
            dialogData.onConfirm();
          }}
          title={dialogData.title}
        />
      )}
    </Grid>
  );
}
