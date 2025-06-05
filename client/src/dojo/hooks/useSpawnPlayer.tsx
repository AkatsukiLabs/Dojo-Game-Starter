// src/hooks/useSpawnPlayer.ts
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { Account } from "starknet";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useStarknetConnect } from "./useStarknetConnect";
import { usePlayer } from "./usePlayer";
import useAppStore from "../../zustand/store";

// Types
interface InitializeState {
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  step: 'checking' | 'spawning' | 'loading' | 'success';
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
}

interface InitializeResponse {
  success: boolean;
  playerExists: boolean;
  transactionHash?: string;
  error?: string;
}

export const useSpawnPlayer = () => {
  const { useDojoStore, client } = useDojoSDK();
  const dojoState = useDojoStore((state) => state);
  const { account } = useAccount();
  const { status } = useStarknetConnect();
  const { player, isLoading: playerLoading, refetch: refetchPlayer } = usePlayer();
  const { setLoading } = useAppStore();

  // Estado local
  const [initState, setInitState] = useState<InitializeState>({
    isInitializing: false,
    error: null,
    completed: false,
    step: 'checking',
    txHash: null,
    txStatus: null
  });
  
  // Tracking si estamos inicializando
  const [isInitializing, setIsInitializing] = useState(false);
  
  /**
   * Verifica si el player existe e inicializa según corresponda
   */
  const initializePlayer = useCallback(async (): Promise<InitializeResponse> => {
    // Prevenir ejecuciones múltiples
    if (isInitializing) {
      return { success: false, playerExists: false, error: "Already initializing" };
    }
    
    setIsInitializing(true);
    
    // Validación: Verificar que la wallet esté conectada
    if (status !== "connected") {
      const error = "Wallet not connected. Please connect your wallet first.";
      setInitState(prev => ({ ...prev, error }));
      setIsInitializing(false);
      return { success: false, playerExists: false, error };
    }

    // Validación: Verificar que la cuenta exista
    if (!account) {
      const error = "No account found. Please connect your wallet.";
      setInitState(prev => ({ ...prev, error }));
      setIsInitializing(false);
      return { success: false, playerExists: false, error };
    }

    const transactionId = uuidv4();

    try {
      // Iniciar proceso de inicialización
      setInitState(prev => ({ 
        ...prev, 
        isInitializing: true, 
        error: null,
        step: 'checking'
      }));

      console.log("🎮 Starting player initialization...");
      
      // Refetch datos del player
      console.log("🔄 Fetching latest player data...");
      await refetchPlayer();
      
      // Esperar un poco para asegurar que los datos se carguen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificación directa desde el store
      const storePlayer = useAppStore.getState().player;
      
      // Verificación simple si el player existe en el store
      const playerExists = storePlayer !== null;
      
      console.log("🎮 Final player check:", { 
        playerExists, 
        playerInStore: !!storePlayer,
        accountAddress: account.address
      });

      if (playerExists) {
        // Player existe - cargar datos y continuar
        console.log("✅ Player already exists, continuing with existing data...");
        
        setInitState(prev => ({ 
          ...prev, 
          step: 'loading'
        }));
        
        // Pequeño delay para mostrar estado de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setInitState(prev => ({ 
          ...prev, 
          completed: true,
          isInitializing: false,
          step: 'success'
        }));
        
        setIsInitializing(false);
        return { 
          success: true, 
          playerExists: true 
        };

      } else {
        // Player no existe - crear nuevo player
        console.log("🆕 Player does not exist, spawning new player...");
        
        setInitState(prev => ({ 
          ...prev, 
          step: 'spawning',
          txStatus: 'PENDING'
        }));

        // Ejecutar transacción de spawn
        console.log("📤 Executing spawn transaction...");
        const spawnTx = await client.game.spawnPlayer(account as Account);
        
        console.log("📥 Spawn transaction response:", spawnTx);
        
        if (spawnTx?.transaction_hash) {
          setInitState(prev => ({ 
            ...prev, 
            txHash: spawnTx.transaction_hash
          }));
        }
        
        if (spawnTx && spawnTx.code === "SUCCESS") {
          console.log("🎉 Player spawned successfully!");
          
          setInitState(prev => ({ 
            ...prev, 
            txStatus: 'SUCCESS'
          }));
          
          // Esperar a que se procese la transacción
          console.log("⏳ Waiting for transaction to be processed...");
          await new Promise(resolve => setTimeout(resolve, 3500));
          
          // Refetch datos del player
          console.log("🔄 Refetching player data after spawn...");
          await refetchPlayer();
          
          setInitState(prev => ({ 
            ...prev, 
            completed: true,
            isInitializing: false,
            step: 'success'
          }));
          
          // Confirmar transacción en el store de Dojo
          dojoState.confirmTransaction(transactionId);
          
          setIsInitializing(false);
          return { 
            success: true, 
            playerExists: false,
            transactionHash: spawnTx.transaction_hash 
          };
        } else {
          // Actualizar estado de transacción a rechazada
          setInitState(prev => ({ 
            ...prev, 
            txStatus: 'REJECTED'
          }));
          throw new Error("Spawn transaction failed with code: " + spawnTx?.code);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to initialize player. Please try again.";
      
      console.error("❌ Error initializing player:", error);
      
      // Revertir actualización optimista si aplica
      dojoState.revertOptimisticUpdate(transactionId);
      
      // Actualizar estado de transacción a rechazada si hubo transacción
      if (initState.txHash) {
        setInitState(prev => ({ 
          ...prev, 
          txStatus: 'REJECTED'
        }));
      }
      
      setInitState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isInitializing: false,
        step: 'checking'
      }));
      
      setIsInitializing(false);
      return { success: false, playerExists: false, error: errorMessage };
    }
  }, [status, account, refetchPlayer, player, isInitializing, client.game, dojoState]); 

  /**
   * Reset del estado de inicialización
   */
  const resetInitializer = useCallback(() => {
    console.log("🔄 Resetting initializer state...");
    setIsInitializing(false);
    setInitState({
      isInitializing: false,
      error: null,
      completed: false,
      step: 'checking',
      txHash: null,
      txStatus: null
    });
  }, []);

  // Sincronizar estado de carga con el store
  useEffect(() => {
    setLoading(initState.isInitializing || playerLoading);
  }, [initState.isInitializing, playerLoading, setLoading]);

  return {
    // Estado
    isInitializing: initState.isInitializing,
    error: initState.error,
    completed: initState.completed,
    currentStep: initState.step,
    txHash: initState.txHash,
    txStatus: initState.txStatus,
    isConnected: status === "connected",
    playerExists: useAppStore.getState().player !== null,
    
    // Acciones
    initializePlayer,
    resetInitializer
  };
};