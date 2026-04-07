import { Paper, Tabs, Tab, Divider } from "@mui/material";
import { getDepartmentWeeklyRows } from "../../utils";
import { AverageDepartmentTable } from "./AverageDepartmentTable";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import type { DepartmentDTO } from "@/dto";

export const AverageDepartmentTabs = ({
  departments,
  summaries,
  tabIndex,
  onChange,
}: {
  departments: DepartmentDTO[];
  summaries: WeeklyFuellingSummaryDTO[];
  tabIndex: number;
  onChange: (v: number) => void;
}) => {
  // this department will represent the sum of all departments in the week
  const allDepartmentsDepartment: DepartmentDTO = {
    _id: "__ALL__",
    name: "Todos os Departamentos",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };
  const departmentsWithAll: DepartmentDTO[] = [
    allDepartmentsDepartment,
    ...departments,
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {departmentsWithAll.map((d) => (
          <Tab key={d?._id} label={d?.name} />
        ))}
      </Tabs>

      <Divider sx={{ my: 2 }} />

      {departmentsWithAll.map((dept, idx) => {
        if (tabIndex !== idx) return null;

        const rows = getDepartmentWeeklyRows(summaries, dept);

        return (
          <AverageDepartmentTable
            key={dept?._id}
            rows={rows}
            summaries={summaries}
          />
        );
      })}
    </Paper>
  );
};
