import "@/styles/globals.css";
import { NetworkCustom } from "@/utilities/types";
import {
  Address,
  Blockfrost,
  Lucid,
  MintingPolicy,
  Network,
} from "lucid-cardano";
import type { AppProps } from "next/app";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

export type AppState = {
  // Global
  blockfrostKey: string;
  network?: NetworkCustom;
  lucid?: Lucid;
  wAddr?: Address;
  // NFT Policies
  threadToken?: MintingPolicy;
};

const initialAppState: AppState = { blockfrostKey: "" };

export const AppStateContext = createContext<{
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}>({ appState: initialAppState, setAppState: () => { } });

export default function App({ Component, pageProps }: AppProps) {
  const [appState, setAppState] = useState<AppState>(initialAppState);

  const connectLucidAndNami = async () => {
    if (!appState.blockfrostKey) return;
    try {
      const network = appState.blockfrostKey.substring(0, 7);
      const lucid = await Lucid.new(
        new Blockfrost(
          `https://cardano-${network}.blockfrost.io/api/v0`,
          appState.blockfrostKey
        ),
        (network.charAt(0).toUpperCase() + network.slice(1)) as Network
      );

      if (!window.cardano.nami) {
        window.alert("Please install Nami Wallet");
        return;
      }
      const nami = await window.cardano.nami.enable();
      lucid.selectWallet(nami);
      setAppState({
        ...appState,
        network: network as NetworkCustom,
        lucid: lucid,
        wAddr: await lucid.wallet.address(),
      });
    } catch (e) {
      return;
    }
  };

  useEffect(() => {
    if (appState.lucid) return;
    connectLucidAndNami();
  }, [appState]);
  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      <Component {...pageProps} />
    </AppStateContext.Provider>
  );
}
