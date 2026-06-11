"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RefreshAuto({ intervaloSeg = 30 }: { intervaloSeg?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), intervaloSeg * 1000);
    return () => clearInterval(t);
  }, [router, intervaloSeg]);
  return null;
}
