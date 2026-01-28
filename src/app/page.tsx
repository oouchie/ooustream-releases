import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";

export default async function Home() {
  const session = await getCustomerSession();

  if (session) {
    // User is logged in - redirect to dashboard
    redirect("/subscription");
  } else {
    // Not logged in - redirect to login
    redirect("/login");
  }
}
