"use client";

import { useRouter } from "@/context/RouterContext";
import { useEffect } from "react";

export default function materialRequisitionPage() {
  const router = useRouter();

  useEffect(() => {
    router.redirectWithLoading("materialRequisition/form");
  }, []);
}
