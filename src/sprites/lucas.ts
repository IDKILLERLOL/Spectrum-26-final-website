/**
 * LUCAS SINCLAIR pixel sprite data
 * Retro 1987 mobile game style.
 * Camo headband, brown skin, dark hair, yellow/green striped shirt, blue jeans, basketball.
 * Palette keys:
 *   'B' = Outline (black)
 *   'S' = Skin (brown/dark skin)
 *   'H' = High-top hair (black)
 *   'C' = Camo headband green
 *   'R' = Red headband stripe (accent) / shoes
 *   'Y' = Yellow shirt stripes
 *   'G' = Green shirt stripes
 *   'U' = Blue jeans
 *   'O' = Orange (basketball)
 */

export const LUCAS_PALETTE: Record<string, string> = {
  B: '#1a1a1a',
  S: '#8d5524',
  H: '#111111',
  C: '#5d4037', // Camo brown/green
  R: 'var(--color-sprite-red)',
  Y: '#ffeb3b',
  G: '#4caf50',
  U: '#3949ab',
  O: '#ff5722',
};

const RAW_MAP = [
  /* 00 */ '..........BBBBBBBBBBBBBB........',  // High-top hair top
  /* 01 */ '..........BHHHHHHHHHHHHB........',
  /* 02 */ '..........BCCCCCCCCCCCCB........',  // Camo headband
  /* 03 */ '..........BCCCRRRRRRCCCB........',  // R = Red headband stripe
  /* 04 */ '..........BSSSSSSSSSSSSB........',  // Face starts (Dark skin)
  /* 05 */ '..........BSSBBSSSSBBSSB........',  // Eyes
  /* 06 */ '..........BSSSSSBSSSSSSB........',  // Nose
  /* 07 */ '..........BSSSSSSSBSSSSB........',  // Mouth
  /* 08 */ '..........BSSSSSSSSSSSSB........',
  /* 09 */ '..........BBBBBBBBBBBBBB........',  // Chin
  /* 10 */ '.............BSSSSSB............',  // Neck
  /* 11 */ '.............BSSSSSB............',
  /* 12 */ '.......BBBBBBBYYYYYBBB..........',  // Yellow/Green striped shirt shoulders
  /* 13 */ '.......BYYYYYYYYYYYYYYB..........',
  /* 14 */ '.......BYYYGGGGGGGYVYYB..........',  // Striped torso
  /* 15 */ '........BYYGGGGGGGYVYYB..........',
  /* 16 */ '........BYYGGGGGGGYVYYB..........',
  /* 17 */ '.........BYGGGGGGGYVYYB..........',
  /* 18 */ '.........BYGGGGGGGYVYYB..........',
  /* 19 */ '.........BYGGGGGGGYVYYB..........',
  /* 20 */ '.........BYGGGGGGGYVYYB..........',
  /* 21 */ '.........BYGGGGGGGYVYYB..........',
  /* 22 */ '.........BYGGGGGGGYVYYB..........',
  /* 23 */ '.........BYGGGGGGGYVYYB..........',
  /* 24 */ '.........BYYYYYYYYYYYYB..........',
  /* 25 */ '..........BBBBBBBBBBBBB..........',  // Waist
  /* 26 */ '.....BGGGB..........BGGGB........',  // Blue jeans (wide stride)
  /* 27 */ '.....BUUUB..........BUUUB........',
  /* 28 */ '......BUUB..........BUUUB........',
  /* 29 */ '......BUUB...........BUUB........',
  /* 30 */ '.......BUB...........BUUB........',
  /* 31 */ '.......BUB............BUB........',
  /* 32 */ '.......BUB............BUB........',
  /* 33 */ '.......BUB............BUB........',
  /* 34 */ '.......BUB.............BB........',
  /* 35 */ '.......BUB..............B........',
  /* 36 */ '.......BBB........BBBBB..........',  // Lead foot
  /* 37 */ '..................BOOOB..........',  // Orange basketball at foot
  /* 38 */ '..................BOOOB..........',
  /* 39 */ '..................BBBBB..........',
];

export const LUCAS_MAP: string[][] = RAW_MAP.map(row => [...row.toUpperCase()]);

const RAW_CELEBRATE = [
  /* 00 */ '..........BBBBBBBBBBBBBB........',
  /* 01 */ '..........BHHHHHHHHHHHHB........',
  /* 02 */ '..........BCCCCCCCCCCCCB........',
  /* 03 */ '..........BCCCRRRRRRCCCB........',
  /* 04 */ '..........BSSSSSSSSSSSSB........',
  /* 05 */ '..........BSSBBSSSSBBSSB........',
  /* 06 */ '..........BSSSSSBSSSSSSB........',
  /* 07 */ '..........BSSSSSSSBSSSSB........',
  /* 08 */ '..........BSSSSSSSSSSSSB........',
  /* 09 */ '..........BBBBBBBBBBBBBB........',
  /* 10 */ '.............BSSSSSB............',
  /* 11 */ '.............BSSSSSB............',
  /* 12 */ '....BBB.BBBBBBBYYYYYBBB.BBB......',  // Jumping arms raised celebration
  /* 13 */ '....BSSB.BYYYYYYYYYYYYYB.BSSB...',
  /* 14 */ '....BSSB..BYYGGGGGGGYVYYB..BSSB..',
  /* 15 */ '....BSBB..BYYGGGGGGGYVYYB..BBSS..',
  /* 16 */ '.....BB...BYYGGGGGGGYVYYB...BB...',
  /* 17 */ '..........BYYGGGGGGGYVYYB........',
  /* 18 */ '..........BYYGGGGGGGYVYYB........',
  /* 19 */ '..........BYYGGGGGGGYVYYB........',
  /* 20 */ '..........BYYGGGGGGGYVYYB........',
  /* 21 */ '..........BYYGGGGGGGYVYYB........',
  /* 22 */ '..........BYYGGGGGGGYVYYB........',
  /* 23 */ '..........BYYGGGGGGGYVYYB........',
  /* 24 */ '..........BYYYYYYYYYYYYB........',
  /* 25 */ '..........BBBBBBBBBBBBBB........',
  /* 26 */ '.......BGGGB....BGGGB............',
  /* 27 */ '.......BUUUB....BUUUB............',
  /* 28 */ '.......BUUUB....BUUUB............',
  /* 29 */ '.......BUUUB....BUUUB............',
  /* 30 */ '.......BUUUB....BUUUB............',
  /* 31 */ '.......BUUUB....BUUUB............',
  /* 32 */ '.......BUUUB....BUUUB............',
  /* 33 */ '.......BUUUB....BUUUB............',
  /* 34 */ '.......BUUUB....BUUUB............',
  /* 35 */ '.......BUUUB....BUUUB............',
  /* 36 */ '.......BBBBBB..BBBBBBB...........',
  /* 37 */ '................BOOOB............',
  /* 38 */ '................BOOOB............',
  /* 39 */ '................BBBBB............',
];

export const LUCAS_MAP_CELEBRATE: string[][] = RAW_CELEBRATE.map(row => [...row.toUpperCase()]);

const RAW_SM = [
  /* 00 */ '....BBBBBBBBBB..',
  /* 01 */ '....BHHHHHHHHHB.',
  /* 02 */ '....BCCCCCCCCCCB',
  /* 03 */ '....BCCCRRRRCCCB',
  /* 04 */ '....BSSBBSSSSSSB',
  /* 05 */ '....BSSSSSBSSSSB',
  /* 06 */ '    BBBBBBBBBBBB',
  /* 07 */ '......BSSSSSB...',
  /* 08 */ '....BBBYYYYYBBB.',
  /* 09 */ '    BYYGGGGGYWWB',
  /* 10 */ '     BYGGGGGYWWB',
  /* 11 */ '     BYGGGGGYWWB',
  /* 12 */ '    BBBBBBBBBBBB',
  /* 13 */ '  BGGGB...BGGGB.',
  /* 14 */ '  BUUUB...BUUUB.',
  /* 15 */ '   BUUB....BUUB.',
  /* 16 */ '   BUUB....BBBB.',
  /* 17 */ '   BBBB..BBBBB..',
  /* 18 */ '         BOOOB..',
  /* 19 */ '         BBBBB..',
];

export const LUCAS_MAP_SM: string[][] = RAW_SM.map(row => [...row.toUpperCase()]);

export const LUCAS_IDLE_REGION = [
  { row: 37, col: 18 },
  { row: 37, col: 19 },
  { row: 38, col: 18 },
];

export const LUCAS_IDLE_DIRECTION = 'left' as const;
