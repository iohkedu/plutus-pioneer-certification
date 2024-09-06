import { useContext } from "react";
import { AppStateContext } from "./_app";
import { HiUserCircle } from "react-icons/hi";
import { IoReloadCircleSharp } from "react-icons/io5";
import { useState } from "react";
import MintCertificate from "@/components/MintCertificate";
import StartExam from "@/components/StartExam";
import { SolvePage } from "@/components/SolvePage";
import BurnCertificate from "@/components/BurnCertificate";

export default function Home() {
  type State = "start" | "solve" | "mint" | "burn";
  const [isState, setIsState] = useState<State>("start");
  const { appState, setAppState } = useContext(AppStateContext);
  const { wAddr, blockfrostKey } = appState;

  const refreshWallet = async () => {
    if (!appState.lucid || !window.cardano.nami) return;
    const nami = await window.cardano.nami.enable();
    appState.lucid.selectWallet(nami);
    setAppState({
      ...appState,
      wAddr: await appState.lucid.wallet.address(),
    });
  };

  const handleClick = (v: State) => {
    if (v === "start") {
      setIsState("start");
    } else if (v === "solve") {
      setIsState("solve");
    } else if (v === "mint") {
      setIsState("mint");
    } else {
      setIsState("burn");
    }
  };

  return (
    <main className="flex min-h-screen w-screen h-screen gap-6 flex-row-reverse items-center justify-between px-5 pb-5  pt-20 bg-zinc-800">
      <div className="flex flex-col items-center justify-start  w-[380px] mt-2">
        <div className="absolute justify-center items-center right-0 top-5 bg-zinc-50  h-12 w-48 rounded-l-2xl flex flex-col">
          {/* USER LOGGED */}
          <div className="justify-center items-center bg-zinc-50  h-12  w-48 rounded-l-2xl flex flex-row">
            <HiUserCircle
              className="text-4xl text-zinc-600"
              onClick={refreshWallet}
            />
            <p className="text-lg mx-2 text-zinc-800">
              {wAddr
                ? `...${wAddr.substring(wAddr.length - 7)}`
                : ""}
            </p>
            <IoReloadCircleSharp
              className="text-3xl mx-2 text-zinc-600 active:text-zinc-800"
              onClick={refreshWallet}
            />
          </div>
        </div>

        {/* INFORMATION TABLE */}

        <div className="flex flex-col w-full justify-center items-center my-8 text-lg text-zinc-800 font-quicksand ">
          {!blockfrostKey && (
            <div className="text-center">
              <p className="text-zinc-200">
                Initialize the frontend by copy-pasting your
                BlockFrost key. You can practice solving your
                exam in Preview before trying in Mainnet.
              </p>{" "}
              <p className="text-2xl">👇</p>{" "}
            </div>
          )}
          <p className="text-zinc-200">
            Participant&apos;s BlockFrost Key:
          </p>
          <input
            type="text"
            value={blockfrostKey}
            onChange={(e) =>
              setAppState({
                ...appState,
                blockfrostKey: e.target.value,
              })
            }
            className=" w-full py-1 px-2 ml-2 border border-zinc-700 rounded"
          />
          {blockfrostKey && wAddr && (
            <div className="text-center">
              <p className="text-zinc-200">
                {" "}
                You&apos;re solving the exam in the{" "}
                <b>{blockfrostKey.substring(0, 7)}</b> network
              </p>{" "}
            </div>
          )}
        </div>
      </div>

      {/* PERSON BUTTONS */}
      <div className="absolute top-4 left-5 flex flex-row gap-4">
        <button
          onClick={() => handleClick("start")}
          className={`${isState == "start"
            ? "bg-zinc-100 text-zinc-800 shadow-[0_5px_0px_0px_rgba(255,251,251,0.6)]"
            : "bg-zinc-900 text-zinc-50 shadow-[0_5px_0px_0px_rgba(0,0,0,0.6)]"
            } font-quicksand text-lg font-bold py-3 px-8 rounded-lg active:translate-y-[2px] active:shadow-[0_4px_0px_0px_rgba(0,0,0,0.6)] `}
        >
          Start
        </button>
        <button
          onClick={() => handleClick("solve")}
          className={`${isState == "solve"
            ? "bg-zinc-100 text-zinc-800 shadow-[0_5px_0px_0px_rgba(255,251,251,0.6)]"
            : "bg-zinc-900 text-zinc-50 shadow-[0_5px_0px_0px_rgba(0,0,0,0.6)]"
            }  font-quicksand text-lg font-bold py-3 px-8 rounded-lg active:translate-y-[2px] active:shadow-[0_4px_0px_0px_rgba(0,0,0,0.6)] `}
        >
          Solve
        </button>
        <button
          onClick={() => handleClick("mint")}
          className={`${isState == "mint"
            ? "bg-blue-100 text-blue-800 shadow-[0_5px_0px_0px_rgba(255,251,251,0.6)]"
            : "bg-blue-900 text-blue-50 shadow-[0_5px_0px_0px_rgba(0,0,0,0.6)]"
            }  font-quicksand text-lg font-bold py-3 px-8 rounded-lg active:translate-y-[2px] active:shadow-[0_4px_0px_0px_rgba(0,0,0,0.6)] `}
        >
          Mint
        </button>
        <button
          onClick={() => handleClick("burn")}
          className={`${isState == "burn"
            ? "bg-red-100 text-red-600 shadow-[0_5px_0px_0px_rgba(255,251,251,0.6)]"
            : "bg-red-600 text-red-50 shadow-[0_5px_0px_0px_rgba(0,0,0,0.6)]"
            }  font-quicksand text-lg font-bold py-3 px-8 rounded-lg active:translate-y-[2px] active:shadow-[0_4px_0px_0px_rgba(0,0,0,0.6)] `}
        >
          Burn
        </button>
      </div>

      {/* ACTIONS SECTION */}
      <div className="flex flex-col items-center gap-8  h-full py-10 bg-zinc-50 w-4/5 rounded-2xl">
        {isState == "start" && <StartExam />}
        {isState == "solve" && <SolvePage />}
        {isState == "mint" && <MintCertificate />}
        {isState == "burn" && <BurnCertificate />}
      </div>
    </main>
  );
}
