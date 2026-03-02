export interface Player {
  name: string;
  number?: number;
  initials: string;
}

export const teamData: Player[] = [
  { initials: "TP", name: "Tadej Peric",      number: 4  },
  { initials: "TH", name: "Tomaž Hribernik",  number: 5  },
  { initials: "UM", name: "Urban Martič",      number: 6  },
  { initials: "BL", name: "Blaž Logonder",    number: 7  },
  { initials: "MG", name: "Metod Golob",       number: 8  },
  { initials: "EP", name: "Erik Petrovič",     number: 9  },
  { initials: "AŠ", name: "Aljaž Šilar",      number: 10 },
  { initials: "GP", name: "Gaber Petrovič",    number: 11 },
  { initials: "JJ", name: "Jaka Jerala",       number: 14 },
  { initials: "DP", name: "Domen Porenta",     number: 17 },
  { initials: "TC", name: "Tilen Celjer",      number: 18 },
  { initials: "TK", name: "Tim Kalan",         number: 19 },
  { initials: "GM", name: "Gašper Martič",     number: 21 },
  { initials: "UK", name: "Urban Križaj",      number: 24 },
  { initials: "AR", name: "Aljaž Rogelj",      number: 25 },
  { initials: "NŠ", name: "Niko Šebalj",      number: 27 },
  { initials: "JR", name: "Jakob Rakovec",     number: 30 },
  { initials: "GA", name: "Grega Aljančič",    number: 33 },
  { initials: "MP", name: "Mark Porenta",      number: 44 },
  { initials: "BŽ", name: "Blaž Žerovnik",    number: 45 },
  { initials: "AL", name: "Aleš Logonder",     number: 69 },
  { initials: "DN", name: "David Naglič",      number: 71 },

  // Opponents
  { initials: "O_ES", name: "Erazem Šluga",      number: 17 },
];

export const playerMap = new Map<string, Player>(
  teamData.map((p) => [p.initials, p])
);
