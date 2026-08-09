"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/admin-auth";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await logout();
        router.push("/admin/login");
        router.refresh();
      }}
      className="text-sm text-white/50 hover:text-white transition"
    >
      Cerrar sesión
    </button>
  );
}
