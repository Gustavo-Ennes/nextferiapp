"use client";

import { useDialog } from "@/context/DialogContext";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import type { VacationDTO, WorkerDTO } from "@/dto";
import { useRouter } from "next/navigation";
import type { MenuItem } from "../../components/types";
import { ButtonMenu } from "../../components/ButtonMenu";
import { Button } from "@mui/material"; // Importe o Button para o trigger
import type { ReactElement } from "react";

export const CancelListButton = ({
  vacation,
  button,
}: {
  vacation: VacationDTO;
  button?: ReactElement;
}) => {
  const { openInputDialog } = useDialog();
  const { setPdf } = usePdfPreview();
  const router = useRouter();
  const url = `/api/vacation/${vacation._id as string}`;

  // Lógica para verificar se o worker está ativo (evita repetição)
  const isWorkerInactive =
    !(vacation.worker as WorkerDTO)?.isActive || !vacation.worker;

  const cancelVacation = async ({
    option,
    withPdf,
    obs,
  }: {
    option: "cancel" | "reschedule";
    withPdf?: boolean;
    obs?: string;
  }) => {
    const body: Partial<VacationDTO> = { cancelled: true, observation: obs };

    await fetch(url, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const vacationsUrl = `/vacation${
      vacation.type !== "normal" ? `/${vacation.type}` : ""
    }`;
    const createVacationUrl = `/vacation/form?type=${
      vacation.type
    }&isReschedule=true&id=${vacation._id}&cancellationPdf=${withPdf}`;

    router.push(option === "reschedule" ? createVacationUrl : vacationsUrl);

    if (withPdf) {
      setPdf({
        items: [{ type: "cancellation", id: vacation._id as string }],
        open: false,
      });
    }
  };

  const cancelMenuItems: MenuItem[] = [
    {
      label: "Cancelar",
      action: () =>
        openInputDialog({
          title: "Cancelar folga",
          description: "Deseja cancelar essa folga?",
          onConfirm: async (obs) => cancelVacation({ option: "cancel", obs }),
          confirmLabel: "Cancelar",
          inputLabel: "Observação",
        }),
      disabled: false,
    },
    {
      label: "Cancelar com requisição",
      action: () =>
        openInputDialog({
          title: "Cancelar e imprimir requisição de cancelamento",
          description: "Deseja cancelar e imprimir a requisição para o RH?",
          onConfirm: async (obs) =>
            cancelVacation({ option: "cancel", withPdf: true, obs }),
          confirmLabel: "Cancelar e imprimir",
          inputLabel: "Observação",
        }),
      disabled: false,
    },
    {
      label: "Remarcar",
      action: () =>
        openInputDialog({
          title: "Remarcar",
          description:
            "Deseja cancelar(sem requerimento RH) e remarcar essa folga?",
          onConfirm: async (obs) =>
            cancelVacation({ option: "reschedule", obs }),
          confirmLabel: "Remarcar",
          inputLabel: "Observação",
        }),
      disabled: isWorkerInactive,
    },
    {
      label: "Remarcar com requisição",
      action: () =>
        openInputDialog({
          title: "Remarcar com requisição",
          description:
            "Deseja cancelar com requerimento para o RH e remarcar essa folga?",
          onConfirm: async (obs) =>
            cancelVacation({ option: "reschedule", withPdf: true, obs }),
          confirmLabel: "Remarcar e imprimir",
          inputLabel: "Observação",
        }),
      disabled: isWorkerInactive,
    },
  ];

  /**
   * Definimos o trigger aqui.
   * Se o worker estiver inativo, passamos o botão com disabled={true}.
   * O ButtonMenu cuidará de envolver isso no Tooltip.
   */
  const customTrigger = button ?? (
    <Button
      variant="contained"
      color="error"
      disabled={isWorkerInactive}
      sx={{ zIndex: 2 }}
    >
      Cancelar / Remarcar
    </Button>
  );

  return (
    <ButtonMenu
      items={cancelMenuItems}
      vacation={vacation}
      trigger={customTrigger}
    />
  );
};
