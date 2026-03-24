import { Box, Chip, Typography } from "@mui/material";
import { statusMeta, abbreviateFuel } from "../../utils";
import type {
  ItemDraft,
  PurchaseOrderUpdateSidebarEntryProps,
} from "../../types";

export const PurchaseOrderUpdateSidebarEntry = ({
  entry,
  isCurrent,
  onClick,
}: PurchaseOrderUpdateSidebarEntryProps) => {
  const meta = statusMeta[entry.status];
  const getEntryItemText = (item?: ItemDraft) => {
    if (!item) return "";
    const diff = item.oldQty - item.newQty;
    const signal = diff > 0 ? "+" : diff < 0 ? "-" : "";

    return `${signal}${diff}${item.unit}`;
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        border: "1px solid",
        borderColor: isCurrent ? "primary.main" : "divider",
        bgcolor: isCurrent ? "action.selected" : "transparent",
        transition: "border-color 0.15s, background 0.15s",
        "&:hover": { bgcolor: "action.hover" },
        minWidth: 0, // evita overflow no flex container
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          minWidth: 0,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={isCurrent ? 600 : 400}
          noWrap
          sx={{ minWidth: 0, flex: 1 }}
        >
          {entry.reference}
        </Typography>
        <Chip
          label={meta.label}
          color={meta.color}
          size="small"
          variant="outlined"
          sx={{
            flexShrink: 0,
            fontSize: "0.65rem",
            height: 20,
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      </Box>

      {entry.items && (
        <Box
          sx={{ mt: 0.75, display: "flex", flexDirection: "column", gap: 0.25 }}
        >
          {entry.items.map((it) => (
            <Box
              key={it.fuelId}
              sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500, flexShrink: 0 }}
              >
                {abbreviateFuel(it.fuelName)}:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getEntryItemText(it)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {entry.errorMsg && (
        <Typography
          variant="caption"
          color="error"
          display="block"
          sx={{ mt: 0.5 }}
          noWrap
        >
          {entry.errorMsg}
        </Typography>
      )}
    </Box>
  );
};
