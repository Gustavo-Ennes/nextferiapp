import { migrateDepartmentsAndWeeklySummaries } from "@/script/migrations/fixDepartmentsAndWeeklySummaries";

export const afterInit = async () => {
  try {
    await migrateDepartmentsAndWeeklySummaries();
  } catch (error) {
    console.error("afterInit migration failed:", error);
  }
};
