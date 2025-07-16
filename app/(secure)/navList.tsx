import {
  Person,
  SportsBar,
  Info,
  Business,
  Visibility,
} from "@mui/icons-material";

export const navList = [
  { label: "Informações", href: "/info", icon: <Info /> },
  { label: "Férias", href: "/vacation", icon: <SportsBar /> },
  { label: "Servidores", href: "/worker", icon: <Person /> },
  { label: "Departamentos", href: "/department", icon: <Business /> },
  { label: "Chefes", href: "/boss", icon: <Visibility /> },
];
