import { getCurrentUser } from "@/lib/getCurrentUser";
import HomeClient from "./HomeClient";

export default async function Home() {
  // 🔥 This runs on the server
  await getCurrentUser();

  return <HomeClient />;
}