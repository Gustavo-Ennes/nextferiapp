import { Typography } from "@mui/material";
import type { ReactNode } from "react";

export const TitleTypography = ({
  children,
  other,
}: {
  children: ReactNode;
  other?: object;
}) => (
  <Typography
    variant="h4"
    gutterBottom
    mb={3}
    textAlign="center"
    color="primary"
    {...other}
  >
    {children}
  </Typography>
);
