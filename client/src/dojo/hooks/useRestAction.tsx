import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Account } from "starknet";
import useAppStore from "../../zustand/store";

interface RestActionState {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
}

interface UseRestActionReturn {
  restState: RestActionState;
  executeRest: () => Promise<void>;
  canRest: boolean;
  resetRestState: () => void;
}

export const useRestAction = (): UseRestActionReturn => {
  const { account, status } = useAccount();
  const { client } = useDojoSDK();
  const { player, updatePlayerHealth } = useAppStore();

  const [restState, setRestState] = useState<RestActionState>({
    isLoading: false,
    error: null,
    txHash: null,
    txStatus: null
  });

  const isConnected = status === "connected";
  const hasPlayer = player !== null;
  const needsHealth = (player?.health || 0) < 100;
  const canRest = isConnected && hasPlayer && needsHealth && !restState.isLoading;

  const executeRest = useCallback(async () => {
    if (!canRest || !account) {
      const errorMsg = !account
        ? "Please connect your controller"
        : !needsHealth
          ? "Health is already full"
          : "Cannot rest right now";

      setRestState(prev => ({ ...prev, error: errorMsg }));
      return;
    }

    try {
      setRestState({
        isLoading: true,
        error: null,
        txHash: null,
        txStatus: 'PENDING'
      });

      console.log("📤 Executing rest transaction...");

      const tx = await client.game.rest(account as Account);
      console.log("📥 Rest transaction response:", tx);

      if (tx?.transaction_hash) {
        setRestState(prev => ({ ...prev, txHash: tx.transaction_hash }));
      }

      if (tx && tx.code === "SUCCESS") {
        console.log("✅ Rest transaction successful!");

        // Optimistic update: +20 health (max 100)
        updatePlayerHealth(Math.min(100, (player?.health || 100) + 20));

        setRestState(prev => ({
          ...prev,
          txStatus: 'SUCCESS',
          isLoading: false
        }));

        // Auto-clear after 3 seconds
        setTimeout(() => {
          setRestState({
            isLoading: false,
            error: null,
            txHash: null,
            txStatus: null
          });
        }, 3000);

      } else {
        throw new Error(`Rest transaction failed with code: ${tx?.code || 'unknown'}`);
      }

    } catch (error) {
      console.error("❌ Error executing rest:", error);

      setRestState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        txHash: null,
        txStatus: 'REJECTED'
      });

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setRestState({
          isLoading: false,
          error: null,
          txHash: null,
          txStatus: null
        });
      }, 5000);
    }
  }, [canRest, account, client.game, player, updatePlayerHealth, needsHealth]);

  const resetRestState = useCallback(() => {
    setRestState({
      isLoading: false,
      error: null,
      txHash: null,
      txStatus: null
    });
  }, []);

  return {
    restState,
    executeRest,
    canRest,
    resetRestState
  };
};