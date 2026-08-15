// Tiny hand-drawn 3x5 pixel font, just enough coverage to render whatever
// `site.shortName` contains as ASCII-art block letters for the Hero banner.
const GLYPHS: Record<string, string[]> = {
  S: ["###", "#..", "###", "..#", "###"],
  P: ["###", "#.#", "###", "#..", "#.."],
  E: ["###", "#..", "###", "#..", "###"],
  C: ["###", "#..", "#..", "#..", "###"],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  R: ["###", "#.#", "###", "#.#", "#.#"],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  N: ["#.#", "##.", "#.#", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  O: [".#.", "#.#", "#.#", "#.#", ".#."],
  " ": ["...", "...", "...", "...", "..."],
}

const BLANK = ["...", "...", "...", "...", "..."]

/** Renders `word` as a 5-row ASCII-art block banner, one column of spacing between letters. */
export function asciiBanner(word: string, fill = "█", empty = " "): string[] {
  const glyphs = word
    .toUpperCase()
    .split("")
    .map((ch) => GLYPHS[ch] ?? BLANK)
  const rows: string[] = []
  for (let r = 0; r < 5; r++) {
    rows.push(
      glyphs
        .map((g) => g[r].replace(/#/g, fill).replace(/\./g, empty))
        .join(empty)
    )
  }
  return rows
}
