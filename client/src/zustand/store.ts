import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interface que coincide con tus bindings
export interface Player {
  owner: string;          
  experience: number;
  health: number;
  coins: number;
  creation_day: number;
}

// Estado de la aplicación
interface AppState {
  // Player data
  player: Player | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Game state
  gameStarted: boolean;
}

// Acciones del store
interface AppActions {
  // Player actions
  setPlayer: (player: Player | null) => void;
  updatePlayerCoins: (coins: number) => void;
  updatePlayerExperience: (experience: number) => void;
  updatePlayerHealth: (health: number) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Game actions
  startGame: () => void;
  endGame: () => void;
  
  // Utility actions
  resetStore: () => void;
}

// Combinar estado y acciones
type AppStore = AppState & AppActions;

// Estado inicial
const initialState: AppState = {
  player: null,
  isLoading: false,
  error: null,
  gameStarted: false,
};

// Crear el store
const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      ...initialState,

      // Player actions
      setPlayer: (player) => set({ player }),
      
      updatePlayerCoins: (coins) => set((state) => ({
        player: state.player ? { ...state.player, coins } : null
      })),
      
      updatePlayerExperience: (experience) => set((state) => ({
        player: state.player ? { ...state.player, experience } : null
      })),

      updatePlayerHealth: (health) => set((state) => ({
        player: state.player ? { ...state.player, health } : null
      })),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Game actions
      startGame: () => set({ gameStarted: true }),
      endGame: () => set({ gameStarted: false }),

      // Utility actions
      resetStore: () => set(initialState),
    }),
    {
      name: 'dojo-starter-store',
      partialize: (state) => ({
        player: state.player,
        gameStarted: state.gameStarted,
      }),
    }
  )
);

export default useAppStore;