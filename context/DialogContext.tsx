"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { type DialogContextType, type DialogOptions } from "./types";
import { ConfirmationDialog } from "@/app/(secure)/components/dialogs/ConfirmationDialog";
import { InputDialog } from "@/app/(secure)/components/dialogs/InputDialog";
import { CarDetailDialog } from "@/app/(secure)/components/dialogs/CarDetailDialog";
import { SelectDialog } from "@/app/(secure)/components/dialogs/SelectDialog";

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside DialogProvider");
  return ctx;
};

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [confirmationDialogData, setConfirmationDialogData] =
    useState<DialogOptions | null>(null);
  const [inputDialogData, setInputDialogData] = useState<DialogOptions | null>(
    null,
  );
  const [carDetailDialogData, setCarDetailDialogData] =
    useState<DialogOptions | null>(null);

  const [selectDialogData, setSelectDialogData] =
    useState<DialogOptions | null>(null);

  const openConfirmationDialog = useCallback((dialogData: DialogOptions) => {
    setConfirmationDialogData({
      ...dialogData,
      openState: true,
      onClose: () => setConfirmationDialogData(null),
    });
  }, []);

  const closeConfirmationDialog = useCallback(() => {
    setConfirmationDialogData(null);
  }, []);

  const openInputDialog = useCallback((dialogData: DialogOptions) => {
    setInputDialogData({
      ...dialogData,
      openState: true,
      onClose: () => setInputDialogData(null),
    });
  }, []);

  const closeInputDialog = useCallback(() => {
    setInputDialogData(null);
  }, []);

  const openCarDetailDialog = useCallback((dialogData: DialogOptions) => {
    setCarDetailDialogData({
      ...dialogData,
      openState: true,
      onClose: () => setCarDetailDialogData(null),
    });
  }, []);

  const closeCarDetailDialog = useCallback(() => {
    setCarDetailDialogData(null);
  }, []);

  const openSelectDialog = useCallback((dialogData: DialogOptions) => {
    setSelectDialogData({
      ...dialogData,
      openState: true,
      onClose: () => setSelectDialogData(null),
    });
  }, []);

  const closeSelectDialog = useCallback(() => {
    setSelectDialogData(null);
  }, []);

  const handleConfirmationConfirm = () => {
    confirmationDialogData?.onConfirm?.();
    setConfirmationDialogData(null);
  };

  const handleInputConfirm = (externalInput?: string) => {
    inputDialogData?.onConfirm?.(externalInput ?? inputDialogData?.input);
    setInputDialogData(null);
  };

  const handleSelectConfirm = (selectedValue?: string) => {
    selectDialogData?.onConfirm?.(selectedValue);
    setSelectDialogData(null);
  };

  return (
    <DialogContext.Provider
      value={{
        openConfirmationDialog,
        closeConfirmationDialog,
        openInputDialog,
        closeInputDialog,
        openCarDetailDialog,
        closeCarDetailDialog,
        openSelectDialog,
        closeSelectDialog,
        confirmationDialogData,
        inputDialogData,
        carDetailDialogData,
        selectDialogData,
      }}
    >
      {children}

      <ConfirmationDialog
        description={confirmationDialogData?.description}
        onConfirm={handleConfirmationConfirm}
        confirmLabel={confirmationDialogData?.confirmLabel}
        onClose={() => confirmationDialogData?.onClose?.()}
        cancelLabel={confirmationDialogData?.cancelLabel}
        openState={confirmationDialogData?.openState ?? false}
        title={confirmationDialogData?.title ?? ""}
      />
      <InputDialog
        confirmLabel={inputDialogData?.confirmLabel}
        cancelLabel={inputDialogData?.cancelLabel}
        openState={inputDialogData?.openState ?? false}
        onClose={() => inputDialogData?.onClose?.()}
        title={inputDialogData?.title ?? ""}
        description={inputDialogData?.description ?? ""}
        onConfirm={handleInputConfirm}
        inputLabel={inputDialogData?.inputLabel}
        input={inputDialogData?.input}
      />
      <CarDetailDialog
        car={carDetailDialogData?.car}
        onClose={() => carDetailDialogData?.onClose?.()}
        openState={carDetailDialogData?.openState ?? false}
        title={carDetailDialogData?.car?.prefix.toString() ?? "Detalhes"}
        onConfirm={() => undefined}
      />
      <SelectDialog
        options={selectDialogData?.options ?? []}
        onConfirm={handleSelectConfirm}
        onClose={() => selectDialogData?.onClose?.()}
        openState={selectDialogData?.openState ?? false}
        title={selectDialogData?.title ?? "Selecione uma opção"}
      />
    </DialogContext.Provider>
  );
};
