import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useMoralis } from "react-moralis";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
  throw new Error("Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. Make sure to set your .env file.");

// supabase-js is loaded as its UMD build (public/supabase.js, copied on npm postinstall):
// CRA4's webpack 4 can't consume the package's .mjs/.cjs entry points.
// ponytail: import from "@supabase/supabase-js" directly after upgrading to react-scripts 5.
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// API server (thumbnails, metadata) hosted on Render
export const API_URL = process.env.REACT_APP_API_URL;
export const getThumbnail = (geocode) => `${API_URL}/thumbnails/${geocode}.jpg`;

const signingMessage = "Welcome to PhantaSpace!";

// same regex the database's auth_eth_address() uses
const addressOf = (session) =>
  JSON.stringify(session?.user?.identities || []).match(/0x[0-9a-fA-F]{40}/)?.[0]?.toLowerCase() || "";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

/** Wallet sign-in via Supabase Web3 auth; `user` is the caller's row in the users table. */
export function AuthProvider({ children }) {
  const { enableWeb3, deactivateWeb3, Moralis } = useMoralis();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const account = addressOf(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const refetchUser = useCallback(async () => {
    if (!account) return null;
    const { data } = await supabase.from("users").select().eq("ethAddress", account).maybeSingle();
    const row = data || { ethAddress: account, space: [], auction: [] };
    setUser(row);
    return row;
  }, [account]);

  useEffect(() => {
    if (account) refetchUser();
    else setUser(null);
  }, [account, refetchUser]);

  const login = async (provider) => {
    await enableWeb3({ throwOnError: true, provider });
    const { error } = await supabase.auth.signInWithWeb3({
      chain: "ethereum",
      wallet: Moralis.provider,
      statement: signingMessage,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await deactivateWeb3();
  };

  const saveProfile = async (fields) => {
    const { error } = await supabase.from("users").upsert({ ethAddress: account, ...fields });
    if (error) throw error;
    return refetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!account, account, user, refetchUser, login, logout, saveProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Rows of a geocode-keyed table, kept live with Supabase Realtime. */
export function useLiveTable(table, limit = 10000) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    supabase
      .from(table)
      .select()
      .limit(limit)
      .then(({ data }) => data && setRows(data));
    const channel = supabase
      .channel(`live:${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, ({ eventType, new: row, old }) => {
        const geocode = eventType === "DELETE" ? old.geocode : row.geocode;
        setRows((all) => {
          const rest = all.filter((r) => r.geocode !== geocode);
          return eventType === "DELETE" ? rest : [...rest, row];
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [table, limit]);
  return rows;
}
