"use client";

import { translateEntityKey } from "@/app/utils";
import { useMediaQuery, Container, Typography, useTheme } from "@mui/material";
import { bosses } from "../boss/mock";
import { ListPageDesktop } from "../components/ListPageDesktop";
import { ListPageMobile } from "../components/ListPageMobile";
import { Boss } from "@/app/types";

const BossList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom mb={4}>
        {translateEntityKey({
          entity: "boss",
          key: "TranslatedPlural",
        })}
      </Typography>
      {isMobile ? (
        <ListPageMobile<Boss>
          items={bosses}
          routePrefix="boss"
          onDelete={(id) => console.log(`Delete boss with id: ${id}`)}
        />
      ) : (
        <ListPageDesktop<Boss>
          routePrefix="boss"
          onDelete={(id) => console.log(`Delete boss with id: ${id}`)}
          items={bosses}
        />
      )}
    </Container>
  );
};

export default BossList;
