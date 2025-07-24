import { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import { parseVacations } from "../parse";

const LicenseList = async () => {
  const fetchVacations = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation?type=license`);
  };
  const res = await fetchVacations();
  const { data: licenses } = await res.json();
  const parsedLicenses = parseVacations(licenses);

  return (
    <ResponsiveListPage<Vacation>
      items={parsedLicenses ?? []}
      routePrefix="vacation"
      pageTitle="Licenças-Prêmio"
      vacationType="license"
    />
  );
};

export default LicenseList;
