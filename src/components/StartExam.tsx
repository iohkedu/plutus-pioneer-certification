import {
  Address,
  Constr,
  PolicyId,
  SpendingValidator,
  UTxO,
  Unit,
  getAddressDetails,
  toUnit,
} from "lucid-cardano";
import React, { useContext, useState } from "react";
import { Data, MintingPolicy } from "lucid-cardano";
import { AppStateContext } from "@/pages/_app";
import {
  signAndSubmitTx,
  genStartMerkleProof,
  setBit,
} from "@/utilities/utilities";
import { MerkleProof, PubKeyHash } from "@/utilities/types";
import setupData from "@/data/setupData";
import { TextContainer } from "./TextContainer";
import { SignElswhere } from "./SignElsewhere";

export default function StartExam() {
  const { appState } = useContext(AppStateContext);
  const { lucid, wAddr, network } = appState;
  const [participantId, setParticipantId] = useState<number>(0);
  const [cbor, setCbor] = useState<string | null>("");
  const [txCbor, setTxCbor] = useState<string>("");
  const [externalPKH, setExternalPKH] = useState<string | null>("");
  const [signElsewhere, setSignElsewhere] = useState<boolean>(false);

  const Redeemer = Data.Object({
    proof: MerkleProof,
    pkh: PubKeyHash,
    n: Data.Integer(),
  });
  type Redeemer = Data.Static<typeof Redeemer>;

  async function prepareMintThreadTokenTx() {
    try {
      if (wAddr && lucid && cbor && network) {
        // Participant's public key hash
        const pkh: string = signElsewhere
          ? externalPKH || ""
          : getAddressDetails(wAddr).paymentCredential?.hash || "";

        // Thread token
        const threadScript: MintingPolicy =
          setupData[network].threadScript as MintingPolicy;
        const threadPol: PolicyId =
          lucid.utils.mintingPolicyToId(threadScript);
        const threadTkn: Unit = toUnit(threadPol, pkh);

        // State
        const stateValidator: SpendingValidator =
          setupData[network].stateValidator as SpendingValidator;
        const stateAddress: Address =
          lucid.utils.validatorToAddress(stateValidator);
        const stateTkn: Unit = setupData[network].stateToken;
        const utxoAtScript: UTxO[] = await lucid.utxosAt(stateAddress);
        const ourUTxO: UTxO[] = utxoAtScript.filter(
          (utxo) => utxo.assets[stateTkn] == 1n
        );

        // Participant's Merkle proof
        const merkleProof = await genStartMerkleProof(participantId);

        // Participant's validator
        const lockingValidatorParticipant: SpendingValidator = {
          type: "PlutusV2",
          script: cbor,
        };
        const lockingAddressParticipant: Address =
          lucid.utils.validatorToAddress(lockingValidatorParticipant);

        console.log(
          "lockingValidatorParticipant: ",
          lockingValidatorParticipant
        );
        console.log(
          "lockingAddressParticipant: ",
          lockingAddressParticipant
        );

        if (ourUTxO && ourUTxO.length > 0 && ourUTxO[0].datumHash) {
          const stateDatum = await lucid.provider.getDatum(
            ourUTxO[0].datumHash
          );
          console.log("old state: " + Data.from(stateDatum));
          const newState = setBit(Data.from(stateDatum), participantId);
          console.log("new state: " + newState);

          const redeemer: Redeemer = {
            proof: merkleProof,
            pkh: pkh,
            n: BigInt(participantId),
          };

          console.log("StartExam -> redeemer: ", redeemer);

          const tx = await lucid
            .newTx()
            .collectFrom(ourUTxO, Data.to(new Constr(0, [])))
            .attachSpendingValidator(stateValidator)
            .payToContract(stateAddress, Data.to(newState), {
              [stateTkn]: 1n,
            })
            .mintAssets(
              { [threadTkn]: 1n },
              Data.to<Redeemer>(redeemer, Redeemer)
            )
            .attachMintingPolicy(threadScript)
            .payToContract(lockingAddressParticipant, Data.to(pkh), {
              [threadTkn]: 1n,
            })
            .addSignerKey(pkh)
            .complete({ nativeUplc: false });

          return tx;
        } else {
          alert("No UTxO's found that can be burned!");
        }
      }
    } catch (error) {
      console.error("Error in mintThreadToken: ", error);
      alert("Error minting thread token. Please check the console. " + error);
    }
  }
  async function mintThreadToken() {
    if (wAddr && lucid && cbor) {
      const tx = await prepareMintThreadTokenTx();
      if (!tx) return;
      await signAndSubmitTx(tx);
    }
  }

  async function printThreadTokenTx() {
    if (wAddr && lucid && cbor) {
      const tx = await prepareMintThreadTokenTx();
      if (!tx) return;
      setTxCbor(tx.toString());
    }
  }

  return (
    <div className={`flex flex-col text-black ${signElsewhere ? 'overflow-y-scroll' : ''}`}>
      <TextContainer>
        <p className="text-2xl mb-4">
          {" "}
          <b>
            Welcome to the{" "}
            <span className="text-blue-600">
              Plutus Pioneer Program
            </span>{" "}
            certification exam! 😃{" "}
          </b>
        </p>
        <p>To complete the exam, you&apos;ll need to:</p>
        <ul className="list-disc">
          <li className="list-inside">
            Get your BlockFrost key and paste it into the input on
            the right. 👉
          </li>
          <li className="list-inside">
            Have Nami wallet in your browser (or change the code in <code className="bg-gray-200 p-0.5 rounded">_app.tsx</code> to use your favorite wallet 🙃).
          </li>
          <li className="list-inside">
            Use the same public key hash and Name you provided to
            IOG.
          </li>
          <li className="list-inside">
            Get the CBOR and ID that IOG provided by email.
          </li>
        </ul>
        <p className="mt-2"><b>Start the exam by pasting your participant&apos;s ID and exam CBOR to mint your own thread token! 👇</b></p>
      </TextContainer>
      <div className="flex flex-row w-full justify-center items-center my-8 text-lg text-zinc-800 font-quicksand">
        <p className="px-2">
          I want to sign the transaction elsewhere:
        </p>
        <input
          className="h-6 w-6"
          type="checkbox"
          checked={signElsewhere}
          onChange={(e) => setSignElsewhere(e.target.checked)}
        ></input>
      </div>
      <div className="flex flex-row w-full justify-center items-center my-8 text-lg text-zinc-800 font-quicksand ">
        <p>Participant&apos;s ID as shared by IOG:</p>
        <input
          type="number"
          value={participantId}
          placeholder="42"
          onChange={(e) => setParticipantId(Number(e.target.value))}
          className=" w-40 py-1 px-2 ml-2 border border-zinc-700 rounded"
        />
      </div>

      <div className="flex flex-row w-full justify-center items-center my-8 text-lg text-zinc-800 font-quicksand ">
        <p>Participant&apos;s CBOR as shared by IOG:</p>
        <input
          type="text"
          value={cbor ?? ""}
          placeholder="494801000022..."
          onChange={(e) => setCbor(e.target.value)}
          className=" w-40 py-1 px-2 ml-2 border border-zinc-700 rounded"
        />
      </div>
      {!signElsewhere ? (
        <button
          onClick={mintThreadToken}
          disabled={!wAddr || !lucid || !cbor}
          className=" bg-zinc-800 text-white font-quicksand text-lg font-bold py-3 px-8 mr-5 rounded-lg shadow-[0_5px_0px_0px_rgba(0,0,0,0.6)] active:translate-y-[2px] active:shadow-[0_4px_0px_0px_rgba(0,0,0,0.6)] disabled:active:translate-y-0 disabled:active:shadow-[0_5px_0px_0px_rgba(0,0,0,0.2)] disabled:bg-zinc-200 disabled:shadow-[0_5px_0px_0px_rgba(0,0,0,0.2)] disabled:text-zinc-600"
        >
          {" "}
          Start exam (Mint Thread Token)
        </button>
      ) : (
        <SignElswhere
          externalPKH={externalPKH || ""}
          setExternalPKH={setExternalPKH}
          print={printThreadTokenTx}
          txCbor={txCbor}
          disabled={!wAddr || !lucid || !externalPKH || !cbor}
        />
      )}
    </div>
  );
}
