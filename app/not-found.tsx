"use client";

import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

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
      <Typography variant="h3" gutterBottom>
        🕵️‍♂️ Nada por aqui...
      </Typography>
      <Typography variant="body1" gutterBottom>
        A página que você procura não foi encontrada. Talvez tenha tirado
        férias?
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => router.push("/")}
      >
        Voltar ao Dashboard
      </Button>
    </Box>
  );
}
