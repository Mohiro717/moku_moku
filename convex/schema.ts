import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bananaScores: defineTable({
    score: v.number(),
    playerName: v.optional(v.string()),
    timestamp: v.number(),
    gameType: v.string(),
  })
    .index("by_score", ["score"])
    .index("by_game_type", ["gameType"])
    .index("by_timestamp", ["timestamp"]),
});