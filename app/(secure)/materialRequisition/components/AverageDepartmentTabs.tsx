import type { WeeklyFuellingSummary } from "@/models/types";
import { Paper, Tabs, Tab, Divider } from "@mui/material";
import { getDepartmentWeeklyRows } from "../utils";
import { AverageDepartmentTable } from "./AverageDepartmentTable";

export const AverageDepartmentTabs = ({
  departments,
  summaries,
  tabIndex,
  onChange,
}: {
  departments: string[];
  summaries: WeeklyFuellingSummary[];
  tabIndex: number;
  onChange: (v: number) => void;
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {departments.map((d) => (
          <Tab key={d} label={d} />
        ))}
      </Tabs>

      <Divider sx={{ my: 2 }} />

      {departments.map((dept, idx) => {
        if (tabIndex !== idx) return null;

        const rows = getDepartmentWeeklyRows(summaries, dept);

        return <AverageDepartmentTable key={dept} rows={rows} />;
      })}
    </Paper>
  );
};
