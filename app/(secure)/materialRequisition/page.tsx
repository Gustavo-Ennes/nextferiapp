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
import { useState, useEffect } from "react";
import { NewTabDialog } from "./components/TabDialog";
import { TabData } from "./types";
import { getLocalStorageData, removeAllCarEntries } from "./utils";
import { Tab as MaterialRequisitionTab } from "./components/Tab";
import { TabPanel } from "./components/TabPanel";
import { Close } from "@mui/icons-material";
import { head, isNil, reject } from "ramda";
import { TitleTypography } from "../components/TitleTypography";

export default function MaterialRequisitionPage() {
  const [tabsData, setTabsData] = useState<TabData[]>(
    getLocalStorageData().data ?? []
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [newTabDialog, setNewTabDialog] = useState(false);
  const [tabCounter, setTabCounter] = useState(0);

  // Load
  useEffect(() => {
    try {
      const { data, activeTab } = getLocalStorageData();

      if (data.length) {
        setTabsData(data);
        setActiveTab(activeTab);
        setTabCounter(data.length);
      }
    } catch (error) {
      console.error("Error parsing material requisition data: ", error);
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem("tabsData", JSON.stringify(tabsData));
  }, [tabsData]);
  useEffect(() => {
    localStorage.setItem("activeTab", JSON.stringify(activeTab));
  }, [activeTab]);

  const createTab = (name: string) => {
    const existingTab = tabsData.find((tab) => tab.department === name);

    if (existingTab) {
      setActiveTab(tabsData.indexOf(existingTab));
    } else {
      const newTab: TabData = {
        department: name,
        carEntries: [],
      };
      setTabsData((prev) => [...prev, newTab]);
      setActiveTab(tabsData.length);
      setNewTabDialog(false);
      setTabCounter(tabCounter + 1);
    }
  };

  const onTabsDataChange = (tabData: TabData) => {
    const anotherTabs = tabsData.filter(
      (tab) => tab.department !== tabData?.department
    );
    const newTabs = [...anotherTabs];
    if (tabData.carEntries?.length) newTabs.push(tabData);
    console.log("🚀 ~ onTabsDataChange ~ tabData:", tabData);

    setTabsData(newTabs);
  };

  const onTabClose = (tabData: TabData) => {
    // removing car entries to remove tab
    const tabWithoutCarEntries = removeAllCarEntries(tabData);
    const firstElement = head(reject(isNil, tabsData));
    const newActiveTab = firstElement ? tabsData.indexOf(firstElement) : 0;
    setActiveTab(newActiveTab);
    onTabsDataChange(tabWithoutCarEntries);
  };

  const TabCloseIcon = ({ tabData }: { tabData: TabData }) => (
    <Tooltip title="Fechar a aba">
      <Close
        sx={{ fontSize: 12, zIndex: 2000 }}
        onClick={() => onTabClose(tabData)}
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
        height: 224,
      }}
    >
      <Grid size={12}>
        <TitleTypography>
          Requisições de materiais - combustível
        </TitleTypography>
      </Grid>
      <Grid size={2}>
        <Button
          variant="contained"
          onClick={() => setNewTabDialog(true)}
          sx={{ width: 1, padding: 1 }}
        >
          Novo departamento
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
          {tabsData.map((tabData, idx) => (
            <Tab
              key={idx}
              label={tabData.department}
              value={idx}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{ fontSize: 13 }}
              icon={<TabCloseIcon tabData={tabData} />}
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Grid>

      <Grid size={10}>
        {tabsData.length ? (
          tabsData.map((tabData, idx) => (
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
          <Typography>
            Adicione uma aba para requisições de um departamento.
          </Typography>
        )}
      </Grid>

      <NewTabDialog
        open={newTabDialog}
        onClose={() => setNewTabDialog(false)}
        onCreate={createTab}
      />
    </Grid>
  );
}
