import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppStore } from "#/lib/store-context";
import { useEffect } from "react";
import { KasirSkeleton } from "#/features/kasir";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const navigate = useNavigate();
  const { store } = useAppStore();

  useEffect(() => {
    if (store === undefined) return; // still loading
    if (store === null) {
      navigate({ to: "/onboarding" });
    } else {
      navigate({ to: "/kasir" });
    }
  }, [store, navigate]);

  return <KasirSkeleton />;
}
