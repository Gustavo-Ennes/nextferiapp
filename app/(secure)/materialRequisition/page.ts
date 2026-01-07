"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function materialRequisitionPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("materialRequisition/form");
  }, []);
}
