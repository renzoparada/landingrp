import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Resumen", icon: "📊" },
  { href: "/admin/leads", label: "Leads", icon: "🗂️" },
  { href: "/admin/reservas", label: "Reservas", icon: "📅" },
  { href: "/admin/campanas", label: "Campañas", icon: "🚀" },
  { href: "/admin/preguntas", label: "Preguntas del quiz", icon: "❓" },
  { href: "/admin/disponibilidad", label: "Disponibilidad", icon: "🕒" },
  { href: "/admin/contenido", label: "Contenido de la landing", icon: "🎨" },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0b0713] text-white flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 font-bold text-lg mb-8">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-sky-400" />
          Admin
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <span className="text-xs text-white/40 truncate">{session.email}</span>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile top nav */}
        <div className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0b0713]/95 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2 font-bold">Admin</div>
          <LogoutButton />
        </div>
        <div className="md:hidden flex gap-1 overflow-x-auto scrollbar-none border-b border-white/10 px-3 py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <main className="p-5 sm:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
