"use client";

import { useSession } from "next-auth/react";
import Loader from "./components/Loader";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Drawer as MuiDrawer, Main } from "./styled";
import { ReactNode, useEffect, useState } from "react";
import { Drawer } from "./components/Drawer";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

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
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        <Drawer />
      </MuiDrawer>

      {/* Desktop Drawer */}
      <MuiDrawer
        variant="permanent"
        open
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        <Drawer />
      </MuiDrawer>

      {/* Conteúdo */}
      <Main>{children}</Main>
    </Box>
  ) : (
    <Loader />
  );
}
