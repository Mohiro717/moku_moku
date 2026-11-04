import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// サーバー側の検査。クライアントは書き換えられるので、ここが最後の砦。
const ALLOWED_GAME_TYPES = ["catch-the-banana"];
// 30秒のゲームで1タップ1点。人間が届かない上限で切る。
const MAX_SCORE = 300;
const MAX_NAME_LENGTH = 20; // NameInputModal の maxLength と揃える
const MAX_LIMIT = 50;

const assertGameType = (gameType: string) => {
  if (!ALLOWED_GAME_TYPES.includes(gameType)) {
    throw new Error("Unknown gameType");
  }
};

const clampLimit = (limit: number | undefined) => {
  const n = Number.isFinite(limit) ? Math.floor(limit as number) : 10;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
};

export const saveScore = mutation({
  args: {
    score: v.number(),
    playerName: v.optional(v.string()),
    gameType: v.string(),
  },
  handler: async (ctx, args) => {
    assertGameType(args.gameType);
    if (!Number.isInteger(args.score) || args.score < 0 || args.score > MAX_SCORE) {
      throw new Error("Invalid score");
    }
    const playerName = args.playerName?.trim().slice(0, MAX_NAME_LENGTH) || undefined;

    return await ctx.db.insert("bananaScores", {
      score: args.score,
      playerName,
      timestamp: Date.now(),
      gameType: args.gameType,
    });
  },
});

export const getTopScores = query({
  args: {
    gameType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bananaScores")
      .withIndex("by_game_type", (q) => q.eq("gameType", args.gameType))
      .order("desc")
      .take(clampLimit(args.limit));
  },
});

export const getAllTimeRankings = query({
  args: {
    gameType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bananaScores")
      .withIndex("by_game_type", (q) => q.eq("gameType", args.gameType))
      .order("desc")
      .take(clampLimit(args.limit));
  },
});
