import React from "react";
import { TextContainer } from "./TextContainer";

interface ISignElsewhereProps {
  externalPKH: string | undefined;
  setExternalPKH: (pkh: string) => void;
  print: () => void;
  txCbor: string | undefined;
  disabled: boolean;
}

export const SignElswhere = ({
  externalPKH,
  setExternalPKH,
  print,
  txCbor,
  disabled,
}: ISignElsewhereProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row w-full justify-center items-center my-8 text-lg text-zinc-800 font-quicksand ">
        <p>Participant&apos;s PKH as shared with IOG:</p>
        <input
          type="text"
          value={externalPKH ?? ""}
          onChange={(e) => setExternalPKH(e.target.value)}
          className=" w-40 py-1 px-2 ml-2 border border-zinc-700 rounded"
        />
      </div>
      <button
        onClick={print}
        disabled={disabled}
        className=" bg-zinc-800 text-white font-quicksand text-lg font-bold py-3 px-8 mr-5 rounded-lg shadow-[0_5px_0px_0px_rgba(0,0,0,0.6)] active:translate-y-[2px] active:shadow-[0_4px_0px_0px_rgba(0,0,0,0.6)] disabled:active:translate-y-0 disabled:active:shadow-[0_5px_0px_0px_rgba(0,0,0,0.2)] disabled:bg-zinc-200 disabled:shadow-[0_5px_0px_0px_rgba(0,0,0,0.2)] disabled:text-zinc-600"
      >
        {" "}
        Show Tx CBOR
      </button>
      <TextContainer>
        <p>Double click to select: </p>
        <p className=" overflow-x-scroll">{txCbor}</p>
      </TextContainer>
    </div>
  );
};
