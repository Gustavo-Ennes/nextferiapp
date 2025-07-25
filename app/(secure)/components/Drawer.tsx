import { signOut } from "@/auth";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { navList } from "../navList";
import { DrawerContent } from "../styled";
import { ListItemMenu } from "./ListItemMenu";
import { Print, Article, Logout } from "@mui/icons-material";
import { ReactNode } from "react";

export const Drawer = () => {
  const getVacationProps = (icon: ReactNode) => ({
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

  const auxProps = {
    label: "Auxiliares",
    icon: <Print />,
    items: [
      {
        itemLabel: "Relatório uso veículo",
        itemIcon: <Article />,
        href: "/pdf?type=vehicleUsage",
      },
      {
        itemLabel: "Req. Material. Combust.",
        itemIcon: <Article />,
        href: "/pdf?type=materialRequisition",
      },
    ],
  };

  return (
    <DrawerContent>
      <List>
        {navList.map(({ label, href, icon }) =>
          href !== "/vacation" ? (
            <ListItemButton component="a" href={href} key={href} sx={{ my: 1 }}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ) : (
            <ListItemMenu props={getVacationProps(icon)} key={href} />
          )
        )}

        <Divider />

        <ListItemMenu props={auxProps} />

        <Divider />

        <ListItemButton onClick={() => signOut({ redirectTo: "/login" })}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </DrawerContent>
  );
};
