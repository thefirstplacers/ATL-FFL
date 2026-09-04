// ESPN-era ATL FFL history (league 65402377), pulled from the ESPN read API 2026-09-04.
// Static because ESPN pre-dates the Sleeper league chain; regenerate via the Fantasy Engine's ESPN auth if ever needed.
export interface EspnSeasonTeam {
  teamName: string; owners: string; wins: number; losses: number; ties: number;
  pointsFor: number; pointsAgainst: number; finalRank: number;
}

export const ESPN_HISTORY: Record<string, EspnSeasonTeam[]> = {
  "2020": [
    {
      "teamName": "Team Davis",
      "owners": "Grayson Davis",
      "wins": 7,
      "losses": 6,
      "ties": 0,
      "pointsFor": 1382.12,
      "pointsAgainst": 1452.18,
      "finalRank": 1
    },
    {
      "teamName": "Team Yun",
      "owners": "Michael Yun",
      "wins": 10,
      "losses": 3,
      "ties": 0,
      "pointsFor": 1442.0,
      "pointsAgainst": 1243.38,
      "finalRank": 2
    },
    {
      "teamName": "Cooking With The Coopers",
      "owners": "Sasan Assary",
      "wins": 10,
      "losses": 3,
      "ties": 0,
      "pointsFor": 1492.44,
      "pointsAgainst": 1303.88,
      "finalRank": 3
    },
    {
      "teamName": "Team Abrams",
      "owners": "Jordan Abrams",
      "wins": 10,
      "losses": 3,
      "ties": 0,
      "pointsFor": 1518.44,
      "pointsAgainst": 1253.0,
      "finalRank": 4
    },
    {
      "teamName": "Slick Daddy  Jim",
      "owners": "Jimmy Zmija",
      "wins": 6,
      "losses": 7,
      "ties": 0,
      "pointsFor": 1380.36,
      "pointsAgainst": 1434.38,
      "finalRank": 5
    },
    {
      "teamName": "The League's Backpack",
      "owners": "Grant Davis",
      "wins": 7,
      "losses": 6,
      "ties": 0,
      "pointsFor": 1331.82,
      "pointsAgainst": 1289.3,
      "finalRank": 6
    },
    {
      "teamName": "Fleet Footed Raven",
      "owners": "Bill Davis",
      "wins": 5,
      "losses": 8,
      "ties": 0,
      "pointsFor": 1194.52,
      "pointsAgainst": 1293.2,
      "finalRank": 7
    },
    {
      "teamName": "East Atlanta Eggheads",
      "owners": "Justin Williams",
      "wins": 5,
      "losses": 8,
      "ties": 0,
      "pointsFor": 1362.68,
      "pointsAgainst": 1437.92,
      "finalRank": 8
    },
    {
      "teamName": "Big Ole Trashcan",
      "owners": "Ricky  Mohrig",
      "wins": 5,
      "losses": 8,
      "ties": 0,
      "pointsFor": 1316.5,
      "pointsAgainst": 1420.0,
      "finalRank": 9
    },
    {
      "teamName": "ur mom",
      "owners": "Anna Theriot",
      "wins": 5,
      "losses": 8,
      "ties": 0,
      "pointsFor": 1368.46,
      "pointsAgainst": 1412.44,
      "finalRank": 10
    },
    {
      "teamName": "Team Mr. Crackhead ",
      "owners": "alec  johnson",
      "wins": 4,
      "losses": 9,
      "ties": 0,
      "pointsFor": 1357.38,
      "pointsAgainst": 1489.1,
      "finalRank": 11
    },
    {
      "teamName": "Antonio Browns Music Career",
      "owners": "Tyler Williams",
      "wins": 4,
      "losses": 9,
      "ties": 0,
      "pointsFor": 1191.2,
      "pointsAgainst": 1309.14,
      "finalRank": 12
    }
  ],
  "2021": [
    {
      "teamName": "JT and a Bunch of Scrubs",
      "owners": "Tyler Williams",
      "wins": 10,
      "losses": 4,
      "ties": 0,
      "pointsFor": 1573.86,
      "pointsAgainst": 1446.24,
      "finalRank": 1
    },
    {
      "teamName": "Corporal  Headass",
      "owners": "Sasan Assary",
      "wins": 9,
      "losses": 5,
      "ties": 0,
      "pointsFor": 1560.8,
      "pointsAgainst": 1482.6,
      "finalRank": 2
    },
    {
      "teamName": "The League's Backpack",
      "owners": "Grant Davis",
      "wins": 12,
      "losses": 2,
      "ties": 0,
      "pointsFor": 1763.84,
      "pointsAgainst": 1346.68,
      "finalRank": 3
    },
    {
      "teamName": "Injury Bug",
      "owners": "Justin Williams",
      "wins": 7,
      "losses": 7,
      "ties": 0,
      "pointsFor": 1457.54,
      "pointsAgainst": 1352.56,
      "finalRank": 4
    },
    {
      "teamName": "Team Yun",
      "owners": "Michael Yun",
      "wins": 7,
      "losses": 7,
      "ties": 0,
      "pointsFor": 1514.4,
      "pointsAgainst": 1548.12,
      "finalRank": 5
    },
    {
      "teamName": "Mike and Hikes",
      "owners": "Ricky  Mohrig",
      "wins": 8,
      "losses": 6,
      "ties": 0,
      "pointsFor": 1444.12,
      "pointsAgainst": 1483.74,
      "finalRank": 6
    },
    {
      "teamName": "Danny Dimez\ud83e\ude99",
      "owners": "Zach Miller",
      "wins": 6,
      "losses": 8,
      "ties": 0,
      "pointsFor": 1425.46,
      "pointsAgainst": 1525.08,
      "finalRank": 7
    },
    {
      "teamName": "Slick Daddy  Jim",
      "owners": "Jimmy Zmija",
      "wins": 6,
      "losses": 8,
      "ties": 0,
      "pointsFor": 1425.94,
      "pointsAgainst": 1397.2,
      "finalRank": 8
    },
    {
      "teamName": "Fleet Footed Raven",
      "owners": "Bill Davis",
      "wins": 5,
      "losses": 9,
      "ties": 0,
      "pointsFor": 1393.94,
      "pointsAgainst": 1456.54,
      "finalRank": 9
    },
    {
      "teamName": "Team Abrams",
      "owners": "Jordan Abrams",
      "wins": 6,
      "losses": 8,
      "ties": 0,
      "pointsFor": 1387.2,
      "pointsAgainst": 1480.06,
      "finalRank": 10
    },
    {
      "teamName": "I Chase Young Kids",
      "owners": "Garrett Davis",
      "wins": 4,
      "losses": 10,
      "ties": 0,
      "pointsFor": 1415.24,
      "pointsAgainst": 1572.38,
      "finalRank": 11
    },
    {
      "teamName": "Team Davis",
      "owners": "Grayson Davis",
      "wins": 4,
      "losses": 10,
      "ties": 0,
      "pointsFor": 1329.0,
      "pointsAgainst": 1600.14,
      "finalRank": 12
    }
  ]
};
