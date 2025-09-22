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
    mb={1}
    textAlign={isMobile ? "center" : "left"}
    color='primary'
  >
    {children}
  </Typography>
);
