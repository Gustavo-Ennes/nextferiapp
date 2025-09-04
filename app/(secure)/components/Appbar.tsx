import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import { AppBar } from "../styled";
import { type User } from "next-auth";
import { Tooltip } from "@mui/material";

const ResponsiveAppBar = ({
  toggleDrawer,
  user,
}: {
  toggleDrawer: () => void;
  user?: User;
}) => (
  <AppBar position="fixed">
    <Container maxWidth="xl">
      <Toolbar disableGutters>
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

        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}></Box>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }} />
        <Box sx={{ flexGrow: 0 }}>
          {user && (
            <Tooltip title={user.name}><Avatar alt={user.name as string} src={user.image as string} /></Tooltip>
          )}
        </Box>
      </Toolbar>
    </Container>
  </AppBar>
);

export default ResponsiveAppBar;
