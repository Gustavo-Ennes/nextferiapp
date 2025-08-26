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
import { useRouter } from "next/navigation";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { ListItemMenuItem } from "./types";

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

  const auxProps: ListItemMenuItem = {
    label: "Auxiliares",
    icon: <Print />,
    items: [
      {
        pdfType: "vehicleUsage",
        itemLabel: "Relatório uso veículo",
        itemIcon: <Article />,
      },
      {
        pdfType: "cancellation",
        itemLabel: "Req. Material. Combust.",
        itemIcon: <Article />,
      },
    ],
  };

  const listClickAction = (href: string) => {
    setPdf([]);
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
