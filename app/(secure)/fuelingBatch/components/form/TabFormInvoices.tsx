"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import type {
  DepartmentDTO,
  FuelPriceVersionDTO,
  FuelingBatchDTOInvoiceItem,
  PurchaseOrderDTO,
  FuelDTO,
} from "@/dto";
import type { FuelingBatchInvoicePanelProps } from "../types";
import {
  getInvoicesTotalFuels,
  invoiceExists,
  resolveName,
  toMonetary,
} from "../../utils";
import { useEffect } from "react";
import { flatten, pluck, prop, uniqBy } from "ramda";
import { useDialog } from "@/context/DialogContext";

export const FuelingBatchFormInvoices = ({
  fuelingBatchDepartment,
  fuelingBatchInvoices,
  onAddInvoiceAction,
  onRemoveInvoiceAction,
  purchaseOrders,
  fuels,
}: FuelingBatchInvoicePanelProps) => {
  const { openConfirmationDialog } = useDialog();
  const [number, setNumber] = useState("");
  const [series, setSeries] = useState("");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [draftItems, setDraftItems] = useState<FuelingBatchDTOInvoiceItem[]>(
    [],
  );
  const [itemFuel, setItemFuel] = useState("");
  const [itemPriceVersion, setItemPriceVersion] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemTotal, setItemTotal] = useState("");

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const invoicesTotals = useMemo(() => {
    const totals = getInvoicesTotalFuels(
      fuelingBatchDepartment.invoices,
      fuels,
    );
    return totals;
  }, [fuelingBatchDepartment]);

  const selectedFuel = useMemo(
    () => fuels.find((f) => f._id === itemFuel),
    [itemFuel, fuels],
  );

  const selectedPurchaseOrder = useMemo(() => {
    const foundPurchaseOrder = purchaseOrders.find(
      (p) => (p as PurchaseOrderDTO)._id === purchaseOrder,
    );
    return foundPurchaseOrder
      ? (foundPurchaseOrder as PurchaseOrderDTO)
      : undefined;
  }, [purchaseOrder]);

  const filteredFuels = useMemo(() => {
    const fuels = flatten(
      pluck("fuel", selectedPurchaseOrder?.items ?? []),
    ) as FuelDTO[];
    return fuels ? uniqBy(prop("_id"), fuels) : [];
  }, [purchaseOrder]);

  const fuelPriceVersions = useMemo(() => {
    const versions = flatten(
      pluck("fuelPriceVersion", selectedPurchaseOrder?.items ?? []),
    ) as FuelPriceVersionDTO[];
    return itemFuel ? versions.filter((v) => v.fuel === itemFuel) : versions;
  }, [selectedFuel]);

  const selectedFuelPriceVersion = useMemo(() => {
    const version = fuelPriceVersions.find(
      (f) => (f as FuelPriceVersionDTO)._id === itemPriceVersion,
    );
    return version ? (version as FuelPriceVersionDTO) : undefined;
  }, [itemPriceVersion, itemFuel, itemQuantity]);

  const isInvoiceNumberDuplicated = useMemo(() => {
    return (
      !!number &&
      invoiceExists({ invoiceNumber: number, invoices: fuelingBatchInvoices })
    );
  }, [number, fuelingBatchDepartment.invoices]);

  const handleAddItem = () => {
    const qty = Number(itemQuantity);
    const total = Number(itemTotal);
    if (!itemFuel || !itemPriceVersion || !qty || !total) return;

    setDraftItems((prev) => [
      ...prev,
      {
        fuel: itemFuel,
        fuelPriceVersion: itemPriceVersion,
        quantity: qty,
        total,
      },
    ]);
    setItemFuel("");
    setItemPriceVersion("");
    setItemQuantity("");
    setItemTotal("");
    setPurchaseOrder;
  };

  const handleRemoveItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddInvoice = () => {
    if (!number || draftItems.length === 0 || isInvoiceNumberDuplicated) return;

    onAddInvoiceAction({
      purchaseOrder,
      department:
        (fuelingBatchDepartment.department as DepartmentDTO)?._id ?? "",
      number: Number(number),
      series: series || undefined,
      total: draftItems.reduce((sum, item) => sum + item.total, 0),
      items: draftItems,
    });

    setNumber("");
    setSeries("");
    setDraftItems([]);
  };

  const handleOpenRemoveInvoiceDialog = (invoiceNumber: number) => {
    openConfirmationDialog({
      onConfirmAction: () => onRemoveInvoiceAction(invoiceNumber),
      title: `Deseja exclui a nota ${invoiceNumber}?`,
      confirmLabel: "Deletar nota",
      cancelLabel: "Voltar",
      description: `Ao deletar notas é possível que você não consiga adicionar abastecimentos para os combustíveis da nota. É necessário que haja a quantidade adequada de litragem nas notas correspondente aos abastecimentos já existentes.`,
    });
  };

  useEffect(() => {
    if (
      itemFuel &&
      itemPriceVersion &&
      itemQuantity &&
      selectedFuelPriceVersion
    ) {
      const total = String(
        selectedFuelPriceVersion.price * Number(itemQuantity),
      );
      setItemTotal(total);
    }
  }, [itemFuel, itemPriceVersion, itemQuantity]);

  const shouldDisableAddInvoiceItem =
    !number ||
    isInvoiceNumberDuplicated ||
    !purchaseOrder ||
    !itemFuel ||
    !itemQuantity ||
    !itemPriceVersion;

  return (
    <Paper
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Metade superior: formulário */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Nova nota
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          <TextField
            label="Nº"
            size="small"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            error={isInvoiceNumberDuplicated}
            helperText={
              isInvoiceNumberDuplicated ? `Nota número ${number} já existe` : ""
            }
            sx={{ width: "40%" }}
          />
          <TextField
            label="Série"
            size="small"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            sx={{ width: "60%" }}
          />
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" spacing={1}>
          <TextField
            select
            label="Pedido"
            size="small"
            value={purchaseOrder}
            disabled={!number || draftItems.length > 0}
            onChange={(e) => {
              setPurchaseOrder(e.target.value);
            }}
            sx={{ width: "35%" }}
          >
            {purchaseOrders.map((po) => {
              return (
                <MenuItem key={po._id} value={po._id}>
                  {po.reference}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            select
            label="Combustível"
            size="small"
            value={itemFuel}
            onChange={(e) => {
              setItemFuel(e.target.value);
            }}
            sx={{ width: "35%" }}
          >
            {filteredFuels.map((fuel) => {
              return (
                <MenuItem key={fuel._id} value={fuel._id}>
                  {fuel.name}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            select
            label="Preço"
            size="small"
            value={itemPriceVersion}
            disabled={!itemFuel}
            onChange={(e) => setItemPriceVersion(e.target.value)}
            sx={{ width: "25%" }}
          >
            {fuelPriceVersions.map((version) => {
              const v = version as FuelPriceVersionDTO;
              return (
                <MenuItem key={v._id} value={v._id}>
                  {toMonetary(v.price)}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            label="Litros"
            size="small"
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
            sx={{ width: "20%" }}
          />
          <TextField
            label="Total"
            size="small"
            type="number"
            value={itemTotal}
            aria-readonly
            sx={{ width: "20%" }}
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleAddItem}
            disabled={shouldDisableAddInvoiceItem}
            color="primary"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>

        {draftItems.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 0.5 }}
          >
            {draftItems.map((item, index) => (
              <Chip
                key={index}
                size="small"
                label={`${resolveName(item.fuel)} · ${item.quantity.toFixed(3)} L`}
                onDelete={() => handleRemoveItem(index)}
                deleteIcon={<CloseIcon fontSize="small" />}
              />
            ))}
          </Stack>
        )}

        <Button
          fullWidth
          size="small"
          variant="contained"
          sx={{ mt: 1 }}
          disabled={draftItems.length === 0}
          onClick={handleAddInvoice}
        >
          Adicionar nota
        </Button>
      </Box>

      <Divider />

      {/* Metade inferior: notas já adicionadas */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {fuelingBatchDepartment.invoices.length === 0 ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ p: 1.5, display: "block" }}
          >
            Nenhuma nota adicionada.
          </Typography>
        ) : (
          fuelingBatchDepartment.invoices.map((invoice, index) => {
            const isOpen = expandedIndex === index;

            return (
              <Accordion
                key={`${invoice.number}-${invoice.series ?? ""}`}
                expanded={isOpen}
                onChange={() => setExpandedIndex(isOpen ? null : index)}
                disableGutters
                square
                sx={{ "&:before": { display: "none" }, boxShadow: "none" }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon fontSize="small" />}
                  sx={{ minHeight: 36, px: 1.5 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ width: "100%", pr: 1 }}
                  >
                    <Typography variant="body2">
                      NF {invoice.number}
                      {invoice.series ? `/${invoice.series}` : ""}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {toMonetary(invoice.total)}
                    </Typography>
                    <CloseIcon
                      onClick={() =>
                        handleOpenRemoveInvoiceDialog(invoice.number)
                      }
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1 }}>
                  <Stack spacing={0.25}>
                    {invoice.items.map((item, i) => {
                      return (
                        <Stack
                          key={i}
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography variant="caption">
                            {resolveName(
                              fuels.find((f) => f._id === item.fuel),
                            )}
                          </Typography>
                          <Typography variant="caption">
                            {item.quantity.toFixed(3)} L ·{" "}
                            {toMonetary(item.total)}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      <Divider />

      {/* Footer: totais por combustível — comprado x usado em abastecimentos */}
      <Box sx={{ p: 1.5 }}>
        {Object.keys(invoicesTotals).length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Sem totais ainda.
          </Typography>
        ) : (
          <Stack spacing={0.75}>
            {Object.entries(invoicesTotals).map(([fuelName, { liters }]) => {
              const used = fuelingBatchDepartment.totals.totalFuels[
                fuelName
              ] ?? { liters: 0, value: 0 };

              const pct =
                liters > 0 ? Math.min(100, (used.liters / liters) * 100) : 0;
              return (
                <Box key={fuelName}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" fontWeight={600}>
                      {fuelName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {used.liters.toFixed(3)} / {liters.toFixed(3)} L
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ height: 4, borderRadius: 1, my: 0.25 }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};
