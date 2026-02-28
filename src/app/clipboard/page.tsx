import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ClipboardManager } from "@/components/clipboard/ClipboardManager";

export default async function ClipboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ClipboardManager />;
}
