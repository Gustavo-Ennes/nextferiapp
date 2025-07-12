"use client";

import { translateEntityKey } from "@/app/utils";
import { useMediaQuery, Container, Typography, useTheme } from "@mui/material";
import { vacations } from "./mock";
import { ListPageDesktop } from "../components/ListPageDesktop";
import { ListPageMobile } from "../components/ListPageMobile";
import { Vacation } from "@/app/types";

const VacationList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom mb={4}>
        {translateEntityKey({
          entity: "vacation",
          key: "TranslatedPlural",
        })}
      </Typography>
      {isMobile ? (
        <ListPageMobile<Vacation>
          items={vacations}
          routePrefix="vacation"
          onDelete={(id) => console.log(`Delete vacation with id: ${id}`)}
        />
      ) : (
        <ListPageDesktop<Vacation>
          routePrefix="vacation"
          onDelete={(id) => console.log(`Delete vacation with id: ${id}`)}
          items={vacations}
        />
      )}
      ;
    </Container>
  );
};

export default VacationList;
