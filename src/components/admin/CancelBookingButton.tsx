"use client";

import { useState, useTransition } from "react";
import { cancelBooking } from "@/lib/actions/admin-bookings";

export default function CancelBookingButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return <span className="text-xs text-white/40">Cancelada</span>;

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          if (!confirm("¿Cancelar esta cita?")) return;
          const result = await cancelBooking(id);
          if (result.ok) setDone(true);
        })
      }
      disabled={isPending}
      className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50"
    >
      {isPending ? "Cancelando..." : "Cancelar"}
    </button>
  );
}
