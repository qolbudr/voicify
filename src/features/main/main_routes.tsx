import { Route } from "react-router";
import { AuthGuard } from "@/core/guard/auth_guard";
import { Speech } from "./speech";

export const mainRoutes = [
    <Route element={<AuthGuard />} path="/" key="main-guard">
        <Route path="/" element={<Speech />} />,
    </Route>,
];