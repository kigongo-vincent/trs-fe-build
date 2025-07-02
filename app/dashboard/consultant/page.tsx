import { redirect } from "next/navigation";

export default function ConsultantDashboard() {
  redirect("/dashboard/employee");
  return null;
}
