"use client";

import { useTheme } from "@mui/material/styles";
import { Container, Typography, useMediaQuery } from "@mui/material";
import { Department } from "@/app/types";
import {departments} from "./mock";
import { ListPageDesktop } from "../components/ListPageDesktop";
import { ListPageMobile } from "../components/ListPageMobile";
import { translateEntityKey } from "@/app/utils";

const DepartmentListPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom mb={4}>
        {translateEntityKey({
          entity: 'department',
          key: "TranslatedPlural",
        })}
      </Typography>
      {isMobile ? (
        <ListPageMobile<Department>
          items={departments}
          routePrefix="department"
          onDelete={(id) => console.log(`Delete department with id: ${id}`)}
        />
      ) : (
        <ListPageDesktop<Department>
          routePrefix="department"
          onDelete={(id) => console.log(`Delete department with id: ${id}`)}
          items={departments}
        />
      )}
      ;
    </Container>
  );
};

export default DepartmentListPage;
