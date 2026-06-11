"use client";

import { useRouter } from "next/navigation";

interface Props {
  fecha: string;
  basePath: string;
}

export default function DateFilter({ fecha, basePath }: Props) {
  const router = useRouter();
  return (
    <input
      type="date"
      defaultValue={fecha}
      onChange={(e) => router.push(`${basePath}?fecha=${e.target.value}`)}
      className="border border-gray-300 rounded px-3 py-1.5 text-sm"
    />
  );
}
