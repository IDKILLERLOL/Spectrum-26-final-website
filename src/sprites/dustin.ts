/**
 * DUSTIN HENDERSON pixel sprite data
 * Based on the reference image:
 *   - Cap: Yellow top/front panel, Green brim and sides.
 *   - Hair: Curly brown hair.
 *   - Shirt: Orange t-shirt.
 *   - Vest: Dark blue-grey sleeveless vest.
 *   - Shorts: Dark green/brown cargo shorts.
 *   - Shoes: White socks with blue stripe, grey/white sneakers with red accents.
 * 
 * Palette keys:
 *   'B' = Outline (black)
 *   'S' = Skin (peach)
 *   'H' = Hair (dark brown)
 *   'Y' = Yellow (cap top panel)
 *   'C' = Green (cap brim & sides)
 *   'O' = Orange (t-shirt)
 *   'V' = Vest (dark blue-grey)
 *   'A' = Shorts (dark olive green)
 *   'W' = White/Light Grey (shoes/socks)
 *   'R' = Red (sneaker details)
 *   'U' = Blue (sock stripe)
 */

export const DUSTIN_PALETTE: Record<string, string> = {
  B: '#1a1a1a',
  S: '#f5c29d',
  H: '#5c4033',
  Y: '#fbc02d', // Yellow cap top
  C: '#2e7d32', // Green cap brim & sides
  O: '#ef6c00', // Orange shirt
  V: '#37474f', // Dark blue-grey vest
  A: '#4e5d30', // Dark cargo shorts
  W: '#e0e0e0', // White/grey shoes & socks
  R: 'var(--color-sprite-red)',
  U: '#1565c0', // Blue sock stripe
};

const RAW_MAP = [
  /* 00 */ '......BBBBBBBBBBBBBBBBBBBB......',
  /* 01 */ '......BCCCCCCCCCCCCCCCCCCB......',  // Green cap sides
  /* 02 */ '......BCCCYYYYYYYYYYYYCCCB......',  // Yellow cap center
  /* 03 */ '.....BBBBBBBBBBBBBBBBBBBBBB.....',  // Green cap brim
  /* 04 */ '......BBBBBBBBBBBBBBBBBBBB......',
  /* 05 */ '....BBBHHHHHHHHHHHHHHHHBBB......',  // Curly brown hair
  /* 06 */ '...BBHHHHHHHHHHHHHHHHHHHBB......',
  /* 07 */ '..BBHHHHHHHHHHHHHHHHHHHHHBB.....',
  /* 08 */ '..BHHHHHSSSSSSSSSSSSSSHHHHB.....',  // Peach skin
  /* 09 */ '..BHHHHHSSBBSSSSSSSSBBSSHHB.....',  // Eyes
  /* 10 */ '..BHHHHHSSSSSSBSSSSSSSSSHHB.....',  // Nose
  /* 11 */ '..BHHHHHSSSSSSSSBSSSSSSSHHB.....',  // Mouth
  /* 12 */ '..BBHHHHSSSSSSSSSSSSSSSHHBB.....',
  /* 13 */ '..BBBBBBBBBBBBBBBBBBBBBBBBB.....',
  /* 14 */ '.......BSSSSSSSSSSSSSsB.........',  // Neck
  /* 15 */ '.......BSSSSSSSSSSSSSsB.........',
  /* 16 */ '....BBBBBVSSSSSSSSSVBBBBB.......',  // Vest shoulders (Dark blue-grey)
  /* 17 */ '....BVVVVVSSSSSSSSSVVVVVB.....',
  /* 18 */ '....BVVVVVOOOOOOOOOVVVVBGGGG....',  // Orange shirt center + walkie-talkie
  /* 19 */ '....BVVVVVOOOOOOOOOVVVVBGWWG....',  // Vest flaps on sides
  /* 20 */ '....BVVVVVOOOOOOOOOVVVVBGWWG....',
  /* 21 */ '....BVVVVVOOOOOOOOOVVVVBGWWG....',
  /* 22 */ '....BVVVVVOOOOOOOOOVVVVBGWWG....',
  /* 23 */ '....BVVVVVOOOOOOOOOVVVVBBBGG....',
  /* 24 */ '....BVVVVVOOOOOOOOOVVVVVVVVB....',
  /* 25 */ '....BVVVVVOOOOOOOOOVVVVVVVVB....',
  /* 26 */ '....BVVVVVOOOOOOOOOVVVVVVVVB....',
  /* 27 */ '....BBBBBVVVVVVVVVVVVVBBBBB.....',
  /* 28 */ '.....BAAAAAAAAAAAAAAAAAAB.......',  // Dark cargo shorts
  /* 29 */ '.....BAAAAAAAAAAAAAAAAAAB.......',
  /* 30 */ '.....BBBBBBBBBBBBBBBBBBBB.......',
  /* 31 */ '.....BSSSB.........BSSSB........',  // Socks (white with blue stripe)
  /* 32 */ '.....BSSSB.........BSSSB........',
  /* 33 */ '.....BWWWB.........BWWWB........',  // White socks
  /* 34 */ '.....BUUUB.........BUUUB........',  // Blue stripe
  /* 35 */ '.....BWWWB.........BWWWB........',
  /* 36 */ '.....BWWWB.........BWWWB........',
  /* 37 */ '.....BWWWB.........BWWWB........',
  /* 38 */ '....BBRRRBB.......BBRRRBB.......',  // Grey sneakers with red accents
  /* 39 */ '....BBBBBBB.......BBBBBBB.......',
];

export const DUSTIN_MAP: string[][] = RAW_MAP.map(row => [...row.toUpperCase()]);

const RAW_CELEBRATE = [
  /* 00 */ '......BBBBBBBBBBBBBBBBBBBB......',
  /* 01 */ '......BCCCCCCCCCCCCCCCCCCB......',
  /* 02 */ '......BCCCYYYYYYYYYYYYCCCB......',
  /* 03 */ '.....BBBBBBBBBBBBBBBBBBBBBB.....',
  /* 04 */ '......BBBBBBBBBBBBBBBBBBBB......',
  /* 05 */ '....BBBHHHHHHHHHHHHHHHHBBB......',
  /* 06 */ '...BBHHHHHHHHHHHHHHHHHHHBB......',
  /* 07 */ '..BBHHHHHHHHHHHHHHHHHHHHHBB.....',
  /* 08 */ '..BHHHHHSSSSSSSSSSSSSSHHHHB.....',
  /* 09 */ '..BHHHHHSSBBSSSSSSSSBBSSHHB.....',
  /* 10 */ '..BHHHHHSSSSSSBSSSSSSSSSHHB.....',
  /* 11 */ '..BHHHHHSSSSSSSSSSBSSSSSHHB.....',
  /* 12 */ '..BBHHHHSSSSSSSSSSSSSSSHHBB.....',
  /* 13 */ '..BBBBBBBBBBBBBBBBBBBBBBBBB.....',
  /* 14 */ '.......BSSSSSSSSSSSSSsB.........',
  /* 15 */ '.......BSSSSSSSSSSSSSsB.........',
  /* 16 */ '....BBBBBVSSSSSSSSSVBBBBB.......',
  /* 17 */ '....BVVVVVSSSSSSSSSVVVVVB.....',
  /* 18 */ '..BB....BVVOOOOOOOOVB....BB.....',  // Celebration pose
  /* 19 */ '.BSSB...BVVOOOOOOOOVB...BSSB....',
  /* 20 */ '.BSSB...BVVOOOOOOOOVB...BSSB....',
  /* 21 */ '.BSSB...BVVOOOOOOOOVB...BSSB....',
  /* 22 */ '.BBBB...BVVOOOOOOOOVB...BBBB....',
  /* 23 */ '........BVVOOOOOOOOVB...........',
  /* 24 */ '....BVVVVVVOOOOOOOOVVVVVVVVB....',
  /* 25 */ '....BVVVVVVOOOOOOOOVVVVVVVVB....',
  /* 26 */ '....BVVVVVVOOOOOOOOVVVVVVVVB....',
  /* 27 */ '....BBBBBVVVVVVVVVVVVVBBBBB.....',
  /* 28 */ '.....BAAAAAAAAAAAAAAAAAAB.......',
  /* 29 */ '.....BAAAAAAAAAAAAAAAAAAB.......',
  /* 30 */ '.....BBBBBBBBBBBBBBBBBBBB.......',
  /* 31 */ '......BSSSB......BSSSB..........',
  /* 32 */ '......BSSSB......BSSSB..........',
  /* 33 */ '......BWWWB......BWWWB..........',
  /* 34 */ '......BUUUB......BUUUB..........',
  /* 35 */ '......BWWWB......BWWWB..........',
  /* 36 */ '......BWWWB......BWWWB..........',
  /* 37 */ '......BWWWB......BWWWB..........',
  /* 38 */ '.....BBRRRBB....BBRRRBB.........',
  /* 39 */ '.....BBBBBBB....BBBBBBB.........',
];

export const DUSTIN_MAP_CELEBRATE: string[][] = RAW_CELEBRATE.map(row => [...row.toUpperCase()]);

const RAW_SM = [
  /* 00 */ '...BBBBBBBBBB...',
  /* 01 */ '...BCCCCCCCCB..',
  /* 02 */ '...BCCYYYCCCB...',
  /* 03 */ '..BBBBBBBBBBBBB.',
  /* 04 */ '..BBHHHHHHHHBB..',
  /* 05 */ '.BBHHHHHHHHHHBB.',
  /* 06 */ '.BHHBSSHHSSHHHB.',
  /* 07 */ '.BHHSSSSBSSSSHB.',
  /* 08 */ '.BHHHSSSSSSSHHB.',
  /* 09 */ '.BBBBBBBBBBBBBB.',
  /* 10 */ '....BSSSSSsB....',
  /* 11 */ '..BBBVSsSSVBBB..',
  /* 12 */ '..BVVOOOOOOVWB..',
  /* 13 */ '..BVVOOOOOOVWB..',
  /* 14 */ '..BVVOOOOOOVWB..',
  /* 15 */ '..BBBVVVVVVBBB..',
  /* 16 */ '...BAAAB.BAAAB..',
  /* 17 */ '...BSSSB.BSSSB..',
  /* 18 */ '..BBRRRB.BBRRRB.',
  /* 19 */ '..BBBBBB.BBBBBB.',
];

export const DUSTIN_MAP_SM: string[][] = RAW_SM.map(row => [...row.toUpperCase()]);

export const DUSTIN_IDLE_REGION = [
  { row: 18, col: 23 },
  { row: 18, col: 24 },
  { row: 19, col: 23 },
];

export const DUSTIN_IDLE_DIRECTION = 'up' as const;
