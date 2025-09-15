'use client';

import { Backdrop } from "@mui/material";
import "./loading.css";


export const Loader = ({ isLoading }: { isLoading: boolean }) => {

  return (
    <Backdrop
      sx={(theme) => ({
        color: "#fff",
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: "rgba(25, 44, 160, 0.4)",
      })}
      open={isLoading}
      onClick={() => undefined}
    >
      <div className="loader"></div>
    </Backdrop>
  );
};
