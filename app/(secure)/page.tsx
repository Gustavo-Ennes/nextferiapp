"use client";

import { Box, Button, Container } from "@mui/material";
import { redirect } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { TitleTypography } from "./components/TitleTypography";
import { useLoading } from "@/context/LoadingContext";

const LoginPage = () => {
  const { setLoading, isLoading } = useLoading();
  const { status } = useSession();
  const redirectTo = "/vacation";

  if (status === "authenticated") {
    redirect(redirectTo);
  }

  const handleLogin = () => {
    setLoading(true);
    signIn("auth0", { redirectTo }).then(() => setLoading(false));
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
          disabled={isLoading}
        >
          "Entrar com Auth0"
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
