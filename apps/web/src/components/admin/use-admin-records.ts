"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { api, ApiError } from "@/services/api";
import { fetchPage, type PageMeta } from "@/services/workspace";

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load records.";
}

export function useAdminRecords<Source, View>(path: string, map: (x: Source) => View, paginated = true, initialPage = 1, limit = 20) {
  const [records, setRecords] = useState<View[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    setPage(1);
    setRecords([]);
    setMeta(undefined);
    setError("");
  }, [path]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (paginated) {
        const result = await fetchPage<Source>(path, page, limit);
        setRecords(result.items.map(map));
        setMeta(result.meta);
      } else {
        const result = await api<Source[]>(path);
        setRecords(result.map(map));
        setMeta(undefined);
      }
    } catch (loadError) {
      setRecords([]);
      setMeta(undefined);
      setError(messageOf(loadError));
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, [path, map, paginated, page, limit]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    let active = true;

    void load().catch((loadError) => {
      if (!active) return;

      if (loadError instanceof ApiError && loadError.status === 401) {
        router.replace("/login");
        return;
      }

      toast.error(messageOf(loadError));
    });

    return () => {
      active = false;
    };
  }, [load, toast, router]);

  return [records, setRecords, refresh, meta, setPage, page, loading, error] as const;
}
