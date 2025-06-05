import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { useAccount } from "@starknet-react/core"
import { Coins, Trophy, Zap, Heart } from "lucide-react"

export function PlayerStats() {
  const { address, status } = useAccount();
  
  // Mock data para el starter - después vendrá de hooks reales como usePlayer
  const mockState = {
    level: 1,
    experience: 0,
    maxExp: 100,
    health: 100,
    coins: 0
  };

  const isConnected = status === "connected";

  const stats = [
    { label: "Level", value: mockState.level, color: "text-red-400" },
    { label: "Health", value: mockState.health, color: "text-green-400" },
    { label: "Coins", value: mockState.coins, color: "text-yellow-400" },
  ];

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-red-400 text-xl font-bold">Player Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-slate-300">{stat.label}</span>
            <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
          </div>
        ))}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Experience</span>
            <span className="text-blue-400 font-bold">
              {mockState.experience} / {mockState.maxExp}
            </span>
          </div>
          <Progress value={(mockState.experience / mockState.maxExp) * 100} className="h-2 bg-slate-700" />
        </div>

        {!isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Trophy className="w-4 h-4" />
              <span>Connect wallet to load real player stats</span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>Wallet connected! Stats will update after spawning player.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}