"use client";
import { useTheme } from "@mui/material/styles";
import { Container, Typography, useMediaQuery } from "@mui/material";
import { Entity } from "@/app/types";
import { ListPageDesktop } from "./ListPageDesktop";
import { ListPageMobile } from "./ListPageMobile";
import { translateEntityKey } from "@/app/utils";

const ResponsiveListPage = <T extends { _id: string }>({
  items,
  routePrefix,
}: {
  items: T[];
  routePrefix: Entity;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom mb={4}>
        {translateEntityKey({
          entity: routePrefix,
          key: "TranslatedPlural",
        })}
      </Typography>
      {isMobile ? (
        <ListPageMobile<T>
          items={items}
          routePrefix={routePrefix}
          onDelete={(id) => console.log(`Delete ${routePrefix} with id: ${id}`)}
        />
      ) : (
        <ListPageDesktop<T>
          routePrefix={routePrefix}
          onDelete={(id) => console.log(`Delete ${routePrefix} with id: ${id}`)}
          items={items}
        />
      )}
      ;
    </Container>
  );
};

export { ResponsiveListPage };
