import type { Exception } from "./exception";
import { handleError } from "@/lib/utils";
import CryptoJS from "crypto-js";

export type ApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiParameter {
  url?: string,
  path?: string,
  method: ApiMethod,
  query?: any,
  body?: Object,
  headers?: HeadersInit
}

const generateURLQueryParam = ({ body, listKey }: { body: any, listKey?: string[] }): string => {
  var query = '';

  Object.keys(body).forEach((key) => {
    if (body[key] == null || (key == 'search' && body[key] == '')) {
    } else if (Array.isArray(body[key])) {
      query += `${(body[key] as Array<any>).map(() => `${listKey != null ? `${listKey.join('.')}.` : ''}${key}=${body[key]}&`)}`
    } else if (typeof body[key] === "object") {
      query += generateURLQueryParam({ body: body[key], listKey: [...listKey ?? [], key] })
    } else {
      query += `${listKey != null ? `${listKey.join('.')}.` : ''}${key}=${body[key]}&`
    }
  })

  return query;
}

export async function apiV1<Type>({ url, path, method, headers, body, query }: ApiParameter): Promise<Type | undefined> {
  try {
    let newUrl = url ?? import.meta.env.VITE_BACKEND_API_URL + `${path}`
    const storage = localStorage.getItem('storage');
    
    if (storage != null) {
      const token = JSON.parse(storage).user.token;
      const timestamp = Date.now().toString();

      const signature = CryptoJS.HmacSHA256(timestamp, import.meta.env.VITE_SIGNATURE_SECRET).toString(CryptoJS.enc.Hex);
      headers = { ...headers, 'Authorization': `Bearer ${token}`, 'timestamp': timestamp, 'signature': signature };
    }

    if (query != null) newUrl += `?${generateURLQueryParam({ body: query })}`;

    const response = await fetch(newUrl, {
      method: method,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.status != 200) {
      const data = await response.json();
      throw {
        message: data.message ?? 'Something went wrong',
        error: data.error ?? 'Unknown Error',
        code: response.status,
      } as Exception;
    };

    const json = await response.json() as (Type | undefined);
    return json;
  }
  catch (e) {
    const exception = handleError(e);
    if (exception.code === 401) {
      localStorage.removeItem('storage');
      setTimeout(() => window.location.reload(), 1500);
    }

    throw exception;
  }
}