/**
 * MAX MAYFIELD pixel sprite data
 * Retro 1987 mobile game style.
 * Proportional and centered.
 * Palette keys:
 *   'B' = Outline (black)
 *   'S' = Skin (peach)
 *   'H' = Orange/Red hair (#e65c00)
 *   'U' = Blue hoodie primary
 *   'G' = Green hoodie stripes
 *   'Y' = Yellow skateboard deck
 *   'W' = White sneakers / details
 *   'R' = Red accents
 */

export const MAX_PALETTE: Record<string, string> = {
  B: '#1a1a1a',
  S: '#f5c29d',
  H: '#e65c00',
  U: '#00acc1',
  G: '#4caf50',
  Y: '#ffeb3b',
  W: '#ffffff',
  R: 'var(--color-sprite-red)',
};

const RAW_MAP_LG = [
  /* 00 */ '............BBBBBBBB............',  // Hair top
  /* 01 */ '...........BHHHHHHHHB...........',
  /* 02 */ '..........BBHHHHHHHHBBB.........',
  /* 03 */ '.........BBHHHHHHHHHHHWB........',
  /* 04 */ '..........BHHBSSHHHSSSHB........',  // Eyes
  /* 05 */ '..........BHSSSSBSSSSSsB........',  // Nose
  /* 06 */ '..........BHSSSSSSSSSSsB........',  // Mouth
  /* 07 */ '..........BHSSSSSSSSSSsB........',
  /* 08 */ '..........BBBBBBBBBBBBBB........',  // Chin
  /* 09 */ '............BSSSSSSB............',  // Neck
  /* 10 */ '..........BBBBSSSUBBBB..........',  // Hoodie shoulders
  /* 11 */ '........BBUUUUUUUUUUUBB.........',
  /* 12 */ '.......BBUUUGGGGGUUUUUBB........',  // Green chest stripe
  /* 13 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 14 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 15 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 16 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 17 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 18 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 19 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 20 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 21 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 22 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 23 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 24 */ '......BBUUUUUUUUUUUUUUUBB.......',
  /* 25 */ '........BBBBBBBBBBBBBBB.........',  // Waist
  /* 26 */ '.........BUUUUUUUUUUUB..........',  // Blue jeans
  /* 27 */ '.........BUUUUUUUUUUUB..........',
  /* 28 */ '.........BUUUUUUUUUUUB..........',
  /* 29 */ '.........BUUUUUUUUUUUB..........',
  /* 30 */ '.........BBBBBBBBBBBBB..........',
  /* 31 */ '.......BUUUB.........BUUUB......',
  /* 32 */ '.......BUUUB.........BUUUB......',
  /* 33 */ '.......BUUUB.........BUUUB......',
  /* 34 */ '.......BUUUB.........BUUUB......',
  /* 35 */ '.......BUUUB.........BUUUB......',
  /* 36 */ '.......BWWWB.........BWWWB......',  // White sneakers
  /* 37 */ '......BWWWWWB.......BWWWWWB.....',
  /* 38 */ '...BYYYYYYYYYYYYYYYYYYYYYYYYYB..',  // Skateboard deck at bottom
  /* 39 */ '...BBBBBBBBBBBBBBBBBBBBBBBBBBB..',
];

export const MAX_MAP: string[][] = RAW_MAP_LG.map(row => [...row.toUpperCase()]);

const RAW_CELEBRATE = [
  /* 00 */ '............BBBBBBBB............',
  /* 01 */ '...........BHHHHHHHHB...........',
  /* 02 */ '..........BBHHHHHHHHBBB.........',
  /* 03 */ '.........BBHHHHHHHHHHHWB........',
  /* 04 */ '..........BHHBSSHHHSSSHB........',
  /* 05 */ '..........BHSSSSBSSSSSsB........',
  /* 06 */ '..........BHSSSSSSSSSSsB........',
  /* 07 */ '..........BHSSSSSSSSSSsB........',
  /* 08 */ '..........BBBBBBBBBBBBBB........',
  /* 09 */ '............BSSSSSSB............',
  /* 10 */ '..........BBBBSSSUBBBB..........',
  /* 11 */ '........BBUUUUUUUUUUUBB.........',
  /* 12 */ '......BBUUUUGGGGGUUUUUBB........',
  /* 13 */ '..BB.BBUUUUUGGGGGUUUUUUUBB.BB...',  // Arms raised holding skateboard up!
  /* 14 */ '.BYYBBBUUUUUGGGGGUUUUUUUBBBYYB..',  // Y = skateboard parts held up
  /* 15 */ '.BWWBBBUUUUUGGGGGUUUUUUUBBBWWB..',
  /* 16 */ '..BB.BBUUUUUGGGGGUUUUUUUBB.BB...',
  /* 17 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 18 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 19 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 20 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 21 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 22 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 23 */ '......BBUUUUGGGGGUUUUUUBB.......',
  /* 24 */ '......BBUUUUUUUUUUUUUUUBB.......',
  /* 25 */ '........BBBBBBBBBBBBBBB.........',
  /* 26 */ '.........BUUUUUUUUUUUB..........',
  /* 27 */ '.........BUUUUUUUUUUUB..........',
  /* 28 */ '.........BUUUUUUUUUUUB..........',
  /* 29 */ '.........BUUUUUUUUUUUB..........',
  /* 30 */ '.........BBBBBBBBBBBBB..........',
  /* 31 */ '.......BUUUB.........BUUUB......',
  /* 32 */ '.......BUUUB.........BUUUB......',
  /* 33 */ '.......BUUUB.........BUUUB......',
  /* 34 */ '.......BUUUB.........BUUUB......',
  /* 35 */ '.......BUUUB.........BUUUB......',
  /* 36 */ '.......BWWWB.........BWWWB......',
  /* 37 */ '......BWWWWWB.......BWWWWWB.....',
  /* 38 */ '................................',  // Skateboard is held up!
  /* 39 */ '................................',
];

export const MAX_MAP_CELEBRATE: string[][] = RAW_CELEBRATE.map(row => [...row.toUpperCase()]);

const RAW_SM_FIXED = [
  '    BBBBBBBB    ',
  '   BHHHHHHHWB   ',
  '  BBHHHHHHHHBBB ',
  ' BBHHHHHHHHHHHWB',
  '  BHHBSSHHHSSSHB',
  '  BHSSSSBSSSSSsB',
  '  BHSSSSSSSSSSsB',
  '  BHSSSSSSSSSSsB',
  '  BBBBBBBBBBBBBB',
  '      BSSSSB    ',
  '   BBBBSSSUBBBB ',
  '   BUUUUUUUUUUUB',
  '   BUUGGGGGUUUB ',
  '  BBUUGGGGGUUUBB',
  '  BUUUGGGGGUUUUB',
  '  BBBBBBBBBBBBBB',
  '    BUUUB.BUUUB ',
  '    BUUUB.BUUUB ',
  '   BWWWWWB.BWWWB',
  'BYYYYYYYYYYYYYYB',
];

export const MAX_MAP_SM: string[][] = RAW_SM_FIXED.map(row => [...row.toUpperCase()]);

export const MAX_IDLE_REGION: { row: number; col: number }[] = [];

export const MAX_IDLE_DIRECTION = 'up' as const;
export const MAX_NAME = 'MAX';
