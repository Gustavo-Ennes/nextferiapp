"use client";

import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
} from "@mui/material";
import { useState } from "react";
import type { ListItemMenuItem, SubMenuItem } from "./types";
import { useRouter } from "next/navigation";
import { usePdfPreview } from "@/context/PdfPreviewContext";

export const ListItemMenu = ({ props }: { props: ListItemMenuItem }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setPdf } = usePdfPreview();
  const router = useRouter();

  const handleDropdownClick = () => setIsDropdownOpen(!isDropdownOpen);

  const handleItemClick = ({ pdfType, href }: SubMenuItem) => {
    if (pdfType) setPdf({ items: [{ type: pdfType }] });
    else if (href) router.push(href);
  };

  return (
    <>
      <ListItemButton onClick={handleDropdownClick} sx={{ my: 1 }}>
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText primary={props.label} />
        {isDropdownOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {props.items.map((prop) => (
            <ListItemButton
              sx={{ pl: 4 }}
              key={`drawer-${props.label}-${prop.itemLabel}`}
              onClick={() => handleItemClick(prop)}
            >
              <ListItemIcon>{prop.itemIcon}</ListItemIcon>
              <ListItemText
                primary={prop.itemLabel}
                slotProps={{
                  primary: { fontSize: 13 },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  );
};
