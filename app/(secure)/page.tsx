"use client";

import {
  Box,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { redirect } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { TitleTypography } from "./components/TitleTypography";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const redirectTo = "/vacation";

  if (status === "authenticated") {
    redirect(redirectTo);
  }

  const handleLogin = () => {
    setLoading(true);
    signIn("auth0", { redirectTo });
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={3}
      >
        <TitleTypography>Login com Auth0</TitleTypography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Entrar com Auth0"}
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
