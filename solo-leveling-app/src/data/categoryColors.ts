// Fonte única de verdade para as cores por categoria de missão.
// Importado por todas as telas (evita divergência de cores entre componentes).
export const CAT_COLORS: Record<string, string> = {
  saude:   '#3a8fff',
  amor:    '#e05080',
  estudo:  '#8060ff',
  ingles:  '#40c0e0',
  fe:      '#f0d060',
  habito:  '#50e890',
  familia: '#e0903a',
  carater: '#c8a0ff',
}

/** Cor da categoria com fallback para o neon padrão. */
export function catColor(category: string): string {
  return CAT_COLORS[category] ?? '#3a8fff'
}
