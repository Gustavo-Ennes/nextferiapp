import { Stack, Badge, Typography, Tooltip } from "@mui/material";
import type { WorkerStatusInfo } from "../types";
import { isEmpty } from "ramda";

export const WorkerStatusIcons = ({
  workerIcons,
}: {
  workerIcons: WorkerStatusInfo[];
}) => {
  return (
    !isEmpty(workerIcons) && (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        pt={2}
        spacing={2}
      >
        {workerIcons.map(({ name, icon, badgeContent, tooltipContent }) => (
          <Tooltip title={tooltipContent} key={`worker-icon-tt-${name}`}>
            <Stack
              key={name}
              sx={{ px: 1 }}
              justifyContent="center"
              alignItems="center"
            >
              <Badge badgeContent={badgeContent} invisible={!badgeContent}>
                {icon}
              </Badge>
              <Typography fontSize={10}>{name}</Typography>
            </Stack>
          </Tooltip>
        ))}
      </Stack>
    )
  );
};
