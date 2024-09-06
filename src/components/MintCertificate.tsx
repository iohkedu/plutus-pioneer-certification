import {
  Address,
  Constr,
  PolicyId,
  SpendingValidator,
  Unit,
  getAddressDetails,
  toUnit,
} from "lucid-cardano";
import React, { useContext, useEffect, useState } from "react";
import { Data, MintingPolicy } from "lucid-cardano";
import { AppStateContext } from "@/pages/_app";
import {
  signAndSubmitTx,
  genPersolanizedMetadata,
  genMintMerkleProof,
} from "@/utilities/utilities";
import { MerkleProof } from "@/utilities/types";
import setupData from "@/data/setupData";
import genericMetadata from "@/data/generic-NFT-metadata.json" assert { type: "json" };
import { TextContainer } from "./TextContainer";
import { SignElswhere } from "./SignElsewhere";

export default function MintCertificate() {
  const { appState } = useContext(AppStateContext);
  const { lucid, wAddr, network } = appState;
  const [name, setName] = useState<string>("");
  const [metadata, setMetadata] = useState(genericMetadata);
  const [signElsewhere, setSignElsewhere] = useState<boolean>(false);
  const [externalPKH, setExternalPKH] = useState<string | null>("");
  const [txCbor, setTxCbor] = useState<string>("");

  useEffect(() => {
    name && setMetadata(genPersolanizedMetadata(name));
  }, [name]);

  const prepareMintCertNFT = async () => {
    console.log("minting NFT for " + wAddr);
    if (wAddr && lucid && network) {
      try {
        // Participant's public key hash
        const pkh: string = signElsewhere
          ? externalPKH || ""
          : getAddressDetails(wAddr).paymentCredential?.hash || "";

        // Thread token
        const threadScript: MintingPolicy =
          setupData[network].threadScript as MintingPolicy;
        const threadTknPolicyID: PolicyId =
          lucid.utils.mintingPolicyToId(threadScript);
        const threadTkn: Unit = toUnit(threadTknPolicyID, pkh);

        // Locking validator (this locks the reference token)
        const lockingValidator: SpendingValidator =
          setupData[network].lockingValidator as SpendingValidator;
        const lockingValAddress: Address =
          lucid.utils.validatorToAddress(lockingValidator);

        // Certificate
        const certNftMP: MintingPolicy =
          setupData[network].mintingScriptNFT as MintingPolicy;
        const certNftPolicyID: PolicyId =
          lucid.utils.mintingPolicyToId(certNftMP);
        console.log("PolicyID: " + certNftPolicyID);
        const userTkn: Unit = toUnit(certNftPolicyID, pkh, 222);
        const refTkn: Unit = toUnit(certNftPolicyID, pkh, 100);

        // Redeemer
        const Redeemer = Data.Object({ proof: MerkleProof });
        type Redeemer = Data.Static<typeof Redeemer>;
        const redeemer: Redeemer = {
          proof: await genMintMerkleProof(name, pkh),
        };

        // Transaction
        const tx = await lucid!
          .newTx()
          .mintAssets(
            { [userTkn]: 1n, [refTkn]: 1n },
            Data.to<Redeemer>(redeemer, Redeemer)
          )
          .attachMintingPolicy(certNftMP)
          .mintAssets({ [threadTkn]: -1n }, Data.to(new Constr(1, [])))
          .attachMintingPolicy(threadScript)
          .payToContract(
            lockingValAddress,
            Data.to(new Constr(0, [Data.fromJson(metadata)])),
            { [refTkn]: 1n }
          )
          .addSignerKey(pkh)
          .complete();

        return tx;
      } catch (e: any) {
        console.log(e)
        if (e.toString().includes("Cannot read properties of undefined (reading 'length')")) {
          alert("Can't find your in the Merkle tree. Did you write the name correctly?");
        } else if (e.toString().includes("InputsExhaustedError")) {
          alert("It seems you already minted the NFT! (InputsExhaustedError)");
        } else {
          alert("Error minting NFT: " + e);
        }
      }

    } else { alert("Make sure to have Blockfrost key and Nami installed!"); }
  };

  const mintCertNFT = async () => {
    if (wAddr && lucid) {
      try {
        const tx = await prepareMintCertNFT();
        if (!tx) return;
        await signAndSubmitTx(tx);
      } catch (e: any) {
        console.log(e)
        if (e.toString().includes("InputsExhaustedError")) {
          alert("It seems you already minted the NFT! (InputsExhaustedError)");
        } else {
          alert("Error minting NFT: " + e);
        }
      }
    }
  };

  const printMintCertNFTTx = async () => {
    if (wAddr && lucid) {
      const tx = await prepareMintCertNFT();
      if (!tx) return;
      setTxCbor(tx.toString());
    }
  };

  return (
    <div className="flex flex-col">
      <TextContainer>
        <p className="text-2xl text-blue-600 mb-4"><b>Mint your NFT!!🥳🎉</b></p>
        <p>Congratulations on solving the exam!!! 🥳 Make sure to have the Token you unlocked solving the exam sitting in the wallet, provide your Name (exactly) as shared to IOG, and mint your NFT! You&apos;ve been certified! ✅</p>
      </TextContainer>
      <div className="flex flex-row w-full justify-center items-center my-8 text-lg text-zinc-800 font-quicksand ">
        <p>Participant&apos;s name as shared with IOG:</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className=" w-40 py-1 px-2 ml-2 border border-zinc-700 rounded"
        />
      </div>

      <div className="flex flex-row w-full justify-center items-center my-8 text-lg text-zinc-800 font-quicksand ">
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

      {!signElsewhere ? (
        <button
          onClick={mintCertNFT}
          disabled={!wAddr || !lucid || !name}
          className=" bg-zinc-800 text-white font-quicksand text-lg font-bold py-3 px-8 rounded-lg shadow-[0_5px_0px_0px_rgba(0,0,0,0.6)] active:translate-y-[2px] active:shadow-[0_4px_0px_0px_rgba(0,0,0,0.6)] disabled:active:translate-y-0 disabled:active:shadow-[0_5px_0px_0px_rgba(0,0,0,0.2)] disabled:bg-zinc-200 disabled:shadow-[0_5px_0px_0px_rgba(0,0,0,0.2)] disabled:text-zinc-600"
        >
          {" "}
          Mint Certificate NFT
        </button>
      ) : (
        <SignElswhere
          externalPKH={externalPKH || ""}
          setExternalPKH={setExternalPKH}
          print={printMintCertNFTTx}
          txCbor={txCbor}
          disabled={!wAddr || !lucid || !externalPKH || !name}
        />
      )}
    </div>
  );
}
