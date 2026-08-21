import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EloRating, ArenaMatch, ArenaVoteType } from '../types';
import { INITIAL_ELO_RATINGS, calculateNewElo, updateModelStats } from '../lib/elo';
import { MOCK_MODELS } from '../data/mock';

interface ArenaState {
  arenaTab: 'battle' | 'leaderboard';
  isBlindMode: boolean;
  isRevealed: boolean;
  ratings: Record<string, EloRating>;
  matchHistory: ArenaMatch[];
  lastMatchResult: ArenaMatch | null;

  setArenaTab: (tab: 'battle' | 'leaderboard') => void;
  setIsBlindMode: (blind: boolean) => void;
  setIsRevealed: (revealed: boolean) => void;
  recordVote: (
    prompt: string,
    modelAId: string,
    modelBId: string,
    vote: ArenaVoteType
  ) => ArenaMatch;
  resetLeaderboard: () => void;
}

export const useArenaStore = create<ArenaState>()(
  persist(
    (set, get) => ({
      arenaTab: 'battle',
      isBlindMode: true,
      isRevealed: false,
      ratings: INITIAL_ELO_RATINGS,
      matchHistory: [],
      lastMatchResult: null,

      setArenaTab: (tab) => set({ arenaTab: tab }),
      setIsBlindMode: (blind) => set({ isBlindMode: blind, isRevealed: false }),
      setIsRevealed: (revealed) => set({ isRevealed: revealed }),

      recordVote: (prompt, modelAId, modelBId, vote) => {
        const { ratings, matchHistory } = get();

        const modelA = ratings[modelAId] || {
          modelId: modelAId,
          name: MOCK_MODELS.find((m) => m.id === modelAId)?.name || modelAId,
          provider: 'OpenAI',
          elo: 1200,
          matches: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winRate: 0,
          lastUpdated: new Date().toISOString(),
        };

        const modelB = ratings[modelBId] || {
          modelId: modelBId,
          name: MOCK_MODELS.find((m) => m.id === modelBId)?.name || modelBId,
          provider: 'Anthropic',
          elo: 1200,
          matches: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winRate: 0,
          lastUpdated: new Date().toISOString(),
        };

        const { newRatingA, newRatingB, deltaA, deltaB } = calculateNewElo(modelA.elo, modelB.elo, vote);

        const outcomeA = vote === 'modelA' ? 'win' : vote === 'modelB' ? 'loss' : vote === 'tie' ? 'tie' : 'bad';
        const outcomeB = vote === 'modelB' ? 'win' : vote === 'modelA' ? 'loss' : vote === 'tie' ? 'tie' : 'bad';

        const updatedA = updateModelStats(modelA, newRatingA, outcomeA);
        const updatedB = updateModelStats(modelB, newRatingB, outcomeB);

        const matchRecord: ArenaMatch = {
          id: `match_${Date.now()}`,
          timestamp: new Date().toISOString(),
          prompt,
          modelAId,
          modelBId,
          modelAName: modelA.name,
          modelBName: modelB.name,
          winner: vote,
          modelAOldElo: modelA.elo,
          modelANewElo: newRatingA,
          modelBOldElo: modelB.elo,
          modelBNewElo: newRatingB,
          deltaA,
          deltaB,
        };

        set({
          ratings: {
            ...ratings,
            [modelAId]: updatedA,
            [modelBId]: updatedB,
          },
          matchHistory: [matchRecord, ...matchHistory.slice(0, 49)],
          lastMatchResult: matchRecord,
          isRevealed: true,
        });

        return matchRecord;
      },

      resetLeaderboard: () => {
        set({
          ratings: INITIAL_ELO_RATINGS,
          matchHistory: [],
          lastMatchResult: null,
          isRevealed: false,
        });
      },
    }),
    {
      name: 'dataco-arena-elo-storage',
    }
  )
);
