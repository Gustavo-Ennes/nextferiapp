import { Typography } from "@mui/material";
import type { ReactNode } from "react";

export const TitleTypography = ({
  children,
  isMobile,
}: {
  children: ReactNode;
  isMobile?: boolean;
}) => (
  <Typography
    variant="h4"
    gutterBottom
    mb={4}
    textAlign={isMobile ? "center" : "left"}
  >
    {children}
  </Typography>
);
