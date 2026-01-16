// =============================================
// 2026 F1 DRIVER GRID - COMPLETE WITH NUMBERS
// SINGLE SOURCE OF TRUTH
// =============================================

// Driver data with numbers and teams
export interface Driver {
  name: string;
  number: number;
  team: string;
  country: string;
}

export const DRIVERS_DATA_2026: Driver[] = [
  // Red Bull Racing
  { name: "Max Verstappen", number: 1, team: "Red Bull", country: "NED" },
  { name: "Isack Hadjar", number: 6, team: "Red Bull", country: "FRA" },
  
  // McLaren
  { name: "Lando Norris", number: 4, team: "McLaren", country: "GBR" },
  { name: "Oscar Piastri", number: 81, team: "McLaren", country: "AUS" },
  
  // Ferrari
  { name: "Charles Leclerc", number: 16, team: "Ferrari", country: "MON" },
  { name: "Lewis Hamilton", number: 44, team: "Ferrari", country: "GBR" },
  
  // Mercedes
  { name: "George Russell", number: 63, team: "Mercedes", country: "GBR" },
  { name: "Kimi Antonelli", number: 12, team: "Mercedes", country: "ITA" },
  
  // Aston Martin
  { name: "Fernando Alonso", number: 14, team: "Aston Martin", country: "ESP" },
  { name: "Lance Stroll", number: 18, team: "Aston Martin", country: "CAN" },
  
  // Williams
  { name: "Carlos Sainz", number: 55, team: "Williams", country: "ESP" },
  { name: "Alexander Albon", number: 23, team: "Williams", country: "THA" },
  
  // Alpine
  { name: "Pierre Gasly", number: 10, team: "Alpine", country: "FRA" },
  { name: "Franco Colapinto", number: 43, team: "Alpine", country: "ARG" },
  
  // Haas
  { name: "Esteban Ocon", number: 31, team: "Haas", country: "FRA" },
  { name: "Oliver Bearman", number: 87, team: "Haas", country: "GBR" },
  
  // RB (Visa Cash App RB)
  { name: "Yuki Tsunoda", number: 22, team: "RB", country: "JPN" },
  { name: "Liam Lawson", number: 30, team: "RB", country: "NZL" },
  
  // Sauber (Audi from 2026)
  { name: "Nico Hulkenberg", number: 27, team: "Sauber", country: "GER" },
  { name: "Gabriel Bortoleto", number: 5, team: "Sauber", country: "BRA" },
  
  // Cadillac (NEW TEAM 2026)
  { name: "Valtteri Bottas", number: 77, team: "Cadillac", country: "FIN" },
  { name: "Sergio Perez", number: 11, team: "Cadillac", country: "MEX" },
];

// Simple driver list for dropdowns (format: "Name (Team)")
export const DRIVERS_2026 = DRIVERS_DATA_2026.map(d => `${d.name} (${d.team})`);

// With placeholder option for forms
export const DRIVERS_WITH_PLACEHOLDER = [
  "Select Driver...",
  ...DRIVERS_2026
];

// Driver lookup by team with numbers
export const TEAMS_2026: Record<string, { driver: string; number: number }[]> = {
  "Red Bull": [
    { driver: "Max Verstappen", number: 1 },
    { driver: "Isack Hadjar", number: 6 }
  ],
  "McLaren": [
    { driver: "Lando Norris", number: 4 },
    { driver: "Oscar Piastri", number: 81 }
  ],
  "Ferrari": [
    { driver: "Charles Leclerc", number: 16 },
    { driver: "Lewis Hamilton", number: 44 }
  ],
  "Mercedes": [
    { driver: "George Russell", number: 63 },
    { driver: "Kimi Antonelli", number: 12 }
  ],
  "Aston Martin": [
    { driver: "Fernando Alonso", number: 14 },
    { driver: "Lance Stroll", number: 18 }
  ],
  "Williams": [
    { driver: "Carlos Sainz", number: 55 },
    { driver: "Alexander Albon", number: 23 }
  ],
  "Alpine": [
    { driver: "Pierre Gasly", number: 10 },
    { driver: "Franco Colapinto", number: 43 }
  ],
  "Haas": [
    { driver: "Esteban Ocon", number: 31 },
    { driver: "Oliver Bearman", number: 87 }
  ],
  "RB": [
    { driver: "Yuki Tsunoda", number: 22 },
    { driver: "Liam Lawson", number: 30 }
  ],
  "Sauber": [
    { driver: "Nico Hulkenberg", number: 27 },
    { driver: "Gabriel Bortoleto", number: 5 }
  ],
  "Cadillac": [
    { driver: "Valtteri Bottas", number: 77 },
    { driver: "Sergio Perez", number: 11 }
  ]
};

// Team colors (2026 livery colors)
export const TEAM_COLORS: Record<string, string> = {
  "Red Bull": "#3671C6",
  "McLaren": "#FF8000",
  "Ferrari": "#E8002D",
  "Mercedes": "#27F4D2",
  "Aston Martin": "#229971",
  "Williams": "#64C4FF",
  "Alpine": "#FF87BC",
  "Haas": "#B6BABD",
  "RB": "#6692FF",
  "Sauber": "#52E252",
  "Cadillac": "#1E1E1E"  // Black/Gold for Cadillac
};

// Helper to get driver's team from full name
export function getDriverTeam(driverWithTeam: string): string | null {
  const match = driverWithTeam.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

// Helper to get just the driver name without team
export function getDriverName(driverWithTeam: string): string {
  return driverWithTeam.replace(/\s*\([^)]+\)/, '').trim();
}

// Helper to get driver number
export function getDriverNumber(driverName: string): number | null {
  const driver = DRIVERS_DATA_2026.find(d => 
    d.name === driverName || 
    driverName.includes(d.name)
  );
  return driver?.number || null;
}
