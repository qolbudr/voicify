import { Navigate, Outlet } from "react-router";
import type { StorageContext } from "../types/storage";

export const AuthGuard = () => {
  const storage = localStorage.getItem('storage');
  if (storage != null) {
    const parsedStorage: StorageContext = JSON.parse(storage);
    if (parsedStorage?.user != null) {
      return <Outlet />
    } else {
      return <Navigate to="/login" replace />
    }
  } else {
    return <Navigate to="/login" replace />
  }
}