// components/status-bar.tsx
import { Button } from "./ui/button"
import { useStarknetConnect } from "../dojo/hooks/useStarknetConnect"
import { Loader2, Wallet, CheckCircle, LogOut } from "lucide-react"

export function StatusBar() {
  const { 
    status, 
    address, 
    isConnecting, 
    handleConnect, 
    handleDisconnect 
  } = useStarknetConnect();

  const isConnected = status === "connected";
  const isLoading = isConnecting || status === "connecting";

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
              {isLoading ? (
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
                className="px-6 py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 cursor-default"
                disabled
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Connected
              </Button>
              
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="px-4 py-3 border-white/20 hover:border-white/40 hover:bg-white/10 text-white hover:text-white"
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

        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isConnected ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-slate-300">
            {isConnected ? 'Connected to' : 'Available on'} Sepolia
          </span>
        </div>
      </div>
    </div>
  )
}