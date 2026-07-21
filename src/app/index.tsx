import GameScreen from '@/screens/GameScreen';

/**
 * For this logic-proving step the app opens straight into the debug game screen.
 * Expo Router reserves `src/app/` for routes, so the screen component itself
 * lives in `src/screens/GameScreen.tsx` and this route simply renders it.
 */
export default function HomeScreen() {
  return <GameScreen />;
}
