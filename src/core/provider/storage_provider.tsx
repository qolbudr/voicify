import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import type { StorageContext } from "../types/storage";

type Data = {
  data: StorageContext | null;
  save: (storage: StorageContext) => void;
}

const Context = createContext<Data | null>(null);

export const useStorage = () => {
  return useContext(Context);
}

export const StorageProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [data, setData] = useState<StorageContext>({});

  useEffect(() => {
    const storage = localStorage.getItem('storage');
    if (storage) {
      setData(JSON.parse(storage));
    }
  }, [])

  const save = (storage: StorageContext) => {
    setData(prev => ({ ...prev, ...storage }));
    localStorage.setItem('storage', JSON.stringify({ ...data, ...storage }));
  }

  return <><Context.Provider value={{ data, save }}>{children}</Context.Provider></>;
}