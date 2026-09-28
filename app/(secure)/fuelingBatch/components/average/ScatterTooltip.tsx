import { Paper, Typography } from "@mui/material";
import { useItemTooltip, ChartsTooltipContainer } from "@mui/x-charts";
import type { ScatterTooltipProps } from "../../types";

function ScatterTooltip({ series, labels }: ScatterTooltipProps) {
  const tooltip = useItemTooltip<"scatter">();
  if (!tooltip) return null;

  const dataIndex = (tooltip.identifier as any)?.dataIndex ?? -1;
  const seriesLabel = tooltip.label ?? "";
  const serie = series.find((s) => s.label === seriesLabel);
  const point = serie?.data[dataIndex];

  const showSeriesRow = series.length > 1;

  return (
    <ChartsTooltipContainer trigger="item">
      <Paper sx={{ p: 1 }}>
        {showSeriesRow && (
          <Typography variant="caption" display="block">
            <strong>{labels?.series ?? "Série"}:</strong> {seriesLabel}
          </Typography>
        )}
        <Typography variant="caption" display="block">
          <strong>{labels?.id ?? "ID"}:</strong> {point?.id ?? "-"}
        </Typography>
        <Typography variant="caption" display="block">
          <strong>{labels?.x ?? "X"}:</strong> {point?.x}
        </Typography>
        <Typography variant="caption" display="block">
          <strong>{labels?.y ?? "Y"}:</strong> {point?.y}
        </Typography>
      </Paper>
    </ChartsTooltipContainer>
  );
}

export { ScatterTooltip };
