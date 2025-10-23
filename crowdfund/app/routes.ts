import { type RouteConfig, index, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_layouts.tsx", [
    index("routes/home.tsx") // Ini akan menunjuk ke file home.tsx yang baru Anda buat
  ])
] satisfies RouteConfig;