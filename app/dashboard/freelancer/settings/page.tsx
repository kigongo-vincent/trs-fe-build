import { redirect } from "next/navigation"

export default function FreelancerSettingsRedirect() {
  redirect("/dashboard/settings?tab=freelancer")
}
