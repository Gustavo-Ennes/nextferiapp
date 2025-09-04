"use client";

import { useSession } from "next-auth/react";
import { Box } from "@mui/material";
import { Drawer as MuiDrawer, Main } from "./styled";
import { type ReactNode, useEffect, useState } from "react";
import { Drawer } from "./components/Drawer";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import ResponsiveAppBar from "./components/Appbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { setLoading } = useLoading();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { data, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status !== "loading") setLoading(false);
  }, [status]);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  return (
    status === "authenticated" && (
      <Box sx={{ display: "flex" }}>
        <ResponsiveAppBar toggleDrawer={toggleDrawer} user={data.user} />

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
    )
  );
}
