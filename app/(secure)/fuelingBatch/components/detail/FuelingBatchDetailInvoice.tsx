// FuelingBatchDetailInvoice.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { FuelingBatchDTOInvoice } from "@/dto/FuelingBatchDTO";
import { resolveName, toMonetary } from "../../utils";

export const FuelingBatchDetailInvoices = ({
  invoices,
}: {
  invoices: FuelingBatchDTOInvoice[];
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (invoices.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderColor: "#E2E8F0" }}>
        <Typography variant="body2" color="text.secondary">
          Nenhuma nota fiscal neste lote.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: "#E2E8F0", height: "100%", overflow: "hidden" }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={700}
        color="#1E3A8A"
        sx={{ px: 2, pt: 2, pb: 1 }}
      >
        Notas fiscais
      </Typography>

      <List dense disablePadding>
        {invoices.map((invoice, index) => {
          const isOpen = expanded === index;
          return (
            <Box key={`${invoice.number}-${invoice.series ?? ""}`}>
              <Divider />
              <ListItemButton
                onClick={() => setExpanded(isOpen ? null : index)}
                sx={{
                  py: 1,
                  minWidth: 0,
                  bgcolor: isOpen ? "#EFF6FF" : "transparent",
                }}
              >
                <ListItemText
                  sx={{ minWidth: 0 }}
                  primary={`NF ${invoice.number}${invoice.series ? `/${invoice.series}` : ""}`}
                  secondary={resolveName(invoice.department)}
                  slotProps={{
                    primary: {
                      fontWeight: 600,
                      variant: "body2",
                      noWrap: true,
                    },
                    secondary: { variant: "caption", noWrap: true },
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ flexShrink: 0 }}
                >
                  <Typography variant="body2" fontWeight={700} color="#2563EB">
                    {toMonetary(invoice.total)}
                  </Typography>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      color: "#2563EB",
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </Stack>
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    px: 2,
                    pb: 1.5,
                    bgcolor: "#F8FAFC",
                    overflowX: "auto",
                  }}
                >
                  <Table size="small" sx={{ minWidth: 280 }}>
                    <TableBody>
                      {invoice.items.map((item, itemIndex) => (
                        <TableRow
                          key={itemIndex}
                          sx={{ "&:last-child td": { border: 0 } }}
                        >
                          <TableCell sx={{ pl: 0, maxWidth: 160 }}>
                            <Typography variant="body2" noWrap>
                              {resolveName(item.fuel)}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {item.quantity.toFixed(3)} L
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ pr: 0, whiteSpace: "nowrap" }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="#2563EB"
                            >
                              {toMonetary(item.total)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Paper>
  );
};
