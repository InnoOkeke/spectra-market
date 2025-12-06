/**
 * Sports Market Mapping Utility
 * Maps external sports event IDs to on-chain market IDs
 */

const SPORTS_MARKET_MAPPING_KEY = "spectra_sports_market_mapping";

export interface SportsMarketMapping {
  sportsEventId: string;
  onChainMarketId: number;
  question: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  deadline: string;
  createdAt: number;
}

/**
 * Get all sports market mappings from localStorage
 */
export function getSportsMarketMappings(): SportsMarketMapping[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(SPORTS_MARKET_MAPPING_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading sports market mappings:", error);
    return [];
  }
}

/**
 * Save a new sports market mapping
 */
export function saveSportsMarketMapping(mapping: SportsMarketMapping): void {
  if (typeof window === "undefined") return;
  
  try {
    const mappings = getSportsMarketMappings();
    
    // Check if already exists
    const exists = mappings.find(m => m.sportsEventId === mapping.sportsEventId);
    if (exists) {
      console.warn("Sports market mapping already exists:", mapping.sportsEventId);
      return;
    }
    
    mappings.push(mapping);
    localStorage.setItem(SPORTS_MARKET_MAPPING_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error("Error saving sports market mapping:", error);
  }
}

/**
 * Get on-chain market ID for a sports event
 */
export function getOnChainMarketId(sportsEventId: string): number | null {
  const mappings = getSportsMarketMappings();
  const mapping = mappings.find(m => m.sportsEventId === sportsEventId);
  return mapping ? mapping.onChainMarketId : null;
}

/**
 * Get sports event info for an on-chain market
 */
export function getSportsEventInfo(onChainMarketId: number): SportsMarketMapping | null {
  const mappings = getSportsMarketMappings();
  return mappings.find(m => m.onChainMarketId === onChainMarketId) || null;
}

/**
 * Check if a sports event has been created on-chain
 */
export function isSportsMarketCreated(sportsEventId: string): boolean {
  return getOnChainMarketId(sportsEventId) !== null;
}

/**
 * Clear all mappings (for testing/reset)
 */
export function clearSportsMarketMappings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SPORTS_MARKET_MAPPING_KEY);
}
