import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Account } from "starknet";
import useAppStore from "../../zustand/store";

interface TrainActionState {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
}

interface UseTrainActionReturn {
  trainState: TrainActionState;
  executeTrain: () => Promise<void>;
  canTrain: boolean;
  resetTrainState: () => void;
}

export const useTrainAction = (): UseTrainActionReturn => {
  const { account, status } = useAccount();
  const { client } = useDojoSDK();
  const { player, updatePlayerExperience } = useAppStore();

  const [trainState, setTrainState] = useState<TrainActionState>({
    isLoading: false,
    error: null,
    txHash: null,
    txStatus: null
  });

  const isConnected = status === "connected";
  const hasPlayer = player !== null;
  const canTrain = isConnected && hasPlayer && !trainState.isLoading;

  const executeTrain = useCallback(async () => {
    if (!canTrain || !account) {
      setTrainState(prev => ({
        ...prev,
        error: !account ? "Please connect your controller" : "Cannot train right now"
      }));
      return;
    }

    try {
      setTrainState({
        isLoading: true,
        error: null,
        txHash: null,
        txStatus: 'PENDING'
      });

      console.log("📤 Executing train transaction...");

      const tx = await client.game.train(account as Account);
      console.log("📥 Train transaction response:", tx);

      if (tx?.transaction_hash) {
        setTrainState(prev => ({ ...prev, txHash: tx.transaction_hash }));
      }

      if (tx && tx.code === "SUCCESS") {
        console.log("✅ Train transaction successful!");

        // Optimistic update: +10 experience
        updatePlayerExperience((player?.experience || 0) + 10);

        setTrainState(prev => ({
          ...prev,
          txStatus: 'SUCCESS',
          isLoading: false
        }));

        // Auto-clear after 3 seconds
        setTimeout(() => {
          setTrainState({
            isLoading: false,
            error: null,
            txHash: null,
            txStatus: null
          });
        }, 3000);

      } else {
        throw new Error(`Train transaction failed with code: ${tx?.code || 'unknown'}`);
      }

    } catch (error) {
      console.error("❌ Error executing train:", error);

      setTrainState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        txHash: null,
        txStatus: 'REJECTED'
      });

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setTrainState({
          isLoading: false,
          error: null,
          txHash: null,
          txStatus: null
        });
      }, 5000);
    }
  }, [canTrain, account, client.game, player, updatePlayerExperience]);

  const resetTrainState = useCallback(() => {
    setTrainState({
      isLoading: false,
      error: null,
      txHash: null,
      txStatus: null
    });
  }, []);

  return {
    trainState,
    executeTrain,
    canTrain,
    resetTrainState
  };
};