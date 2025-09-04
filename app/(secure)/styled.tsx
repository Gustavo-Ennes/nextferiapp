import {
  Box,
  AppBar as MuiAppBar,
  Drawer as MuiDrawer,
  styled,
} from "@mui/material";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const Drawer = styled(MuiDrawer)(() => ({
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
  },
}));

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  marginTop: theme.spacing(8),
  padding: theme.spacing(2),
  width: `calc(100% - ${drawerWidth}px)`,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
  marginLeft: `${drawerWidth}px`,
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginTop: theme.spacing(9),
}));

export { AppBar, Drawer, Main, DrawerContent };
