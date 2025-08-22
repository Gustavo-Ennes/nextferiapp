import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { grey, blueGrey, indigo } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: indigo[600], // NextAuth brand-like color
      contrastText: "#fff",
    },
    secondary: {
      main: blueGrey[500], // Neutral secondary
      contrastText: "#fff",
    },
    background: {
      default: grey[50],
      paper: "#fff",
    },
    text: {
      primary: blueGrey[900],
      secondary: blueGrey[700],
    },
  },
  typography: {
    fontFamily: ["Inter", "Roboto", "sans-serif"].join(","),
    h1: { fontWeight: 600, fontSiuze: "2.25rem" },
    h2: { fontWeight: 600, fontSize: "2rem" },
    h3: { fontWeight: 500, fontSize: "1.75rem" },
    body1: { fontSize: "1rem" },
    button: { textTransform: "none" },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: indigo[700],
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: 2,
          borderRadius: 12,
        },
      },
    },
  },
});

// Make typography responsive
const responsiveTheme = responsiveFontSizes(theme);

export { responsiveTheme };
