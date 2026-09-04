// ESPN-era ATL FFL history (league 65402377), pulled from the ESPN read API 2026-09-06.
// Static because ESPN pre-dates the Sleeper league chain; regenerate with the
// Fantasy Engine's saved ESPN auth if it ever needs a refresh.
//
// sleeperOwnerId bridges a continuing member's ESPN team to their current Sleeper
// identity so all-time stats span the whole league life. Departed members (and
// Grayson's separate pre-merge team) carry null and appear by name only.
export interface EspnSeasonTeam {
  teamId: number; teamName: string; owners: string; sleeperOwnerId: string | null; photo: string;
  wins: number; losses: number; ties: number; pointsFor: number; pointsAgainst: number; finalRank: number;
}

export interface EspnMatchup {
  week: number; homeTeamId: number; homePts: number; awayTeamId: number; awayPts: number;
}

export interface EspnSeason {
  regularSeasonWeeks: number; teams: EspnSeasonTeam[]; matchups: EspnMatchup[];
}

export const ESPN_HISTORY: Record<string, EspnSeason> = {
  "2020": {
    "regularSeasonWeeks": 13,
    "teams": [
      {
        "teamId": 3,
        "teamName": "Team Davis",
        "owners": "Grayson Davis",
        "sleeperOwnerId": null,
        "photo": "/managers/billgrayson.jpg",
        "wins": 7,
        "losses": 6,
        "ties": 0,
        "pointsFor": 1382.12,
        "pointsAgainst": 1452.18,
        "finalRank": 1
      },
      {
        "teamId": 7,
        "teamName": "Team Yun",
        "owners": "Michael Yun",
        "sleeperOwnerId": "869653222627909632",
        "photo": "/managers/mike.jpg",
        "wins": 10,
        "losses": 3,
        "ties": 0,
        "pointsFor": 1442.0,
        "pointsAgainst": 1243.38,
        "finalRank": 2
      },
      {
        "teamId": 11,
        "teamName": "Cooking With The Coopers",
        "owners": "Sasan Assary",
        "sleeperOwnerId": null,
        "photo": "/managers/sasan.jpg",
        "wins": 10,
        "losses": 3,
        "ties": 0,
        "pointsFor": 1492.44,
        "pointsAgainst": 1303.88,
        "finalRank": 3
      },
      {
        "teamId": 2,
        "teamName": "Team Abrams",
        "owners": "Jordan Abrams",
        "sleeperOwnerId": "864909340086226944",
        "photo": "/managers/jordan.jpg",
        "wins": 10,
        "losses": 3,
        "ties": 0,
        "pointsFor": 1518.44,
        "pointsAgainst": 1253.0,
        "finalRank": 4
      },
      {
        "teamId": 9,
        "teamName": "Slick Daddy  Jim",
        "owners": "Jimmy Zmija",
        "sleeperOwnerId": "869685304523677696",
        "photo": "/managers/jim.jpg",
        "wins": 6,
        "losses": 7,
        "ties": 0,
        "pointsFor": 1380.36,
        "pointsAgainst": 1434.38,
        "finalRank": 5
      },
      {
        "teamId": 1,
        "teamName": "The League's Backpack",
        "owners": "Grant Davis",
        "sleeperOwnerId": "869629223269203968",
        "photo": "/managers/grantmelissa1.jpg",
        "wins": 7,
        "losses": 6,
        "ties": 0,
        "pointsFor": 1331.82,
        "pointsAgainst": 1289.3,
        "finalRank": 6
      },
      {
        "teamId": 4,
        "teamName": "Fleet Footed Raven",
        "owners": "Bill Davis",
        "sleeperOwnerId": "869658110913105920",
        "photo": "/managers/billgrayson.jpg",
        "wins": 5,
        "losses": 8,
        "ties": 0,
        "pointsFor": 1194.52,
        "pointsAgainst": 1293.2,
        "finalRank": 7
      },
      {
        "teamId": 10,
        "teamName": "East Atlanta Eggheads",
        "owners": "Justin Williams",
        "sleeperOwnerId": "869641185436807168",
        "photo": "/managers/justin.jpg",
        "wins": 5,
        "losses": 8,
        "ties": 0,
        "pointsFor": 1362.68,
        "pointsAgainst": 1437.92,
        "finalRank": 8
      },
      {
        "teamId": 5,
        "teamName": "Big Ole Trashcan",
        "owners": "Ricky  Mohrig",
        "sleeperOwnerId": "674798465431216128",
        "photo": "/managers/ricky1.jpg",
        "wins": 5,
        "losses": 8,
        "ties": 0,
        "pointsFor": 1316.5,
        "pointsAgainst": 1420.0,
        "finalRank": 9
      },
      {
        "teamId": 6,
        "teamName": "ur mom",
        "owners": "Anna Theriot",
        "sleeperOwnerId": null,
        "photo": "/managers/question.jpg",
        "wins": 5,
        "losses": 8,
        "ties": 0,
        "pointsFor": 1368.46,
        "pointsAgainst": 1412.44,
        "finalRank": 10
      },
      {
        "teamId": 8,
        "teamName": "Team Mr. Crackhead ",
        "owners": "alec  johnson",
        "sleeperOwnerId": null,
        "photo": "/managers/question.jpg",
        "wins": 4,
        "losses": 9,
        "ties": 0,
        "pointsFor": 1357.38,
        "pointsAgainst": 1489.1,
        "finalRank": 11
      },
      {
        "teamId": 12,
        "teamName": "Antonio Browns Music Career",
        "owners": "Tyler Williams",
        "sleeperOwnerId": "676175709789556736",
        "photo": "/managers/tyler.jpg",
        "wins": 4,
        "losses": 9,
        "ties": 0,
        "pointsFor": 1191.2,
        "pointsAgainst": 1309.14,
        "finalRank": 12
      }
    ],
    "matchups": [
      {
        "week": 1,
        "homeTeamId": 1,
        "homePts": 121.18,
        "awayTeamId": 3,
        "awayPts": 121.7
      },
      {
        "week": 1,
        "homeTeamId": 9,
        "homePts": 121.06,
        "awayTeamId": 5,
        "awayPts": 145.6
      },
      {
        "week": 1,
        "homeTeamId": 11,
        "homePts": 78.3,
        "awayTeamId": 7,
        "awayPts": 97.52
      },
      {
        "week": 1,
        "homeTeamId": 4,
        "homePts": 88.5,
        "awayTeamId": 6,
        "awayPts": 103.94
      },
      {
        "week": 1,
        "homeTeamId": 2,
        "homePts": 103.38,
        "awayTeamId": 10,
        "awayPts": 119.9
      },
      {
        "week": 1,
        "homeTeamId": 12,
        "homePts": 101.44,
        "awayTeamId": 8,
        "awayPts": 115.5
      },
      {
        "week": 2,
        "homeTeamId": 3,
        "homePts": 112.04,
        "awayTeamId": 5,
        "awayPts": 132.62
      },
      {
        "week": 2,
        "homeTeamId": 7,
        "homePts": 93.5,
        "awayTeamId": 1,
        "awayPts": 95.7
      },
      {
        "week": 2,
        "homeTeamId": 11,
        "homePts": 117.88,
        "awayTeamId": 9,
        "awayPts": 136.98
      },
      {
        "week": 2,
        "homeTeamId": 6,
        "homePts": 127.0,
        "awayTeamId": 10,
        "awayPts": 121.68
      },
      {
        "week": 2,
        "homeTeamId": 8,
        "homePts": 98.08,
        "awayTeamId": 4,
        "awayPts": 98.86
      },
      {
        "week": 2,
        "homeTeamId": 12,
        "homePts": 131.38,
        "awayTeamId": 2,
        "awayPts": 159.42
      },
      {
        "week": 3,
        "homeTeamId": 7,
        "homePts": 135.62,
        "awayTeamId": 3,
        "awayPts": 109.8
      },
      {
        "week": 3,
        "homeTeamId": 5,
        "homePts": 106.82,
        "awayTeamId": 11,
        "awayPts": 142.48
      },
      {
        "week": 3,
        "homeTeamId": 1,
        "homePts": 140.94,
        "awayTeamId": 9,
        "awayPts": 117.6
      },
      {
        "week": 3,
        "homeTeamId": 8,
        "homePts": 117.32,
        "awayTeamId": 6,
        "awayPts": 149.18
      },
      {
        "week": 3,
        "homeTeamId": 10,
        "homePts": 83.08,
        "awayTeamId": 12,
        "awayPts": 103.1
      },
      {
        "week": 3,
        "homeTeamId": 4,
        "homePts": 87.68,
        "awayTeamId": 2,
        "awayPts": 124.4
      },
      {
        "week": 4,
        "homeTeamId": 3,
        "homePts": 110.32,
        "awayTeamId": 11,
        "awayPts": 154.06
      },
      {
        "week": 4,
        "homeTeamId": 9,
        "homePts": 103.04,
        "awayTeamId": 7,
        "awayPts": 99.58
      },
      {
        "week": 4,
        "homeTeamId": 1,
        "homePts": 112.92,
        "awayTeamId": 5,
        "awayPts": 80.5
      },
      {
        "week": 4,
        "homeTeamId": 6,
        "homePts": 88.18,
        "awayTeamId": 12,
        "awayPts": 108.34
      },
      {
        "week": 4,
        "homeTeamId": 2,
        "homePts": 105.6,
        "awayTeamId": 8,
        "awayPts": 117.74
      },
      {
        "week": 4,
        "homeTeamId": 4,
        "homePts": 118.12,
        "awayTeamId": 10,
        "awayPts": 105.7
      },
      {
        "week": 5,
        "homeTeamId": 9,
        "homePts": 135.76,
        "awayTeamId": 3,
        "awayPts": 106.6
      },
      {
        "week": 5,
        "homeTeamId": 11,
        "homePts": 91.42,
        "awayTeamId": 1,
        "awayPts": 86.72
      },
      {
        "week": 5,
        "homeTeamId": 7,
        "homePts": 131.26,
        "awayTeamId": 5,
        "awayPts": 98.24
      },
      {
        "week": 5,
        "homeTeamId": 2,
        "homePts": 129.18,
        "awayTeamId": 6,
        "awayPts": 85.14
      },
      {
        "week": 5,
        "homeTeamId": 12,
        "homePts": 97.72,
        "awayTeamId": 4,
        "awayPts": 76.3
      },
      {
        "week": 5,
        "homeTeamId": 8,
        "homePts": 104.0,
        "awayTeamId": 10,
        "awayPts": 117.46
      },
      {
        "week": 6,
        "homeTeamId": 3,
        "homePts": 115.82,
        "awayTeamId": 6,
        "awayPts": 108.12
      },
      {
        "week": 6,
        "homeTeamId": 1,
        "homePts": 90.7,
        "awayTeamId": 4,
        "awayPts": 100.64
      },
      {
        "week": 6,
        "homeTeamId": 5,
        "homePts": 93.14,
        "awayTeamId": 10,
        "awayPts": 123.38
      },
      {
        "week": 6,
        "homeTeamId": 7,
        "homePts": 118.5,
        "awayTeamId": 8,
        "awayPts": 97.42
      },
      {
        "week": 6,
        "homeTeamId": 11,
        "homePts": 83.04,
        "awayTeamId": 12,
        "awayPts": 75.3
      },
      {
        "week": 6,
        "homeTeamId": 9,
        "homePts": 78.54,
        "awayTeamId": 2,
        "awayPts": 91.78
      },
      {
        "week": 7,
        "homeTeamId": 6,
        "homePts": 108.02,
        "awayTeamId": 1,
        "awayPts": 102.38
      },
      {
        "week": 7,
        "homeTeamId": 4,
        "homePts": 113.2,
        "awayTeamId": 5,
        "awayPts": 93.02
      },
      {
        "week": 7,
        "homeTeamId": 10,
        "homePts": 68.42,
        "awayTeamId": 7,
        "awayPts": 140.0
      },
      {
        "week": 7,
        "homeTeamId": 8,
        "homePts": 123.88,
        "awayTeamId": 11,
        "awayPts": 152.86
      },
      {
        "week": 7,
        "homeTeamId": 12,
        "homePts": 85.0,
        "awayTeamId": 9,
        "awayPts": 124.78
      },
      {
        "week": 7,
        "homeTeamId": 2,
        "homePts": 111.42,
        "awayTeamId": 3,
        "awayPts": 101.3
      },
      {
        "week": 8,
        "homeTeamId": 5,
        "homePts": 89.62,
        "awayTeamId": 6,
        "awayPts": 84.12
      },
      {
        "week": 8,
        "homeTeamId": 7,
        "homePts": 109.94,
        "awayTeamId": 4,
        "awayPts": 99.72
      },
      {
        "week": 8,
        "homeTeamId": 11,
        "homePts": 114.66,
        "awayTeamId": 10,
        "awayPts": 97.36
      },
      {
        "week": 8,
        "homeTeamId": 9,
        "homePts": 87.72,
        "awayTeamId": 8,
        "awayPts": 110.0
      },
      {
        "week": 8,
        "homeTeamId": 3,
        "homePts": 84.34,
        "awayTeamId": 12,
        "awayPts": 82.64
      },
      {
        "week": 8,
        "homeTeamId": 1,
        "homePts": 69.86,
        "awayTeamId": 2,
        "awayPts": 126.84
      },
      {
        "week": 9,
        "homeTeamId": 6,
        "homePts": 105.44,
        "awayTeamId": 7,
        "awayPts": 108.5
      },
      {
        "week": 9,
        "homeTeamId": 4,
        "homePts": 91.0,
        "awayTeamId": 11,
        "awayPts": 100.66
      },
      {
        "week": 9,
        "homeTeamId": 10,
        "homePts": 104.76,
        "awayTeamId": 9,
        "awayPts": 98.84
      },
      {
        "week": 9,
        "homeTeamId": 8,
        "homePts": 89.08,
        "awayTeamId": 3,
        "awayPts": 116.32
      },
      {
        "week": 9,
        "homeTeamId": 12,
        "homePts": 75.88,
        "awayTeamId": 1,
        "awayPts": 97.8
      },
      {
        "week": 9,
        "homeTeamId": 2,
        "homePts": 124.8,
        "awayTeamId": 5,
        "awayPts": 100.96
      },
      {
        "week": 10,
        "homeTeamId": 11,
        "homePts": 125.14,
        "awayTeamId": 6,
        "awayPts": 88.92
      },
      {
        "week": 10,
        "homeTeamId": 9,
        "homePts": 89.48,
        "awayTeamId": 4,
        "awayPts": 67.56
      },
      {
        "week": 10,
        "homeTeamId": 3,
        "homePts": 135.7,
        "awayTeamId": 10,
        "awayPts": 99.72
      },
      {
        "week": 10,
        "homeTeamId": 1,
        "homePts": 111.16,
        "awayTeamId": 8,
        "awayPts": 77.64
      },
      {
        "week": 10,
        "homeTeamId": 5,
        "homePts": 93.78,
        "awayTeamId": 12,
        "awayPts": 73.08
      },
      {
        "week": 10,
        "homeTeamId": 7,
        "homePts": 96.3,
        "awayTeamId": 2,
        "awayPts": 51.82
      },
      {
        "week": 11,
        "homeTeamId": 6,
        "homePts": 112.76,
        "awayTeamId": 9,
        "awayPts": 119.36
      },
      {
        "week": 11,
        "homeTeamId": 4,
        "homePts": 87.44,
        "awayTeamId": 3,
        "awayPts": 99.26
      },
      {
        "week": 11,
        "homeTeamId": 10,
        "homePts": 105.6,
        "awayTeamId": 1,
        "awayPts": 127.48
      },
      {
        "week": 11,
        "homeTeamId": 8,
        "homePts": 109.12,
        "awayTeamId": 5,
        "awayPts": 100.18
      },
      {
        "week": 11,
        "homeTeamId": 12,
        "homePts": 80.92,
        "awayTeamId": 7,
        "awayPts": 109.86
      },
      {
        "week": 11,
        "homeTeamId": 2,
        "homePts": 111.98,
        "awayTeamId": 11,
        "awayPts": 104.24
      },
      {
        "week": 12,
        "homeTeamId": 6,
        "homePts": 81.4,
        "awayTeamId": 3,
        "awayPts": 99.4
      },
      {
        "week": 12,
        "homeTeamId": 4,
        "homePts": 63.72,
        "awayTeamId": 1,
        "awayPts": 87.78
      },
      {
        "week": 12,
        "homeTeamId": 10,
        "homePts": 70.76,
        "awayTeamId": 5,
        "awayPts": 89.5
      },
      {
        "week": 12,
        "homeTeamId": 8,
        "homePts": 109.7,
        "awayTeamId": 7,
        "awayPts": 118.42
      },
      {
        "week": 12,
        "homeTeamId": 12,
        "homePts": 89.18,
        "awayTeamId": 11,
        "awayPts": 116.3
      },
      {
        "week": 12,
        "homeTeamId": 2,
        "homePts": 164.7,
        "awayTeamId": 9,
        "awayPts": 90.44
      },
      {
        "week": 13,
        "homeTeamId": 1,
        "homePts": 87.2,
        "awayTeamId": 6,
        "awayPts": 126.24
      },
      {
        "week": 13,
        "homeTeamId": 5,
        "homePts": 92.52,
        "awayTeamId": 4,
        "awayPts": 101.78
      },
      {
        "week": 13,
        "homeTeamId": 7,
        "homePts": 83.0,
        "awayTeamId": 10,
        "awayPts": 144.86
      },
      {
        "week": 13,
        "homeTeamId": 11,
        "homePts": 111.4,
        "awayTeamId": 8,
        "awayPts": 87.9
      },
      {
        "week": 13,
        "homeTeamId": 9,
        "homePts": 76.76,
        "awayTeamId": 12,
        "awayPts": 87.22
      },
      {
        "week": 13,
        "homeTeamId": 3,
        "homePts": 69.52,
        "awayTeamId": 2,
        "awayPts": 113.12
      },
      {
        "week": 14,
        "homeTeamId": 7,
        "homePts": 127.8,
        "awayTeamId": 1,
        "awayPts": 103.92
      },
      {
        "week": 14,
        "homeTeamId": 3,
        "homePts": 112.16,
        "awayTeamId": 9,
        "awayPts": 89.22
      },
      {
        "week": 14,
        "homeTeamId": 6,
        "homePts": 103.24,
        "awayTeamId": 10,
        "awayPts": 82.36
      },
      {
        "week": 14,
        "homeTeamId": 5,
        "homePts": 94.06,
        "awayTeamId": 4,
        "awayPts": 95.72
      },
      {
        "week": 14,
        "homeTeamId": 8,
        "homePts": 70.56,
        "awayTeamId": 12,
        "awayPts": 90.02
      },
      {
        "week": 15,
        "homeTeamId": 2,
        "homePts": 86.74,
        "awayTeamId": 7,
        "awayPts": 92.12
      },
      {
        "week": 15,
        "homeTeamId": 11,
        "homePts": 104.3,
        "awayTeamId": 3,
        "awayPts": 114.14
      },
      {
        "week": 15,
        "homeTeamId": 1,
        "homePts": 110.46,
        "awayTeamId": 9,
        "awayPts": 103.56
      },
      {
        "week": 15,
        "homeTeamId": 6,
        "homePts": 67.32,
        "awayTeamId": 4,
        "awayPts": 119.62
      },
      {
        "week": 15,
        "homeTeamId": 10,
        "homePts": 97.66,
        "awayTeamId": 12,
        "awayPts": 96.66
      },
      {
        "week": 15,
        "homeTeamId": 5,
        "homePts": 108.44,
        "awayTeamId": 8,
        "awayPts": 82.1
      },
      {
        "week": 16,
        "homeTeamId": 3,
        "homePts": 114.18,
        "awayTeamId": 7,
        "awayPts": 93.44
      },
      {
        "week": 16,
        "homeTeamId": 2,
        "homePts": 84.6,
        "awayTeamId": 11,
        "awayPts": 169.62
      },
      {
        "week": 16,
        "homeTeamId": 1,
        "homePts": 77.0,
        "awayTeamId": 9,
        "awayPts": 147.32
      },
      {
        "week": 16,
        "homeTeamId": 10,
        "homePts": 67.86,
        "awayTeamId": 4,
        "awayPts": 94.22
      },
      {
        "week": 16,
        "homeTeamId": 6,
        "homePts": 98.14,
        "awayTeamId": 5,
        "awayPts": 134.6
      },
      {
        "week": 16,
        "homeTeamId": 8,
        "homePts": 97.94,
        "awayTeamId": 12,
        "awayPts": 89.82
      }
    ]
  },
  "2021": {
    "regularSeasonWeeks": 14,
    "teams": [
      {
        "teamId": 12,
        "teamName": "JT and a Bunch of Scrubs",
        "owners": "Tyler Williams",
        "sleeperOwnerId": "676175709789556736",
        "photo": "/managers/tyler.jpg",
        "wins": 10,
        "losses": 4,
        "ties": 0,
        "pointsFor": 1573.86,
        "pointsAgainst": 1446.24,
        "finalRank": 1
      },
      {
        "teamId": 11,
        "teamName": "Corporal  Headass",
        "owners": "Sasan Assary",
        "sleeperOwnerId": null,
        "photo": "/managers/sasan.jpg",
        "wins": 9,
        "losses": 5,
        "ties": 0,
        "pointsFor": 1560.8,
        "pointsAgainst": 1482.6,
        "finalRank": 2
      },
      {
        "teamId": 1,
        "teamName": "The League's Backpack",
        "owners": "Grant Davis",
        "sleeperOwnerId": "869629223269203968",
        "photo": "/managers/grantmelissa1.jpg",
        "wins": 12,
        "losses": 2,
        "ties": 0,
        "pointsFor": 1763.84,
        "pointsAgainst": 1346.68,
        "finalRank": 3
      },
      {
        "teamId": 10,
        "teamName": "Injury Bug",
        "owners": "Justin Williams",
        "sleeperOwnerId": "869641185436807168",
        "photo": "/managers/justin.jpg",
        "wins": 7,
        "losses": 7,
        "ties": 0,
        "pointsFor": 1457.54,
        "pointsAgainst": 1352.56,
        "finalRank": 4
      },
      {
        "teamId": 7,
        "teamName": "Team Yun",
        "owners": "Michael Yun",
        "sleeperOwnerId": "869653222627909632",
        "photo": "/managers/mike.jpg",
        "wins": 7,
        "losses": 7,
        "ties": 0,
        "pointsFor": 1514.4,
        "pointsAgainst": 1548.12,
        "finalRank": 5
      },
      {
        "teamId": 5,
        "teamName": "Mike and Hikes",
        "owners": "Ricky  Mohrig",
        "sleeperOwnerId": "674798465431216128",
        "photo": "/managers/ricky1.jpg",
        "wins": 8,
        "losses": 6,
        "ties": 0,
        "pointsFor": 1444.12,
        "pointsAgainst": 1483.74,
        "finalRank": 6
      },
      {
        "teamId": 8,
        "teamName": "Danny Dimez\ud83e\ude99",
        "owners": "Zach Miller",
        "sleeperOwnerId": "865087831142465536",
        "photo": "/managers/zach.jpg",
        "wins": 6,
        "losses": 8,
        "ties": 0,
        "pointsFor": 1425.46,
        "pointsAgainst": 1525.08,
        "finalRank": 7
      },
      {
        "teamId": 9,
        "teamName": "Slick Daddy  Jim",
        "owners": "Jimmy Zmija",
        "sleeperOwnerId": "869685304523677696",
        "photo": "/managers/jim.jpg",
        "wins": 6,
        "losses": 8,
        "ties": 0,
        "pointsFor": 1425.94,
        "pointsAgainst": 1397.2,
        "finalRank": 8
      },
      {
        "teamId": 4,
        "teamName": "Fleet Footed Raven",
        "owners": "Bill Davis",
        "sleeperOwnerId": "869658110913105920",
        "photo": "/managers/billgrayson.jpg",
        "wins": 5,
        "losses": 9,
        "ties": 0,
        "pointsFor": 1393.94,
        "pointsAgainst": 1456.54,
        "finalRank": 9
      },
      {
        "teamId": 2,
        "teamName": "Team Abrams",
        "owners": "Jordan Abrams",
        "sleeperOwnerId": "864909340086226944",
        "photo": "/managers/jordan.jpg",
        "wins": 6,
        "losses": 8,
        "ties": 0,
        "pointsFor": 1387.2,
        "pointsAgainst": 1480.06,
        "finalRank": 10
      },
      {
        "teamId": 6,
        "teamName": "I Chase Young Kids",
        "owners": "Garrett Davis",
        "sleeperOwnerId": "736961246087241728",
        "photo": "/managers/garrett1.jpg",
        "wins": 4,
        "losses": 10,
        "ties": 0,
        "pointsFor": 1415.24,
        "pointsAgainst": 1572.38,
        "finalRank": 11
      },
      {
        "teamId": 3,
        "teamName": "Team Davis",
        "owners": "Grayson Davis",
        "sleeperOwnerId": null,
        "photo": "/managers/billgrayson.jpg",
        "wins": 4,
        "losses": 10,
        "ties": 0,
        "pointsFor": 1329.0,
        "pointsAgainst": 1600.14,
        "finalRank": 12
      }
    ],
    "matchups": [
      {
        "week": 1,
        "homeTeamId": 5,
        "homePts": 132.36,
        "awayTeamId": 6,
        "awayPts": 109.24
      },
      {
        "week": 1,
        "homeTeamId": 3,
        "homePts": 89.68,
        "awayTeamId": 1,
        "awayPts": 150.3
      },
      {
        "week": 1,
        "homeTeamId": 9,
        "homePts": 96.84,
        "awayTeamId": 2,
        "awayPts": 82.78
      },
      {
        "week": 1,
        "homeTeamId": 7,
        "homePts": 132.02,
        "awayTeamId": 8,
        "awayPts": 104.92
      },
      {
        "week": 1,
        "homeTeamId": 11,
        "homePts": 142.46,
        "awayTeamId": 4,
        "awayPts": 141.66
      },
      {
        "week": 1,
        "homeTeamId": 12,
        "homePts": 98.36,
        "awayTeamId": 10,
        "awayPts": 119.84
      },
      {
        "week": 2,
        "homeTeamId": 6,
        "homePts": 108.08,
        "awayTeamId": 1,
        "awayPts": 110.06
      },
      {
        "week": 2,
        "homeTeamId": 3,
        "homePts": 123.22,
        "awayTeamId": 5,
        "awayPts": 113.9
      },
      {
        "week": 2,
        "homeTeamId": 2,
        "homePts": 91.72,
        "awayTeamId": 8,
        "awayPts": 105.98
      },
      {
        "week": 2,
        "homeTeamId": 7,
        "homePts": 122.5,
        "awayTeamId": 9,
        "awayPts": 119.02
      },
      {
        "week": 2,
        "homeTeamId": 4,
        "homePts": 80.62,
        "awayTeamId": 10,
        "awayPts": 127.36
      },
      {
        "week": 2,
        "homeTeamId": 12,
        "homePts": 85.44,
        "awayTeamId": 11,
        "awayPts": 124.7
      },
      {
        "week": 3,
        "homeTeamId": 3,
        "homePts": 95.4,
        "awayTeamId": 6,
        "awayPts": 87.52
      },
      {
        "week": 3,
        "homeTeamId": 1,
        "homePts": 161.92,
        "awayTeamId": 5,
        "awayPts": 80.84
      },
      {
        "week": 3,
        "homeTeamId": 7,
        "homePts": 89.74,
        "awayTeamId": 2,
        "awayPts": 139.44
      },
      {
        "week": 3,
        "homeTeamId": 8,
        "homePts": 112.52,
        "awayTeamId": 9,
        "awayPts": 98.62
      },
      {
        "week": 3,
        "homeTeamId": 12,
        "homePts": 106.58,
        "awayTeamId": 4,
        "awayPts": 93.12
      },
      {
        "week": 3,
        "homeTeamId": 10,
        "homePts": 115.68,
        "awayTeamId": 11,
        "awayPts": 86.34
      },
      {
        "week": 4,
        "homeTeamId": 6,
        "homePts": 92.32,
        "awayTeamId": 5,
        "awayPts": 103.58
      },
      {
        "week": 4,
        "homeTeamId": 1,
        "homePts": 121.32,
        "awayTeamId": 3,
        "awayPts": 106.12
      },
      {
        "week": 4,
        "homeTeamId": 4,
        "homePts": 147.26,
        "awayTeamId": 2,
        "awayPts": 117.98
      },
      {
        "week": 4,
        "homeTeamId": 11,
        "homePts": 129.62,
        "awayTeamId": 9,
        "awayPts": 80.9
      },
      {
        "week": 4,
        "homeTeamId": 10,
        "homePts": 85.44,
        "awayTeamId": 8,
        "awayPts": 99.02
      },
      {
        "week": 4,
        "homeTeamId": 12,
        "homePts": 118.66,
        "awayTeamId": 7,
        "awayPts": 108.02
      },
      {
        "week": 5,
        "homeTeamId": 1,
        "homePts": 165.5,
        "awayTeamId": 6,
        "awayPts": 123.2
      },
      {
        "week": 5,
        "homeTeamId": 5,
        "homePts": 118.62,
        "awayTeamId": 3,
        "awayPts": 98.48
      },
      {
        "week": 5,
        "homeTeamId": 9,
        "homePts": 107.6,
        "awayTeamId": 4,
        "awayPts": 93.08
      },
      {
        "week": 5,
        "homeTeamId": 8,
        "homePts": 104.38,
        "awayTeamId": 11,
        "awayPts": 135.76
      },
      {
        "week": 5,
        "homeTeamId": 7,
        "homePts": 101.76,
        "awayTeamId": 10,
        "awayPts": 124.08
      },
      {
        "week": 5,
        "homeTeamId": 2,
        "homePts": 109.32,
        "awayTeamId": 12,
        "awayPts": 178.54
      },
      {
        "week": 6,
        "homeTeamId": 6,
        "homePts": 119.92,
        "awayTeamId": 3,
        "awayPts": 115.08
      },
      {
        "week": 6,
        "homeTeamId": 5,
        "homePts": 98.9,
        "awayTeamId": 1,
        "awayPts": 112.12
      },
      {
        "week": 6,
        "homeTeamId": 4,
        "homePts": 93.18,
        "awayTeamId": 8,
        "awayPts": 114.3
      },
      {
        "week": 6,
        "homeTeamId": 11,
        "homePts": 111.96,
        "awayTeamId": 7,
        "awayPts": 141.9
      },
      {
        "week": 6,
        "homeTeamId": 10,
        "homePts": 75.08,
        "awayTeamId": 2,
        "awayPts": 76.8
      },
      {
        "week": 6,
        "homeTeamId": 12,
        "homePts": 82.48,
        "awayTeamId": 9,
        "awayPts": 142.44
      },
      {
        "week": 7,
        "homeTeamId": 5,
        "homePts": 129.64,
        "awayTeamId": 6,
        "awayPts": 107.5
      },
      {
        "week": 7,
        "homeTeamId": 3,
        "homePts": 98.54,
        "awayTeamId": 1,
        "awayPts": 126.18
      },
      {
        "week": 7,
        "homeTeamId": 7,
        "homePts": 82.06,
        "awayTeamId": 4,
        "awayPts": 118.44
      },
      {
        "week": 7,
        "homeTeamId": 2,
        "homePts": 105.92,
        "awayTeamId": 11,
        "awayPts": 120.54
      },
      {
        "week": 7,
        "homeTeamId": 9,
        "homePts": 89.26,
        "awayTeamId": 10,
        "awayPts": 99.98
      },
      {
        "week": 7,
        "homeTeamId": 8,
        "homePts": 78.58,
        "awayTeamId": 12,
        "awayPts": 146.64
      },
      {
        "week": 8,
        "homeTeamId": 2,
        "homePts": 105.12,
        "awayTeamId": 9,
        "awayPts": 101.0
      },
      {
        "week": 8,
        "homeTeamId": 8,
        "homePts": 109.62,
        "awayTeamId": 7,
        "awayPts": 94.56
      },
      {
        "week": 8,
        "homeTeamId": 4,
        "homePts": 99.3,
        "awayTeamId": 6,
        "awayPts": 86.96
      },
      {
        "week": 8,
        "homeTeamId": 11,
        "homePts": 90.86,
        "awayTeamId": 5,
        "awayPts": 113.42
      },
      {
        "week": 8,
        "homeTeamId": 10,
        "homePts": 74.7,
        "awayTeamId": 1,
        "awayPts": 127.36
      },
      {
        "week": 8,
        "homeTeamId": 12,
        "homePts": 103.9,
        "awayTeamId": 3,
        "awayPts": 89.7
      },
      {
        "week": 9,
        "homeTeamId": 8,
        "homePts": 88.8,
        "awayTeamId": 2,
        "awayPts": 113.24
      },
      {
        "week": 9,
        "homeTeamId": 9,
        "homePts": 88.96,
        "awayTeamId": 7,
        "awayPts": 92.52
      },
      {
        "week": 9,
        "homeTeamId": 5,
        "homePts": 83.18,
        "awayTeamId": 4,
        "awayPts": 54.82
      },
      {
        "week": 9,
        "homeTeamId": 1,
        "homePts": 87.26,
        "awayTeamId": 11,
        "awayPts": 71.0
      },
      {
        "week": 9,
        "homeTeamId": 3,
        "homePts": 63.74,
        "awayTeamId": 10,
        "awayPts": 140.44
      },
      {
        "week": 9,
        "homeTeamId": 6,
        "homePts": 109.18,
        "awayTeamId": 12,
        "awayPts": 115.2
      },
      {
        "week": 10,
        "homeTeamId": 2,
        "homePts": 67.3,
        "awayTeamId": 7,
        "awayPts": 82.18
      },
      {
        "week": 10,
        "homeTeamId": 9,
        "homePts": 113.98,
        "awayTeamId": 8,
        "awayPts": 103.74
      },
      {
        "week": 10,
        "homeTeamId": 4,
        "homePts": 97.94,
        "awayTeamId": 1,
        "awayPts": 81.84
      },
      {
        "week": 10,
        "homeTeamId": 11,
        "homePts": 128.58,
        "awayTeamId": 3,
        "awayPts": 84.14
      },
      {
        "week": 10,
        "homeTeamId": 10,
        "homePts": 90.52,
        "awayTeamId": 6,
        "awayPts": 97.7
      },
      {
        "week": 10,
        "homeTeamId": 12,
        "homePts": 89.4,
        "awayTeamId": 5,
        "awayPts": 75.02
      },
      {
        "week": 11,
        "homeTeamId": 9,
        "homePts": 74.86,
        "awayTeamId": 2,
        "awayPts": 84.18
      },
      {
        "week": 11,
        "homeTeamId": 7,
        "homePts": 119.8,
        "awayTeamId": 8,
        "awayPts": 116.34
      },
      {
        "week": 11,
        "homeTeamId": 3,
        "homePts": 61.4,
        "awayTeamId": 4,
        "awayPts": 75.88
      },
      {
        "week": 11,
        "homeTeamId": 6,
        "homePts": 95.8,
        "awayTeamId": 11,
        "awayPts": 114.06
      },
      {
        "week": 11,
        "homeTeamId": 5,
        "homePts": 113.78,
        "awayTeamId": 10,
        "awayPts": 112.96
      },
      {
        "week": 11,
        "homeTeamId": 1,
        "homePts": 144.76,
        "awayTeamId": 12,
        "awayPts": 103.38
      },
      {
        "week": 12,
        "homeTeamId": 4,
        "homePts": 75.08,
        "awayTeamId": 11,
        "awayPts": 90.38
      },
      {
        "week": 12,
        "homeTeamId": 10,
        "homePts": 72.06,
        "awayTeamId": 12,
        "awayPts": 106.84
      },
      {
        "week": 12,
        "homeTeamId": 2,
        "homePts": 84.02,
        "awayTeamId": 6,
        "awayPts": 100.82
      },
      {
        "week": 12,
        "homeTeamId": 9,
        "homePts": 124.68,
        "awayTeamId": 5,
        "awayPts": 79.76
      },
      {
        "week": 12,
        "homeTeamId": 8,
        "homePts": 85.4,
        "awayTeamId": 1,
        "awayPts": 143.1
      },
      {
        "week": 12,
        "homeTeamId": 7,
        "homePts": 139.78,
        "awayTeamId": 3,
        "awayPts": 94.1
      },
      {
        "week": 13,
        "homeTeamId": 10,
        "homePts": 130.82,
        "awayTeamId": 4,
        "awayPts": 106.06
      },
      {
        "week": 13,
        "homeTeamId": 11,
        "homePts": 90.92,
        "awayTeamId": 12,
        "awayPts": 133.52
      },
      {
        "week": 13,
        "homeTeamId": 5,
        "homePts": 81.5,
        "awayTeamId": 2,
        "awayPts": 102.48
      },
      {
        "week": 13,
        "homeTeamId": 1,
        "homePts": 95.2,
        "awayTeamId": 9,
        "awayPts": 102.0
      },
      {
        "week": 13,
        "homeTeamId": 3,
        "homePts": 95.68,
        "awayTeamId": 8,
        "awayPts": 88.02
      },
      {
        "week": 13,
        "homeTeamId": 6,
        "homePts": 115.66,
        "awayTeamId": 7,
        "awayPts": 103.82
      },
      {
        "week": 14,
        "homeTeamId": 11,
        "homePts": 123.62,
        "awayTeamId": 4,
        "awayPts": 117.5
      },
      {
        "week": 14,
        "homeTeamId": 12,
        "homePts": 104.92,
        "awayTeamId": 10,
        "awayPts": 88.58
      },
      {
        "week": 14,
        "homeTeamId": 2,
        "homePts": 106.9,
        "awayTeamId": 1,
        "awayPts": 136.92
      },
      {
        "week": 14,
        "homeTeamId": 9,
        "homePts": 85.78,
        "awayTeamId": 3,
        "awayPts": 113.72
      },
      {
        "week": 14,
        "homeTeamId": 8,
        "homePts": 113.84,
        "awayTeamId": 6,
        "awayPts": 61.34
      },
      {
        "week": 14,
        "homeTeamId": 7,
        "homePts": 103.74,
        "awayTeamId": 5,
        "awayPts": 119.62
      },
      {
        "week": 15,
        "homeTeamId": 11,
        "homePts": 113.08,
        "awayTeamId": 5,
        "awayPts": 64.18
      },
      {
        "week": 15,
        "homeTeamId": 7,
        "homePts": 85.62,
        "awayTeamId": 10,
        "awayPts": 149.7
      },
      {
        "week": 15,
        "homeTeamId": 9,
        "homePts": 99.36,
        "awayTeamId": 8,
        "awayPts": 78.28
      },
      {
        "week": 15,
        "homeTeamId": 2,
        "homePts": 84.54,
        "awayTeamId": 4,
        "awayPts": 84.76
      },
      {
        "week": 15,
        "homeTeamId": 6,
        "homePts": 76.48,
        "awayTeamId": 3,
        "awayPts": 73.4
      },
      {
        "week": 16,
        "homeTeamId": 1,
        "homePts": 134.66,
        "awayTeamId": 11,
        "awayPts": 151.0
      },
      {
        "week": 16,
        "homeTeamId": 12,
        "homePts": 124.08,
        "awayTeamId": 10,
        "awayPts": 108.26
      },
      {
        "week": 16,
        "homeTeamId": 7,
        "homePts": 59.48,
        "awayTeamId": 5,
        "awayPts": 103.36
      },
      {
        "week": 16,
        "homeTeamId": 9,
        "homePts": 103.28,
        "awayTeamId": 4,
        "awayPts": 71.8
      },
      {
        "week": 16,
        "homeTeamId": 8,
        "homePts": 99.3,
        "awayTeamId": 6,
        "awayPts": 77.4
      },
      {
        "week": 16,
        "homeTeamId": 2,
        "homePts": 76.64,
        "awayTeamId": 3,
        "awayPts": 72.22
      },
      {
        "week": 17,
        "homeTeamId": 12,
        "homePts": 143.0,
        "awayTeamId": 11,
        "awayPts": 107.32
      },
      {
        "week": 17,
        "homeTeamId": 1,
        "homePts": 117.6,
        "awayTeamId": 10,
        "awayPts": 80.68
      },
      {
        "week": 17,
        "homeTeamId": 7,
        "homePts": 82.32,
        "awayTeamId": 5,
        "awayPts": 78.46
      },
      {
        "week": 17,
        "homeTeamId": 9,
        "homePts": 86.86,
        "awayTeamId": 8,
        "awayPts": 116.04
      },
      {
        "week": 17,
        "homeTeamId": 2,
        "homePts": 76.98,
        "awayTeamId": 4,
        "awayPts": 116.58
      },
      {
        "week": 17,
        "homeTeamId": 6,
        "homePts": 84.5,
        "awayTeamId": 3,
        "awayPts": 75.86
      }
    ]
  }
};
