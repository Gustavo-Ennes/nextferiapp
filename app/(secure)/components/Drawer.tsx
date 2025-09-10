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
import { Logout, PictureAsPdf, Receipt } from "@mui/icons-material";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import type { ListItemMenuItem } from "./types";
import { BlueItemIcon } from "./styled";

export const Drawer = () => {
  const router = useRouter();
  const { setPdf } = usePdfPreview();
  const getVacationProps = (icon: ReactNode): ListItemMenuItem => ({
    label: "Folgas",
    icon,
    items: [
      {
        itemLabel: "Férias",
        itemIcon: icon,
        href: "/vacation",
      },
      {
        itemLabel: "Abonadas",
        itemIcon: icon,
        href: "/vacation/dayOff",
      },
      {
        itemLabel: "Lic. Prêmio",
        itemIcon: icon,
        href: "/vacation/license",
      },
    ],
  });

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
            <ListItemMenu props={getVacationProps(icon)} key={href} />
          )
        )}
        <Divider />

        <ListItemButton
          key={"materialRequisition"}
          sx={{ my: 1 }}
          onClick={() => router.push("/materialRequisition")}
        >
          <BlueItemIcon>
            <Receipt />
          </BlueItemIcon>
          <ListItemText primary={"Req. de materiais"} />
        </ListItemButton>
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
