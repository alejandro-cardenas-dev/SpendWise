import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard"); // the protected layout sends guests on to /login
}