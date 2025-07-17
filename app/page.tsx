import dbConnect from "@/lib/database";
import { Page } from "./page.client";

const PageServer = async () => {
  await dbConnect();
  return <Page />;
};

export default PageServer;
