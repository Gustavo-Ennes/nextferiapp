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
      onCloseAction: () => setConfirmationDialogData(null),
    });
  }, []);

  const closeConfirmationDialog = useCallback(() => {
    setConfirmationDialogData(null);
  }, []);

  const openInputDialog = useCallback((dialogData: DialogOptions) => {
    setInputDialogData({
      ...dialogData,
      openState: true,
      onCloseAction: () => setInputDialogData(null),
    });
  }, []);

  const closeInputDialog = useCallback(() => {
    setInputDialogData(null);
  }, []);

  const openCarDetailDialog = useCallback((dialogData: DialogOptions) => {
    setCarDetailDialogData({
      ...dialogData,
      openState: true,
      onCloseAction: () => setCarDetailDialogData(null),
    });
  }, []);

  const closeCarDetailDialog = useCallback(() => {
    setCarDetailDialogData(null);
  }, []);

  const openSelectDialog = useCallback((dialogData: DialogOptions) => {
    setSelectDialogData({
      ...dialogData,
      openState: true,
      onCloseAction: () => setSelectDialogData(null),
    });
  }, []);

  const closeSelectDialog = useCallback(() => {
    setSelectDialogData(null);
  }, []);

  const handleConfirmationConfirmAction = () => {
    confirmationDialogData?.onConfirmAction?.();
    setConfirmationDialogData(null);
  };

  const handleInputConfirm = (externalInput?: string) => {
    inputDialogData?.onConfirmAction?.(externalInput ?? inputDialogData?.input);
    setInputDialogData(null);
  };

  const handleSelectConfirm = (selectedValue?: string) => {
    selectDialogData?.onConfirmAction?.(selectedValue);
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
        onConfirmAction={handleConfirmationConfirmAction}
        confirmLabel={confirmationDialogData?.confirmLabel}
        onCloseAction={() => confirmationDialogData?.onCloseAction?.()}
        cancelLabel={confirmationDialogData?.cancelLabel}
        openState={confirmationDialogData?.openState ?? false}
        title={confirmationDialogData?.title ?? ""}
      />
      <InputDialog
        confirmLabel={inputDialogData?.confirmLabel}
        cancelLabel={inputDialogData?.cancelLabel}
        openState={inputDialogData?.openState ?? false}
        onCloseAction={() => inputDialogData?.onCloseAction?.()}
        title={inputDialogData?.title ?? ""}
        description={inputDialogData?.description ?? ""}
        onConfirmAction={handleInputConfirm}
        inputLabel={inputDialogData?.inputLabel}
        input={inputDialogData?.input}
      />
      <CarDetailDialog
        car={carDetailDialogData?.car}
        onCloseAction={() => carDetailDialogData?.onCloseAction?.()}
        openState={carDetailDialogData?.openState ?? false}
        title={carDetailDialogData?.car?.prefix.toString() ?? "Detalhes"}
        onConfirmAction={() => undefined}
      />
      <SelectDialog
        options={selectDialogData?.options ?? []}
        onConfirmAction={handleSelectConfirm}
        onCloseAction={() => selectDialogData?.onCloseAction?.()}
        openState={selectDialogData?.openState ?? false}
        title={selectDialogData?.title ?? "Selecione uma opção"}
      />
    </DialogContext.Provider>
  );
};
