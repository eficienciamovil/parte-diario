// Orden jerárquico de grados militares (menor número = mayor rango)
const ORDEN: Record<string, number> = {
  CY: 1,
  CR: 2,
  TC: 3,
  MY: 4,
  CI: 5,  // Capitán de Intendencia
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
  SV: 15, // Soldado Voluntario
  VS: 16, // Voluntario Soldado
  VP: 17,
  CAPELLAN: 18,
  VII: 90,
  VI: 91,
  V: 92,
  IV: 93,
  III: 94,
  II: 95,
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
