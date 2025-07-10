"use client";

import { CircularProgress } from "@mui/material";
import { Overlay } from "./styled";

export default function Loader() {
  return (
    <Overlay>
      <CircularProgress />
    </Overlay>
  );
}
