import { Stack, Box, Typography } from "@mui/material";
import type { StatItem } from "../types";

export const CompactStat = ({
  icon,
  label,
  total,
  selected,
  type,
  textColor,
}: StatItem) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{ px: 1.5, py: 0.5 }}
  >
    <Box
      sx={{
        display: "flex",
        fontSize: type === "primary" ? 45 : 20,
      }}
    >
      {icon}
    </Box>
    <Stack spacing={0} sx={{ lineHeight: 1, width: "100%" }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          lineHeight: type === "primary" ? 1 : 2,
          fontSize: type === "primary" ? 15 : 12,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        color={textColor ?? "text.secondary"}
        sx={{ lineHeight: 1.2, fontSize: type === "primary" ? 15 : 12 }}
      >
        {selected ? `${selected} / ${total}` : total}
      </Typography>
    </Stack>
  </Stack>
);
