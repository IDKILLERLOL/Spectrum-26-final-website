/**
 * STEVE HARRINGTON pixel sprite data
 * Proportional 80s retro pixel style.
 * Centered perfectly on the 32-column grid.
 * Palette keys:
 *   'B' = Outline (black)
 *   'S' = Skin (peach)
 *   'H' = Swoosh hair (brown)
 *   'J' = Jacket (gray/brown)
 *   'W' = White (shirt highlights)
 *   'U' = Blue (jeans / shirt details)
 *   'R' = Red (nail wrap on bat)
 *   'Y' = Yellow (wooden bat)
 */

export const STEVE_PALETTE: Record<string, string> = {
  B: '#1a1a1a',
  S: '#f5c29d',
  H: '#5c4033',
  J: '#8d6e63',
  W: '#ffffff',
  U: '#1e88e5',
  R: 'var(--color-sprite-red)',
  Y: '#d7ccc8',
};

const RAW_MAP = [
  /* 00 */ '............BBBBBBBBB...........',  // Hair swoosh top (centered)
  /* 01 */ '...........BHHHHHHHHHBB.........',
  /* 02 */ '..........BHHHHHHHHHHHHBB.......',
  /* 03 */ '.........BHHHHHHHHHHHHHHBB......',
  /* 04 */ '..........BHHHHHHHHHHHHHWB......',
  /* 05 */ '...........BHHHHHHHHHHHHHB......',
  /* 06 */ '............BHHHHHHHHHHHWB......',
  /* 07 */ '............BSSBBSSSSBBSSB......',  // Eyes
  /* 08 */ '............BSSSSSBSSSSSSB......',  // Nose
  /* 09 */ '............BSSSSSSSBSSSSB......',  // Mouth
  /* 10 */ '............BSSSSSSSSSSSB.......',
  /* 11 */ '............BBBBBBBBBBBBB.......',  // Chin
  /* 12 */ '..............BSSSSSB...........',  // Neck (centered)
  /* 13 */ '..............BSSSSSB...........',
  /* 14 */ '........BBBBBBBJSSJSBBBBBBB.....',  // Jacket shoulders
  /* 15 */ '......BBJJJJJJJJJJJJJJJJJJJBB...',  // Sleeves
  /* 16 */ '......BJJJJJJJJJJJJJJJJJJJJJB...',
  /* 17 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',  // Polo shirt details
  /* 18 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 19 */ '......BJJJWWUUWWUUWWUUWWJJJJB.BB',  // Bat starts to the right
  /* 20 */ '......BJJJWWUUWWUUWWUUWWJJJJB.BY',
  /* 21 */ '......BJJJWWUUWWUUWWUUWWJJJJB.BY',
  /* 22 */ '......BJJJWWUUWWUUWWUUWWJJJJB.BY',
  /* 23 */ '......BJJJWWUUWWUUWWUUWWJJJJB.BR',  // R = Nail wrap accent
  /* 24 */ '......BJJJWWUUWWUUWWUUWWJJJJB.BY',
  /* 25 */ '......BJJJWWUUWWUUWWUUWWJJJJB.BY',
  /* 26 */ '......BJJJJJJJJJJJJJJJJJJJJJB.BY',
  /* 27 */ '......BBBBBBJUUUUUUUUUBBBBBBB.BY',  // Jeans waist
  /* 28 */ '.........BUUUUUUUUUUUUUB......BY',
  /* 29 */ '.........BUUUUUUUUUUUUUB......BY',
  /* 30 */ '.........BBBBBBBBBBBBBBB......BY',
  /* 31 */ '.......BUUUB.........BUUUB....BY',  // Centered legs
  /* 32 */ '.......BUUUB.........BUUUB....BY',
  /* 33 */ '.......BUUUB.........BUUUB....BY',
  /* 34 */ '.......BUUUB.........BUUUB....BY',
  /* 35 */ '.......BUUUB.........BUUUB....BY',
  /* 36 */ '.......BUUUB.........BUUUB....BB',  // Bat tip ends
  /* 37 */ '.......BUUUB.........BUUUB......',
  /* 38 */ '......BBRRRBB.......BBRRRBB.....',  // Sneakers
  /* 39 */ '......BBBBBBB.......BBBBBBB.....',
];

export const STEVE_MAP: string[][] = RAW_MAP.map(row => [...row.toUpperCase()]);

const RAW_CELEBRATE = [
  /* 00 */ '............BBBBBBBBB...........',
  /* 01 */ '...........BHHHHHHHHHBB.........',
  /* 02 */ '..........BHHHHHHHHHHHHBB.......',
  /* 03 */ '.........BHHHHHHHHHHHHHHBB......',
  /* 04 */ '..........BHHHHHHHHHHHHHWB......',
  /* 05 */ '...........BHHHHHHHHHHHHHB......',
  /* 06 */ '............BHHHHHHHHHHHWB......',
  /* 07 */ '............BSSBBSSSSBBSSB......',
  /* 08 */ '............BSSSSSBSSSSSSB......',
  /* 09 */ '............BSSSSSSSBSSSSB......',
  /* 10 */ '............BSSSSSSSSSSSB.......',
  /* 11 */ '............BBBBBBBBBBBBB.......',
  /* 12 */ '..............BSSSSSB...........',
  /* 13 */ '..............BSSSSSB...........',
  /* 14 */ '..BBB...BBBBBBBJSSJSBBBBBBB...BB',  // Raised arms
  /* 15 */ '.BSsB.BBJJJJJJJJJJJJJJJJJJJBB.BS',
  /* 16 */ '.BSsB.BJJJJJJJJJJJJJJJJJJJJJB.BS',
  /* 17 */ '.BBBB.BJJJWWUUWWUUWWUUWWJJJJB.BB',
  /* 18 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 19 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 20 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 21 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 22 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 23 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 24 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 25 */ '......BJJJWWUUWWUUWWUUWWJJJJB...',
  /* 26 */ '......BJJJJJJJJJJJJJJJJJJJJJB...',
  /* 27 */ '......BBBBBBJUUUUUUUUUBBBBBBB...',
  /* 28 */ '.........BUUUUUUUUUUUUUB........',
  /* 29 */ '.........BUUUUUUUUUUUUUB........',
  /* 30 */ '.........BBBBBBBBBBBBBBB........',
  /* 31 */ '.......BUUUB.........BUUUB......',
  /* 32 */ '.......BUUUB.........BUUUB......',
  /* 33 */ '.......BUUUB.........BUUUB......',
  /* 34 */ '.......BUUUB.........BUUUB......',
  /* 35 */ '.......BUUUB.........BUUUB......',
  /* 36 */ '.......BUUUB.........BUUUB......',
  /* 37 */ '.......BUUUB.........BUUUB......',
  /* 38 */ '......BBRRRBB.......BBRRRBB.....',
  /* 39 */ '......BBBBBBB.......BBBBBBB.....',
];

export const STEVE_MAP_CELEBRATE: string[][] = RAW_CELEBRATE.map(row => [...row.toUpperCase()]);

const RAW_SM = [
  /* 00 */ '....BBBBBBBBB...',
  /* 01 */ '...BHHHHHHHHHBB.',
  /* 02 */ '..BHHHHHHHHHHHBB',
  /* 03 */ '...BHHHHHHHHHWB.',
  /* 04 */ '....BSSBBSSSSSSB',
  /* 05 */ '....BSSSSBSSSSSB',
  /* 06 */ '....BSSSSSSBSSSB',
  /* 07 */ '    BBBBBBBBBBBB',
  /* 08 */ '......BSSSsB....',
  /* 09 */ '..BBBBJSSJSBBBB.',
  /* 10 */ '..BJJJJWWUUJJJJB',
  /* 11 */ '..BJJJJWWUUJJJJB',
  /* 12 */ '..BJJJJWWUUJJJJB',
  /* 13 */ '..BBBBJUUUUJBBBB',
  /* 14 */ '...BUUB...BUUB..',
  /* 15 */ '...BUUB...BUUB..',
  /* 16 */ '...BUUB...BUUB..',
  /* 17 */ '...BUUB...BUUB..',
  /* 18 */ '..BBRRB...BBRRB.',
  /* 19 */ '..BBBBB...BBBBB.',
];

export const STEVE_MAP_SM: string[][] = RAW_SM.map(row => [...row.toUpperCase()]);

export const STEVE_IDLE_REGION = [
  { row: 34, col: 27 },
  { row: 35, col: 27 },
  { row: 36, col: 27 },
];

export const STEVE_IDLE_DIRECTION = 'up' as const;
