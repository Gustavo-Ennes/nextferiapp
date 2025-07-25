// import { afterInit } from "@/script/afterInit";
import { redirect } from "next/navigation";

async function Page() {
  // await afterInit()
  return redirect("/info");
}

export default Page;
