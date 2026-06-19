import { useEffect, useState } from "react";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { DashboardAccount } from "@/lib/account-store.server";

export function useAccountDashboard(initialDashboard?: DashboardAccount) {
  const [dashboard, setDashboard] = useState<DashboardAccount | undefined>(initialDashboard);

  useEffect(() => {
    let cancelled = false;

    if (!initialDashboard) {
      void getAccountDashboard().then((data) => {
        if (!cancelled) {
          setDashboard(data);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [initialDashboard]);

  return dashboard;
}
