export interface RankingEntry {
  id: string;
  score: number;
  playerName: string;
  timestamp: number;
  gameType: string;
}

const RANKING_STORAGE_KEY = 'bananaGameRankings';
const MAX_RANKING_ENTRIES = 10;

export const getRankings = (gameType: string): RankingEntry[] => {
  try {
    const stored = localStorage.getItem(RANKING_STORAGE_KEY);
    if (!stored) return [];
    
    const allRankings: RankingEntry[] = JSON.parse(stored);
    return allRankings
      .filter(entry => entry.gameType === gameType)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RANKING_ENTRIES);
  } catch (error) {
    console.error('Failed to load rankings:', error);
    return [];
  }
};

export const saveScore = (score: number, playerName: string, gameType: string): void => {
  try {
    const stored = localStorage.getItem(RANKING_STORAGE_KEY);
    const allRankings: RankingEntry[] = stored ? JSON.parse(stored) : [];
    
    const newEntry: RankingEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      score,
      playerName: playerName.trim() || 'Anonymous',
      timestamp: Date.now(),
      gameType,
    };
    
    // Add new entry
    allRankings.push(newEntry);
    
    // Keep only top entries for this game type
    const gameRankings = allRankings
      .filter(entry => entry.gameType === gameType)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RANKING_ENTRIES);
    
    // Keep other game types and add filtered current game type
    const otherGameRankings = allRankings.filter(entry => entry.gameType !== gameType);
    const finalRankings = [...otherGameRankings, ...gameRankings];
    
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(finalRankings));
  } catch (error) {
    console.error('Failed to save score:', error);
  }
};

export const isHighScore = (score: number, gameType: string): boolean => {
  const rankings = getRankings(gameType);
  
  // If less than max entries, it's always a high score (and score > 0)
  if (rankings.length < MAX_RANKING_ENTRIES) {
    return score > 0;
  }
  
  // Check if score is higher than the lowest ranked score
  const lowestScore = rankings[rankings.length - 1]?.score || 0;
  return score > lowestScore;
};