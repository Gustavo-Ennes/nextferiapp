"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { redirect, useParams } from "next/navigation";
import { Vacation } from "@/app/types";
import { format } from "date-fns";
import { useModal } from "@/context/ModalContext";

export default function VacationViewPage() {
  const { open } = useModal();
  const { id } = useParams();
  const [data, setData] = useState<Vacation | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/vacation/${id}`, {
      cache: "no-store",
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })

      .then((data) => {
        console.log("🚀 ~ useEffect ~ data:", data);
        if (data.vacation) setData(data.vacation);
        // else redirect("/not-found");
      })
      .catch(() => {
        redirect("/not-found");
      });
  }, [id]);

  if (!data) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "normal":
        return "Férias";
      case "license":
        return "Licença-Prêmio";
      case "dayOff":
        return "Abonada";
      default:
        return "Tipo Desconhecido";
    }
  };

  const handleReject = () => {
    open({
      title: "Indeferir folga",
      description: "Deseja indeferir esta solicitação?",
      onConfirm: (obs) => {
        console.log("Observação:", obs);
      },
    });
  };

  const handleRejectWithPrint = () => {
    open({
      title: "Imprimir indeferimento",
      description: "Deseja indeferir e imprimir o cancelamento da folga?",
      onConfirm: (obs) => {
        console.log("Observação para impressão:", obs);
      },
    });
  };

  const handleRejectWithReschedule = () => {
    open({
      title: "Imprimir remarcação",
      description: "Deseja imprimir o cancelamento e a remarcação desta folga?",
      onConfirm: (obs) => {
        console.log("Observação para remarcação:", obs);
      },
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Visualização da Folga
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Funcionário</Typography>
            <Typography>{data?.worker?.name}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Tipo</Typography>
            <Typography>{getTypeLabel(data.type)}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Período</Typography>
            <Typography>
              {format(data.startDate, "dd/MM/yyyy")}
              {!data.period && ` até ${format(data.endDate, "dd/MM/yyyy")}`}
              {data.period &&
                ` (${data.period === "half" ? "Meio período" : "Integral"})`}
            </Typography>
          </Box>

          {data.deferred && (
            <Box>
              <Typography variant="subtitle2">Status</Typography>
              <Typography>Indeferida / Remarcada</Typography>
            </Box>
          )}

          {data.observation && (
            <Box>
              <Typography variant="subtitle2">Observação</Typography>
              <Typography>{data.observation}</Typography>
            </Box>
          )}
        </Stack>
      </Paper>
      <Grid
        container
        spacing={2}
        my={3}
        alignContent="center"
        justifyContent="space-between"
      >
        <Button variant="contained" onClick={handleReject}>
          Indeferir
        </Button>
        <Button variant="contained" onClick={handleRejectWithPrint}>
          Imprimir cancelamento
        </Button>
        <Button variant="contained" onClick={handleRejectWithReschedule}>
          Imprimir remarcação
        </Button>
      </Grid>
    </Container>
  );
}
