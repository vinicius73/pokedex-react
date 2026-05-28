import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("regions/:regionName", "routes/regions.$regionName.tsx"),
] satisfies RouteConfig;
