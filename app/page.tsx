"use client";

import { useRouter } from "@/context/RouterContext";
import { getLocalStorageData } from "./(secure)/materialRequisition/utils";

function Page() {
  const router = useRouter();

  getLocalStorageData().then(({ lastPage }) => {
    router.redirectWithLoading(lastPage ?? "/info");
  });
}

export default Page;
