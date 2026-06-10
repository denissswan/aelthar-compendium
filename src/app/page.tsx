import { redirect } from "next/navigation";

export default function RootPage() {
  // The 3 tabs are the real entry points; open on Characters.
  redirect("/characters");
}
