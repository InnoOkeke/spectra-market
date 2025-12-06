// Sports API integration using The Odds API (free tier)
// Get your free API key at: https://the-odds-api.com/

export interface SportsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: any[];
}

export interface SportsMarket {
  id: string;
  question: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  deadline: string;
  volume: string;
  participants: number;
}

// Free sports API - no key required for basic data
const SPORTS_API_URL = 'https://www.thesportsdb.com/api/v1/json/3';

/**
 * Fetch upcoming sports events
 */
export async function fetchUpcomingSportsEvents(): Promise<SportsMarket[]> {
  try {
    // Using TheSportsDB free API
    // Fetch upcoming events from multiple leagues
    const leagues = [
      { id: '4328', name: 'English Premier League', sport: 'Soccer' },
      { id: '4391', name: 'NBA', sport: 'Basketball' },
      { id: '4424', name: 'NFL', sport: 'American Football' },
    ];

    const allMarkets: SportsMarket[] = [];
    
    for (const league of leagues) {
      try {
        const response = await fetch(`${SPORTS_API_URL}/eventsnextleague.php?id=${league.id}`, {
          next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.events && Array.isArray(data.events)) {
            const markets = data.events.slice(0, 5).map((event: any, idx: number) => ({
              id: `sport-${league.id}-${idx}`,
              question: `Will ${event.strHomeTeam} beat ${event.strAwayTeam}?`,
              sport: league.sport,
              homeTeam: event.strHomeTeam || 'TBD',
              awayTeam: event.strAwayTeam || 'TBD',
              deadline: event.dateEvent || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              volume: `${(Math.random() * 50 + 10).toFixed(1)} ETH`,
              participants: Math.floor(Math.random() * 200 + 50),
            }));
            
            allMarkets.push(...markets);
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch ${league.name}:`, err);
      }
    }

    // If API fails, return mock data
    if (allMarkets.length === 0) {
      return getMockSportsMarkets();
    }

    return allMarkets.slice(0, 10);
  } catch (error) {
    console.error('Error fetching sports events:', error);
    return getMockSportsMarkets();
  }
}

/**
 * Mock sports markets for fallback
 */
function getMockSportsMarkets(): SportsMarket[] {
  return [
    {
      id: 'sport-1',
      question: 'Will Manchester United beat Liverpool?',
      sport: 'Soccer',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      deadline: '2025-12-15',
      volume: '45.2 ETH',
      participants: 189,
    },
    {
      id: 'sport-2',
      question: 'Will Lakers beat Warriors?',
      sport: 'Basketball',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      deadline: '2025-12-20',
      volume: '32.8 ETH',
      participants: 156,
    },
    {
      id: 'sport-3',
      question: 'Will Chiefs beat Bills?',
      sport: 'American Football',
      homeTeam: 'Chiefs',
      awayTeam: 'Bills',
      deadline: '2025-12-25',
      volume: '68.5 ETH',
      participants: 234,
    },
    {
      id: 'sport-4',
      question: 'Will Arsenal beat Chelsea?',
      sport: 'Soccer',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      deadline: '2025-12-18',
      volume: '41.3 ETH',
      participants: 167,
    },
    {
      id: 'sport-5',
      question: 'Will Celtics beat Heat?',
      sport: 'Basketball',
      homeTeam: 'Celtics',
      awayTeam: 'Heat',
      deadline: '2025-12-22',
      volume: '29.7 ETH',
      participants: 142,
    },
  ];
}

/**
 * Get sport emoji icon
 */
export function getSportIcon(sport: string): string {
  const icons: Record<string, string> = {
    'Soccer': '⚽',
    'Basketball': '🏀',
    'American Football': '🏈',
    'Baseball': '⚾',
    'Hockey': '🏒',
    'Tennis': '🎾',
    'Cricket': '🏏',
  };
  
  return icons[sport] || '🏆';
}
