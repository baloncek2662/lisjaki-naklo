export interface Player {
  name: string;
  number: number;
}

export interface PositionGroup {
  title: string;
  players: Player[];
}

export const teamData: PositionGroup[] = [
  {
    title: "Vratar",
    players: [
      { name: "Matic Kovač", number: 1 },
      { name: "Luka Zupan", number: 12 },
    ],
  },
  {
    title: "Obramba",
    players: [
      { name: "Jan Novak", number: 2 },
      { name: "Anže Horvat", number: 3 },
      { name: "Rok Krajnc", number: 4 },
      { name: "Žiga Mlakar", number: 5 },
      { name: "Miha Vidmar", number: 13 },
    ],
  },
  {
    title: "Napad",
    players: [
      { name: "Nejc Potočnik", number: 7 },
      { name: "Blaž Hribar", number: 8 },
      { name: "Tim Korošec", number: 9 },
      { name: "David Ahlin", number: 10 },
      { name: "Gašper Breznik", number: 11 },
      { name: "Jure Košir", number: 14 },
    ],
  },
];
