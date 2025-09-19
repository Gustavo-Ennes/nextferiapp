"use client";

import { useRouter } from "next/navigation";
import { getLocalStorageData } from "./(secure)/materialRequisition/utils";

function Page() {
  const router = useRouter();
  getLocalStorageData().then(({ lastPage }) =>
    router.push(lastPage ?? "/info")
  );
}

export default Page;
