"use client";

import { useSession } from "next-auth/react";
import Loader from "./components/Loader";
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import PrintIcon from "@mui/icons-material/Print";
import ArticleIcon from "@mui/icons-material/Article";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "next-auth/react";
import { AppBar, Drawer, DrawerContent, Main } from "./styled";
import { ReactNode, useEffect, useState } from "react";
import { navList } from "./navList";
import { redirect } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  const handleDropdownClick = () => {
    setOpenDropdown(!openDropdown);
  };

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <DrawerContent>
      <List>
        {navList.map(({ label, href, icon }) => (
          <ListItemButton component="a" href={href} key={href}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}

        <Divider />

        <ListItemButton onClick={handleDropdownClick}>
          <ListItemIcon>
            <PrintIcon />
          </ListItemIcon>
          <ListItemText primary="Auxiliares" />
          {openDropdown ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openDropdown} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              component="a"
              href="/reports/summary"
            >
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText primary="Relatório uso veículo" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component="a" href="/reports/full">
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText primary="Req. Mat. combustível" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Divider entre dropdown e logout */}
        <Divider />

        <ListItemButton onClick={() => signOut({ redirectTo: "/login" })}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </DrawerContent>
  );

  return status === "authenticated" ? (
    <Box sx={{ display: "flex" }}>
      {/* AppBar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ display: { sm: "none" }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Feriapp
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {drawer}
      </Drawer>

      {/* Conteúdo */}
      <Main
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // para compensar altura do AppBar
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: `240px` }, // compensar largura da Drawer no desktop
        }}
      >
        {children}
      </Main>
    </Box>
  ) : (
    <Loader />
  );
}
