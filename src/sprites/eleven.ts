/**
 * ELEVEN pixel sprite data
 * Retro 1987 mobile game style.
 * Pink dress, blue windbreaker, cropped brown buzzcut hair, peach skin, nosebleed.
 * Palette keys:
 *   'B' = Outline (black)
 *   'S' = Skin (peach)
 *   'H' = Shaved/buzzcut hair (light brown/blonde)
 *   'P' = Pink dress
 *   'U' = Blue windbreaker
 *   'R' = Red nosebleed / shoes
 *   'W' = White socks / highlights
 *   'G' = Green sock stripes
 */

export const ELEVEN_PALETTE: Record<string, string> = {
  B: '#1a1a1a',
  S: '#f5c29d',
  H: '#a58d6f',
  P: '#f48fb1',
  U: '#1e88e5',
  R: 'var(--color-sprite-red)',
  W: '#ffffff',
  G: '#4caf50',
};

const RAW_MAP = [
  /* 00 */ '..........BBBBBBBBBBBB..........',  // Buzzcut head top
  /* 01 */ '.........BHHHHHHHHHHHHB.........',
  /* 02 */ '.........BHHHHHHHHHHHHB.........',
  /* 03 */ '.........BHHHHHHHHHHHHB.........',
  /* 04 */ '.........BHHHHHHHHHHHHB.........',
  /* 05 */ '.....BBB.BSSSSSSSSSSSSS.........',  // Telekinesis raised arm (peach skin)
  /* 06 */ '....BSSB.BSSBBSSSSBBSSB.........',  // Eyes
  /* 07 */ '....BSSB.BSSSSSBSSSSSSB.........',  // Nose
  /* 08 */ '...BBWBB.BSSSSSSSBSSSSS.........',  // Mouth
  /* 09 */ '...BSSB..BSSSSSSSSSSSSS.........',
  /* 10 */ '...BSSB..BSSSSSSSSSSSSS.........',
  /* 11 */ '...BSSB..BSSSRSSSSSSSSS.........',  // R = Nosebleed
  /* 12 */ '...BSBB..BBBBBBBBBBBBBB.........',  // Chin
  /* 13 */ '....BB....BSSSSSSSSSSB..........',  // Neck
  /* 14 */ '..........BSSSSSSSSSSB..........',
  /* 15 */ '..BBBBBBBBBSSSSSSSSSSBBBBBBB....',  // Shoulders (Peach skin underneath jacket)
  /* 16 */ '..BUUUUUUUUUUUUUUUUUUUUUUUB.....',  // Blue windbreaker
  /* 17 */ '..BUUUUUUUUUUUUUUUUUUUUUUUB.....',
  /* 18 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',  // Pink dress peeking from jacket center
  /* 19 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 20 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 21 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 22 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 23 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 24 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 25 */ '..BBBBBBBBBBBBBBBBBBBBBBBBB.....',
  /* 26 */ '......BSSSSSB..BSSSSSB..........',  // Bare legs (peach)
  /* 27 */ '......BSSSSSB..BSSSSSB..........',
  /* 28 */ '......BSSSSSB..BSSSSSB..........',
  /* 29 */ '......BSSSSSB..BSSSSSB..........',
  /* 30 */ '......BWWWWWB..BWWWWWB..........',  // White tube socks
  /* 31 */ '......BGGGGGB..BGGGGGB..........',  // Green stripes
  /* 32 */ '......BWWWWWB..BWWWWWB..........',
  /* 33 */ '......BWWWWWB..BWWWWWB..........',
  /* 34 */ '......BWWWWWB..BWWWWWB..........',
  /* 35 */ '......BWWWWWB..BWWWWWB..........',
  /* 36 */ '......BWWWWWB..BWWWWWB..........',
  /* 37 */ '......BWWWWWB..BWWWWWB..........',
  /* 38 */ '.....BBRRRRRB..BBRRRRRB.........',  // White/Red sneakers
  /* 39 */ '.....BBBBBBB...BBBBBBBB.........',
];

export const ELEVEN_MAP: string[][] = RAW_MAP.map(row => [...row.toUpperCase()]);

const RAW_CELEBRATE = [
  /* 00 */ '..........BBBBBBBBBBBB..........',
  /* 01 */ '.........BHHHHHHHHHHHHB.........',
  /* 02 */ '.........BHHHHHHHHHHHHB.........',
  /* 03 */ '.........BHHHHHHHHHHHHB.........',
  /* 04 */ '.........BHHHHHHHHHHHHB.........',
  /* 05 */ '..BBBBB..BSSSSSSSSSSSSS....BBBBB',  // Both arms raised!
  /* 06 */ '..BSSSB..BSSBBSSSSBBSSB....BSSSB',
  /* 07 */ '...BSSB..BSSSSSBSSSSSSB...BSSSB.',
  /* 08 */ '...BSSB..BSSSSSSSBSSSSS...BSSB..',
  /* 09 */ '...BSSB..BSSSSSSSSSSSSS...BSSB..',
  /* 10 */ '....BB...BSSSSSSSSSSSSS....BB...',
  /* 11 */ '.........BSSSRSSSSSSSSS.........',
  /* 12 */ '.........BBBBBBBBBBBBBB.........',
  /* 13 */ '..........BSSSSSSSSSSB..........',
  /* 14 */ '..........BSSSSSSSSSSB..........',
  /* 15 */ '..BBBBBBBBBSSSSSSSSSSBBBBBBB....',
  /* 16 */ '..BUUUUUUUUUUUUUUUUUUUUUUUB.....',
  /* 17 */ '..BUUUUUUUUUUUUUUUUUUUUUUUB.....',
  /* 18 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 19 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 20 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 21 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 22 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 23 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 24 */ '..BUUUUUUPPPPPPPPPPPPUUUUUB.....',
  /* 25 */ '..BBBBBBBBBBBBBBBBBBBBBBBBB.....',
  /* 26 */ '......BSSSSSB..BSSSSSB..........',
  /* 27 */ '......BSSSSSB..BSSSSSB..........',
  /* 28 */ '......BSSSSSB..BSSSSSB..........',
  /* 29 */ '......BSSSSSB..BSSSSSB..........',
  /* 30 */ '......BWWWWWB..BWWWWWB..........',
  /* 31 */ '......BGGGGGB..BGGGGGB..........',
  /* 32 */ '......BWWWWWB..BWWWWWB..........',
  /* 33 */ '......BWWWWWB..BWWWWWB..........',
  /* 34 */ '......BWWWWWB..BWWWWWB..........',
  /* 35 */ '......BWWWWWB..BWWWWWB..........',
  /* 36 */ '......BWWWWWB..BWWWWWB..........',
  /* 37 */ '......BWWWWWB..BWWWWWB..........',
  /* 38 */ '.....BBRRRRRB..BBRRRRRB.........',
  /* 39 */ '.....BBBBBBB...BBBBBBBB.........',
];

export const ELEVEN_MAP_CELEBRATE: string[][] = RAW_CELEBRATE.map(row => [...row.toUpperCase()]);

const RAW_SM = [
  /* 00 */ '....BBBBBBBB....',
  /* 01 */ '...BHHHHHHHHB...',
  /* 02 */ '.BB.BHHHHHHHHB..',
  /* 03 */ '.BS.BSSSSSSSSB..',
  /* 04 */ '.BS.BSSBBSSBSB..',
  /* 05 */ '.BS.BSSSSSSSSB..',
  /* 06 */ '.BB.BSSSRSSSSB..',
  /* 07 */ '    BSSSSSSSSB..',
  /* 08 */ '....BBBBBBBBBB..',
  /* 09 */ '....BSSSSSSB....',
  /* 10 */ '..BBBUSSSSSUBBBB',
  /* 11 */ '..BUUUUUUUUUUUB.',
  /* 12 */ '..BUUPPPPPPUUUB.',
  /* 13 */ '..BUUPPPPPPUUUB.',
  /* 14 */ '..BBBBBBBBBBBBB.',
  /* 15 */ '....BSSB.BSSB...',
  /* 16 */ '....BSSB.BSSB...',
  /* 17 */ '....BWWB.BWWB...',
  /* 18 */ '...BBRRB.BBRRB..',
  /* 19 */ '...BBBBB.BBBBB..',
];

export const ELEVEN_MAP_SM: string[][] = RAW_SM.map(row => [...row.toUpperCase()]);

export const ELEVEN_IDLE_REGION = [
  { row: 5, col: 4 },
  { row: 5, col: 5 },
  { row: 6, col: 4 },
];

export const ELEVEN_IDLE_DIRECTION = 'up' as const;
