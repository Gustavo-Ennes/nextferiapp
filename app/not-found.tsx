"use client";

import { Box, Typography, Button } from "@mui/material";
import { TitleTypography } from "./(secure)/components/TitleTypography";
import { useRouter } from "@/context/RouterContext";

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        px: 2,
      }}
    >
      <TitleTypography>🕵️‍♂️ Nada por aqui...</TitleTypography>
      <Typography variant="body1" gutterBottom>
        A página que você procura não foi encontrada. Talvez tenha tirado
        férias?
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => router.redirectWithLoading("/")}
      >
        Voltar ao Dashboard
      </Button>
    </Box>
  );
}
