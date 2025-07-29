import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveScore = mutation({
  args: {
    score: v.number(),
    playerName: v.optional(v.string()),
    gameType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bananaScores", {
      score: args.score,
      playerName: args.playerName,
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
    const limit = args.limit ?? 10;
    
    return await ctx.db
      .query("bananaScores")
      .withIndex("by_game_type", (q) => q.eq("gameType", args.gameType))
      .order("desc")
      .take(limit);
  },
});

export const getAllTimeRankings = query({
  args: {
    gameType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    return await ctx.db
      .query("bananaScores")
      .withIndex("by_game_type", (q) => q.eq("gameType", args.gameType))
      .order("desc")
      .take(limit);
  },
});