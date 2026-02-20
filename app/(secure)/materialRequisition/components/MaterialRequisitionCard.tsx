import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { CardContent, Typography, Card, alpha, Box, Grid } from "@mui/material";
import type { MaterialRequisitionCardParam } from "./types";

export const MaterialRequisitionCard = ({
  data,
  icon,
  label,
  color = "primary",
  departmentName,
}: MaterialRequisitionCardParam) => {
  const { selectedTabData } = useMaterialRequisitionForm();
  const selectedDepartmentName = selectedTabData?.department;
  const isTotalGreaterThan999 = data.total.split(".")[0].length > 3;
  const isSeletedGreaterThan999 =
    departmentName || (data.selected && data.selected.split(".")[0].length > 3);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: 1,
        borderColor: "divider",
        transition: "all 0.2s",
        maxWidth: "250px",
        maxHeight: "130px",
        "&:hover": {
          boxShadow: 2,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 1, pb: 2 }}>
        <Grid container alignItems={"start"} justifyContent="center">
          <Grid size={3}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette["primary"].main, 0.1),
                color: `${color}.main`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          </Grid>
          <Grid size={9}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textAlign: "center",
                display: "block",
                mb: 0.5,
                lineHeight: 1.2,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {label}
            </Typography>
          </Grid>
          <Grid size={data.selected || departmentName ? 6 : 12} sx={{ p: 1 }}>
            {(data.selected || departmentName) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.5,
                  lineHeight: 1.2,
                  fontSize: 10,
                }}
              >
                TOTAL
              </Typography>
            )}

            <Typography
              component="div"
              fontWeight={600}
              sx={{
                fontSize: isTotalGreaterThan999 ? 13 : 16,
                lineHeight: 1.2,
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {data.total}
            </Typography>
          </Grid>
          {(data.selected || departmentName) && (
            <Grid size={6} sx={{ p: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.5,
                  lineHeight: 1.2,
                  fontSize: 10,
                }}
              >
                {departmentName
                  ? "SELECIONADO"
                  : (selectedDepartmentName?.toUpperCase() ?? "SELECIONADO")}
              </Typography>
              <Typography
                component="div"
                fontWeight={600}
                sx={{
                  width: "100%",
                  fontSize: isSeletedGreaterThan999 ? 13 : 16,
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  color: (theme) =>
                    departmentName ? theme.palette.primary.main : "black",
                }}
              >
                {departmentName
                  ? selectedDepartmentName?.toUpperCase()
                  : data.selected}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
