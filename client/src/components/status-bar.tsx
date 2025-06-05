import { Button } from "./ui/button"
import { useStarknetConnect } from "../dojo/hooks/useStarknetConnect"
import { useSpawnPlayer } from "../dojo/hooks/useSpawnPlayer"
import { usePlayer } from "../dojo/hooks/usePlayer"
import { Loader2, Wallet, CheckCircle, LogOut, UserPlus } from "lucide-react"
import { useEffect } from "react"

export function StatusBar() {
  const {
    status,
    address,
    isConnecting,
    handleConnect,
    handleDisconnect
  } = useStarknetConnect();

  const { player, isLoading: playerLoading } = usePlayer();
  const {
    initializePlayer,
    isInitializing,
    txStatus,
    txHash
  } = useSpawnPlayer();

  const isConnected = status === "connected";
  const isLoading = isConnecting || status === "connecting" || isInitializing || playerLoading;

  // 🎮 Auto-initialize player after connecting wallet
  useEffect(() => {
    if (isConnected && !player && !isInitializing && !playerLoading) {
      console.log("🎮 Wallet connected but no player found, auto-initializing...");
      // Small delay to make it feel natural
      setTimeout(() => {
        initializePlayer().then(result => {
          console.log("🎮 Auto-initialization result:", result);
        });
      }, 500);
    }
  }, [isConnected, player, isInitializing, playerLoading, initializePlayer]);

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusMessage = () => {
    if (!isConnected) return "Connect your wallet to start playing";
    if (playerLoading) return "Loading player data...";
    if (isInitializing) {
      if (txStatus === 'PENDING') return "Creating player on blockchain...";
      if (txStatus === 'SUCCESS') return "Player created successfully!";
      return "Initializing player...";
    }
    if (player) return "Ready to play!";
    return "Preparing...";
  };

  const getPlayerStatus = () => {
    if (!isConnected) return { color: "bg-red-500", text: "Disconnected" };
    if (isInitializing) return { color: "bg-yellow-500", text: "Creating..." };
    if (player) return { color: "bg-green-500", text: "Ready" };
    return { color: "bg-yellow-500", text: "Loading..." };
  };

  const playerStatus = getPlayerStatus();

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-6 py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isConnecting || status === "connecting") ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                className={`px-6 py-3 font-semibold transition-all duration-300 shadow-lg cursor-default ${player
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30"
                  : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-500/30"
                  }`}
                disabled
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Player
                  </>
                ) : player ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Player Ready
                  </>
                ) : playerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Player
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Preparing
                  </>
                )}
              </Button>

              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="px-4 py-3 border-white/20 hover:border-white/40 hover:bg-white/10 text-white hover:text-white"
                disabled={isInitializing}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}

          {address && (
            <span className="text-slate-300 font-mono text-sm bg-slate-800/50 px-3 py-1 rounded-lg">
              {formatAddress(address)}
            </span>
          )}
        </div>

        <div className="text-center md:text-right">
          <div className="flex items-center gap-2 text-sm mb-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${playerStatus.color}`}></div>
            <span className="text-slate-300">
              {playerStatus.text} • Sepolia
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {getStatusMessage()}
          </div>
        </div>
      </div>

      {/* Transaction Hash Display */}
      {txHash && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-blue-400 text-sm">
            <span className="font-semibold">Player Creation Tx: </span>
            <a
              href={`https://sepolia.starkscan.co/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              {formatAddress(txHash)}
            </a>
            <span className="ml-2">
              {txStatus === 'PENDING' && '⏳'}
              {txStatus === 'SUCCESS' && '✅'}
              {txStatus === 'REJECTED' && '❌'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}