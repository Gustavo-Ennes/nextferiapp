import { redirect } from "next/navigation";

async function Page() {
  return redirect("/info");
}

export default Page;
