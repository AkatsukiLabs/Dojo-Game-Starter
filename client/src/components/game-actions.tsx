import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useAccount } from "@starknet-react/core"
import { useDojoSDK } from "@dojoengine/sdk/react"
import { Dumbbell, Hammer, Bed, Loader2 } from "lucide-react"
import { useState } from "react"

export function GameActions() {
  const { account, status } = useAccount();
  const { client } = useDojoSDK();
  
  // Local state to replace the game context
  const [txStatus, setTxStatus] = useState<{
    message: string;
    type: "pending" | "success" | "error" | null;
  }>({ message: "", type: null });

  const isConnected = status === "connected";

  const executeAction = async (actionType: "train" | "mine" | "rest", message: string) => {
    if (!isConnected) {
      setTxStatus({
        message: "Please connect your wallet first",
        type: "error"
      });
      setTimeout(() => setTxStatus({ message: "", type: null }), 3000);
      return;
    }

    // Set pending status
    setTxStatus({
      message: `${message}... Transaction pending`,
      type: "pending"
    });

    try {
      // TODO: Replace with real contract calls when ready
      // For now, simulate the transaction
      setTimeout(() => {
        setTxStatus({
          message: `${message} completed!`,
          type: "success"
        });

        setTimeout(() => {
          setTxStatus({ message: "", type: null });
        }, 3000);
      }, 2000);

      // Real contract calls will look like this:
      // if (actionType === "train") {
      //   await client.game.train(account);
      // } else if (actionType === "mine") {
      //   await client.game.mine(account);
      // } else if (actionType === "rest") {
      //   await client.game.rest(account);
      // }

    } catch (error) {
      setTxStatus({
        message: `${message} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: "error"
      });
      
      setTimeout(() => {
        setTxStatus({ message: "", type: null });
      }, 5000);
    }
  };

  const actions = [
    {
      icon: Dumbbell,
      label: "Train",
      description: "+10 EXP",
      onClick: () => executeAction("train", "Training"),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Hammer,
      label: "Mine",
      description: "+5 Coins",
      onClick: () => executeAction("mine", "Mining"),
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Bed,
      label: "Rest",
      description: "+20 Health",
      onClick: () => executeAction("rest", "Resting"),
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-red-400 text-xl font-bold">Game Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              onClick={action.onClick}
              disabled={!isConnected || txStatus.type === "pending"}
              className={`w-full h-14 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">{action.label}</span>
                <span className="text-xs opacity-80">{action.description}</span>
              </div>
            </Button>
          );
        })}

        {txStatus.message && (
          <div
            className={`p-4 rounded-lg border ${
              txStatus.type === "pending"
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                : txStatus.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {txStatus.type === "pending" && <Loader2 className="w-4 h-4 animate-spin" />}
              <span className="text-sm">{txStatus.message}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}