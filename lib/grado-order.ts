// Orden jerárquico de grados militares (menor número = mayor rango)
const ORDEN: Record<string, number> = {
  CY: 1,
  CR: 2,
  TC: 3,
  MY: 4,
  CT: 5,  // Capitán Técnico
  CP: 5,  // Capitán (alias)
  TP: 6,  // Teniente Primero
  TT: 7,  // Teniente
  ST: 8,  // Subteniente
  SM: 9,  // Suboficial Mayor
  SP: 10, // Suboficial Principal
  SA: 11, // Sargento Ayudante
  SG: 12, // Sargento
  SI: 13, // Sargento (variante)
  CB: 14, // Cabo
  VP: 15, // Voluntario de Primera
  VS: 16, // Voluntario de Segunda
  SV: 17, // Soldado Voluntario
  CAPELLAN: 90,
  VII: 91,
  VI: 92,
  V: 93,
  IV: 94,
  III: 95,
  II: 96,
  CI: 99, // al final
};

export function ordenGrado(grado: string): number {
  const prefijo = grado.trim().split(/\s+/)[0].toUpperCase();
  return ORDEN[prefijo] ?? 50;
}

export function sortPorGrado<T>(arr: T[], getGrado: (item: T) => string, getNombre: (item: T) => string): T[] {
  return [...arr].sort((a, b) => {
    const diff = ordenGrado(getGrado(a)) - ordenGrado(getGrado(b));
    if (diff !== 0) return diff;
    return getNombre(a).localeCompare(getNombre(b), "es");
  });
}
