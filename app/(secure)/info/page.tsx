"use client";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const today = new Date().toLocaleDateString("pt-BR");

const data = {
  totalWorkers: 122,
  totalDepartments: 8,
  onVacationToday: [
    "Valdomiro José Colombo",
    "Paulo Martins do Couto",
    "Carlos Roberto Cruz",
  ],
  upcomingLeaves: [
    { name: "Carlos Cesar Marques da Cruz", date: "15/07/2025" },
    { name: "Rogério Alves Araújo", date: "14/07/2025" },
    { name: "Vildeson Antônio da Silva", date: "14/07/2025" },
    { name: "Carlos Cesar Marques da Cruz", date: "14/07/2025" },
    { name: "Gessé dos Santos Oliveira", date: "14/07/2025" },
    { name: "Paulo Martins do Couto", date: "11/07/2025" },
    { name: "Valdomiro José Colombo", date: "11/07/2025" },
    { name: "Edmar Silva dos Santos", date: "11/07/2025" },
    { name: "Maercio Ikarugi Bonfim", date: "11/07/2025" },
  ],
  upcomingReturns: [
    { name: "Carlos Cesar Marques da Cruz", date: "16/07/2025" },
    { name: "Edmar Silva dos Santos", date: "13/07/2025" },
    { name: "Maercio Ikarugi Bonfim", date: "13/07/2025" },
    { name: "Valdomiro José Colombo", date: "12/07/2025" },
    { name: "Paulo Martins do Couto", date: "12/07/2025" },
  ],
};

export default function DashboardHome() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Painel de Férias – {today}
      </Typography>

      {/* Cards de estatísticas */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Trabalhadores</Typography>
            <Typography variant="h4">{data.totalWorkers}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Departamentos</Typography>
            <Typography variant="h4">{data.totalDepartments}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Folgando hoje</Typography>
            <Typography variant="h4">{data.onVacationToday.length}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Retornos nesta semana</Typography>
            <Typography variant="h4">{data.upcomingReturns.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {/* Saídas próximas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Próximas Saídas</Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {data.upcomingLeaves.map(({ name, date }, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={name}
                    secondary={`Saindo dia ${date}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Retornos próximos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Retornos</Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {data.upcomingReturns.map(({ name, date }, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={name}
                    secondary={`Retornando dia ${date}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Folgando hoje */}
      <Grid size={12} sx={{ mt: 4 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6">Folgando Hoje</Typography>
          <Divider sx={{ my: 1 }} />
          <List dense>
            {data.onVacationToday.map((name, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={`${name} está`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Box>
  );
}
