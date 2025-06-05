import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { useAccount } from "@starknet-react/core"
import useAppStore from "../zustand/store"
import { Trophy, Zap, Heart, Loader2 } from "lucide-react"

export function PlayerStats() {
  const { status } = useAccount();
  const player = useAppStore(state => state.player);
  const isLoading = useAppStore(state => state.isLoading);
  
  const isConnected = status === "connected";

  // Use real player data or default values
  const stats = [
    { label: "Experience", value: player?.experience || 0, color: "text-blue-400" },
    { label: "Health", value: player?.health || 100, color: "text-green-400" },
    { label: "Coins", value: player?.coins || 0, color: "text-yellow-400" },
  ];

  // Calculate experience for level up (example: every 100 exp = 1 level)
  const currentLevel = Math.floor((player?.experience || 0) / 100) + 1;
  const expInCurrentLevel = (player?.experience || 0) % 100;
  const expNeededForNextLevel = 100;

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-red-400 text-xl font-bold">Player Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading player data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-red-400 text-xl font-bold">Player Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main stats */}
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-slate-300">{stat.label}</span>
            <span className={`font-bold text-lg ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}

        {/* Experience bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Level {currentLevel}</span>
            <span className="text-blue-400 font-bold">
              {expInCurrentLevel} / {expNeededForNextLevel}
            </span>
          </div>
          <Progress 
            value={(expInCurrentLevel / expNeededForNextLevel) * 100} 
            className="h-2 bg-slate-700" 
          />
        </div>

        {/* Connection states */}
        {!isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Trophy className="w-4 h-4" />
              <span>Connect wallet to load real player stats</span>
            </div>
          </div>
        )}

        {isConnected && !player && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>Creating your player automatically...</span>
            </div>
          </div>
        )}

        {isConnected && player && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Heart className="w-4 h-4" />
              <span>Player loaded! Ready to play.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}