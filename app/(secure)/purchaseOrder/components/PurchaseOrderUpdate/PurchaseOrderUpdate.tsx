"use client";

import { Grid, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { sortByReference } from "../../utils";
import { PurchaseOrderUpdateProgressHeader } from "./PurchaseOrderUpdateHeader";
import { PurchaseOrderUpdateOrderCard } from "./PurchaseOrderUpdateOrderCard";
import { PurchaseOrderUpdateBatchAction } from "./PurchaseOrderUpdateBatchAction";
import { PurchaseOrderUpdateOrderSidebar } from "./PurchaseOrderUpdateOrderSidebar";
import type {
  ItemDraft,
  PurchaseOrderUpdateProps,
  SidebarEntry,
  SidebarStatus,
} from "../../types";
import type {
  PurchaseOrderDTO,
  FuelDTO,
  FuelPriceVersionDTO,
  SupplierDTO,
} from "@/dto";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { useRouter } from "@/context/RouterContext";

export const PurchaseOrderUpdatePage = ({
  orders,
  suppliers,
}: PurchaseOrderUpdateProps) => {
  const { setLoading } = useLoading();
  const { addSnack } = useSnackbar();
  const { setPdf } = usePdfPreview();
  const { redirectWithLoading } = useRouter();

  const [supplier, setSupplier] = useState(suppliers[0]._id ?? "");
  const inputRefs = {
    fuel0: useRef<HTMLInputElement>(null),
    fuel1: useRef<HTMLInputElement>(null),
    fuel2: useRef<HTMLInputElement>(null),
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<PurchaseOrderDTO | null>(
    null,
  );
  const [drafts, setDrafts] = useState<PurchaseOrderDTO[]>([]);
  const [queue, setQueue] = useState<PurchaseOrderDTO[]>([]);
  const [sidebar, setSidebar] = useState<SidebarEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outdatedFilter, setOutdatedFilter] = useState(false);
  const [lowBalanceFilter, setLowBalanceFilter] = useState(false);

  const sorted = useMemo(() => {
    let filtered: PurchaseOrderDTO[] = [];
    filtered = orders.filter(
      (o) => (o.supplier as SupplierDTO)._id === supplier,
    );
    if (outdatedFilter)
      filtered = filtered.filter(
        (f) => f.outdated === "some" || f.outdated === "none",
      );
    if (lowBalanceFilter)
      filtered = filtered.filter(
        (f) => f.lowBalance === "some" || f.lowBalance === "none",
      );

    const refSorted = sortByReference(filtered);

    return refSorted;
  }, [supplier, orders, outdatedFilter, lowBalanceFilter]);

  useEffect(() => {
    setCurrentIndex(0);
    setCurrentOrder(sorted[0] ?? null);
    setSidebar(
      sorted.map((o) => ({
        orderId: String(o._id),
        reference: o.reference,
        status: "pending" as SidebarStatus,
      })),
    );

    setDrafts([]);
    setQueue([]);
  }, [sorted]);

  const currentId = currentOrder ? String(currentOrder._id) : null;
  const currentDraft =
    drafts.find((d) => String(d._id) === currentId) ?? currentOrder;
  const reviewedCount = sidebar.filter((e) => e.status !== "pending").length;
  const allDecided = reviewedCount === sorted.length;
  const currentStatus = sidebar[currentIndex]?.status;

  const navigateTo = (idx: number) => {
    setCurrentIndex(idx);
    setCurrentOrder(sorted[idx]);
  };

  const updateItemQty = (itemIndex: number, value: number) => {
    const updatedItems = currentDraft?.items.map((item, i) =>
      i === itemIndex ? { ...item, quantity: value } : item,
    );
    const updatedOrder: PurchaseOrderDTO | null = currentDraft
      ? {
          ...currentDraft,
          items: updatedItems ?? [],
        }
      : null;

    if (updatedOrder)
      setDrafts((prev) => {
        const idx = prev.findIndex((d) => String(d._id) === currentId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedOrder;
          return next;
        }
        return [...prev, updatedOrder];
      });
  };

  const updateSidebar = (orderId: string, patch: Partial<SidebarEntry>) => {
    setSidebar((prev) =>
      prev.map((e) => (e.orderId === orderId ? { ...e, ...patch } : e)),
    );
  };

  const handleKeep = () => {
    if (!currentId) return;

    updateSidebar(currentId, { status: "kept" });
    if (currentIndex < sorted.length - 1) navigateTo(currentIndex + 1);
  };

  const handleAdd = () => {
    const itemDrafts: ItemDraft[] = currentOrder
      ? currentOrder.items.map((original, i) => {
          const fuel = original.fuel as FuelDTO;
          return {
            fuelId: String(fuel._id),
            fuelName: fuel.name,
            unit: fuel.unit,
            oldQty: original.quantity,
            newQty: currentDraft?.items[i]?.quantity ?? original.quantity,
          };
        })
      : [];

    if (itemDrafts.length > 0 && currentId && currentDraft) {
      setQueue((prev) => {
        const idx = prev.findIndex((d) => String(d._id) === currentId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = currentDraft;
          return next;
        }
        return [...prev, currentDraft];
      });

      updateSidebar(currentId, { status: "queued", items: itemDrafts });
      if (currentIndex < sorted.length - 1) {
        navigateTo(currentIndex + 1);
        inputRefs["fuel0"]?.current?.select();
        inputRefs["fuel0"]?.current?.focus();
      }
    }
  };

  const handleBatchUpdate = async () => {
    if (queue.length === 0) return;
    setLoading(true);
    setIsSubmitting(true);

    let successCount = 0;
    const errors: string[] = [];

    for (const order of queue) {
      const orderId = String(order._id);
      try {
        const res = await fetch(`/api/purchaseOrder/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: order.items.map((it) => ({
              fuel: (it.fuel as FuelDTO)._id,
              fuelPriceVersion: (it.fuelPriceVersion as FuelPriceVersionDTO)
                ._id,
              quantity: it.quantity,
              price: 0,
            })),
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        successCount++;
        updateSidebar(orderId, { status: "success" });
      } catch (err) {
        const msg = `${order.reference}: ${
          err instanceof Error ? err.message : "erro desconhecido"
        }`;
        errors.push(msg);
        updateSidebar(orderId, { status: "error", errorMsg: msg });
      }
    }

    setIsSubmitting(false);
    setLoading(false);

    if (errors) {
      const warning = errors.join(", ");
      console.warn(warning);
    }

    setPdf({ items: [{ type: "purchaseOrder" }] });

    addSnack({
      severity: errors.length > 0 ? "error" : "success",
      message:
        `${successCount} pedido(s) atualizado(s) com sucesso.` +
        (errors.length > 0 ? ` ${errors.length} erro(s).` : ""),
    });

    redirectWithLoading("/purchaseOrder");
  };

  return (
    <Grid container spacing={3} sx={{ p: 3, width: "100%", height: "100%" }}>
      {/* ── PROGRESSO ── */}
      <Grid size={12}>
        <PurchaseOrderUpdateProgressHeader
          reviewed={reviewedCount}
          total={sorted.length}
          suppliers={suppliers}
          setSupplier={setSupplier}
          selectedSupplier={supplier} //colocar radios para filtrar os low balance e os outdated
        />
      </Grid>

      {/* ── FORM ── */}
      <Grid
        size={{ xs: 12, md: 8 }}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {currentOrder && currentDraft && (
          <PurchaseOrderUpdateOrderCard
            order={currentOrder}
            draft={currentDraft}
            index={currentIndex}
            total={sorted.length}
            status={currentStatus}
            onQtyChange={updateItemQty}
            onKeep={handleKeep}
            onAdd={handleAdd}
            inputRefs={inputRefs}
            lowBalanceFilter={lowBalanceFilter}
            outdatedFilter={outdatedFilter}
          />
        )}

        {allDecided ? (
          <PurchaseOrderUpdateBatchAction
            queueCount={queue.length}
            keptCount={sidebar.filter((e) => e.status === "kept").length}
            isSubmitting={isSubmitting}
            onSubmit={handleBatchUpdate}
          />
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            {sorted.length - reviewedCount} pedido(s) restante(s) — revise todos
            para liberar a atualização em lote.
          </Typography>
        )}
      </Grid>

      {/* ── SIDEBAR ── */}
      <Grid
        size={{ xs: 12, md: 4 }}
        sx={{
          display: "flex",
          position: "sticky",
          top: 16,
          height: "fit-content",
          maxHeight: "80vh",
        }}
      >
        <PurchaseOrderUpdateOrderSidebar
          entries={sidebar}
          currentIndex={currentIndex}
          onNavigate={navigateTo}
          setOutdated={setOutdatedFilter}
          setLowBalance={setLowBalanceFilter}
        />
      </Grid>
    </Grid>
  );
};
