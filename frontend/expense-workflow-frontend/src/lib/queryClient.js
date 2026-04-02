import { QueryClient } from "@tanstack/react-query"; // TanStack Query の QueryClient を作るために読み込む

// アプリ全体で共有する QueryClient のインスタンスを1つ作る
export const queryClient = new QueryClient();
