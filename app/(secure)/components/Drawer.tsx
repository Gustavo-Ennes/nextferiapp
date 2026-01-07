import { signOut } from "@/auth";
import {
  List,
  ListItemButton,
  ListItemText,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { navList } from "../navList";
import { DrawerContent } from "../styled";
import { ListItemMenu } from "./ListItemMenu";
import { Logout, PictureAsPdf } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { BlueItemIcon } from "./styled";
import { getVacationProps, getWeeklyFuellingSummaryProps } from "./utils";

export const Drawer = () => {
  const router = useRouter();
  const { setPdf } = usePdfPreview();

  const listClickAction = (href: string) => {
    router.push(href);
  };

  return (
    <DrawerContent>
      <List>
        {navList.map(({ label, href, icon }) =>
          href !== "/vacation" ? (
            <ListItemButton
              key={href}
              sx={{ my: 1 }}
              onClick={() => listClickAction(href)}
            >
              <BlueItemIcon>{icon}</BlueItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ) : (
            <ListItemMenu props={getVacationProps()} key={href} />
          )
        )}
        <Divider />

        <ListItemMenu
          props={getWeeklyFuellingSummaryProps()}
          key="/weeklyFuellingSummary"
        />
        <Divider />

        <ListItemButton
          key={"vehicleUsage"}
          sx={{ my: 1 }}
          onClick={() => setPdf({ items: [{ type: "vehicleUsage" }] })}
        >
          <BlueItemIcon>
            <PictureAsPdf />
          </BlueItemIcon>
          <ListItemText primary={"Rel. uso veículo"} />
        </ListItemButton>

        <Divider />

        <ListItemButton onClick={() => signOut({ redirectTo: "/login" })}>
          <ListItemIcon>
            <Logout color="error" />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </DrawerContent>
  );
};
