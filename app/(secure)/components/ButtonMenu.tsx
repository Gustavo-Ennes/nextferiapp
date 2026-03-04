"use client";

import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import {
  Menu,
  MenuItem as MuiMenuItem,
  Tooltip,
  type ButtonProps,
} from "@mui/material";
import React, { useState, cloneElement, type ReactElement } from "react";
import type { MenuItem } from "./types";
import type { VacationDTO, WorkerDTO } from "@/dto";

interface ButtonMenuProps {
  items: MenuItem[];
  vacation: VacationDTO;
  trigger: ReactElement<ButtonProps>;
}

export const ButtonMenu = ({ items, vacation, trigger }: ButtonMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleClick = (
    event: React.MouseEvent<HTMLLIElement, globalThis.MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (
    action: () => void,
    e: React.MouseEvent<HTMLLIElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    handleClose();
  };

  const isWorkerInactive =
    (vacation.worker as WorkerDTO)?.isActive === false || !vacation.worker;

  const triggerWithProps = cloneElement(trigger as ReactElement<any>, {
    endIcon: isMenuOpen ? (
      <ArrowDropUp />
    ) : (
      <ArrowDropDown sx={{ color: "#000" }} />
    ),
    onClick: (e: React.MouseEvent<HTMLLIElement, globalThis.MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      handleClick(e);
    },
    "aria-controls": isMenuOpen ? "customized-menu" : undefined,
    "aria-haspopup": "true",
    "aria-expanded": isMenuOpen ? "true" : undefined,
  });

  return (
    <>
      {isWorkerInactive ? (
        <Tooltip title="Não será possível remarcar: trabalhador inativo">
          <span style={{ display: "inline-block" }}>{triggerWithProps}</span>
        </Tooltip>
      ) : (
        triggerWithProps
      )}

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        slotProps={{
          backdrop: {
            onClick: (e) => {
              e.stopPropagation();
              handleClose();
            },
          },
        }}
      >
        {items.map(({ label, action, disabled }) => (
          <MuiMenuItem
            key={`button-menu-${label}`}
            onClick={(e) => handleAction(action, e)}
            disabled={disabled}
          >
            {label}
          </MuiMenuItem>
        ))}
      </Menu>
    </>
  );
};
