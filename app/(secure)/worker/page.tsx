'use client';

import { Worker } from "@/app/types";
import { translateEntityKey } from "@/app/utils";
import { useMediaQuery, Container, Typography, useTheme } from "@mui/material";
import { workers } from "./mock";
import { ListPageDesktop } from "../components/ListPageDesktop";
import { ListPageMobile } from "../components/ListPageMobile";

const WorkerList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom mb={4}>
        {translateEntityKey({
          entity: "worker",
          key: "TranslatedPlural",
        })}
      </Typography>
      {isMobile ? (
        <ListPageMobile<Worker>
          items={workers}
          routePrefix="worker"
          onDelete={(id) => console.log(`Delete worker with id: ${id}`)}
        />
      ) : (
        <ListPageDesktop<Worker>
          routePrefix="worker"
          onDelete={(id) => console.log(`Delete worker with id: ${id}`)}
          items={workers}
        />
      )}
      ;
    </Container>
  );
};

export default WorkerList;
