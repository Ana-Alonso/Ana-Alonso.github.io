export function normalizeSection(rawSection: string): string {
  // Normaliza acentos para comparar variantes como "Fábrica" y "Formación".
  const lower = rawSection
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (lower.includes("casa") || lower.includes("inicio")) return "Casa";
  if (lower.includes("universidad") || lower.includes("formacion")) {
    return "Universidad";
  }
  if (lower.includes("fabrica") || lower.includes("habilidades")) {
    return "Fabrica";
  }
  if (lower.includes("cabina") || lower.includes("contacto")) {
    return "Cabina";
  }
  return rawSection;
}
