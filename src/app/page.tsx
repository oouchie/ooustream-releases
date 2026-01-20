import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to login page - auth middleware will handle routing
  redirect("/login");
}
