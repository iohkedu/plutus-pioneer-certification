import {
  C,
  Constr,
  Data,
  Lucid,
  MerkleTree,
  TxComplete,
  TxHash,
  fromHex,
  toHex,
} from "lucid-cardano";
import { Hash32, MerkleProof } from "./types";
import genericMetadata from "@/data/generic-NFT-metadata.json" assert { type: "json" };
import mintMerkleTreeData from "@/data/mint-merkleTree-Data";
import startMerkleTreeData from "../data/start-merkleTree-Data";

export const signAndSubmitTx = async (tx: TxComplete): Promise<TxHash> => {
  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  console.log(`Transaction submitted: ${txHash}`);
  alert(`Transaction submitted: ${txHash}`);
  return txHash;
};

export const safeStringToBigInt = (r: string): bigint | undefined => {
  const parsed = BigInt(Number(r));
  if (Number.isNaN(parsed)) return;
  return parsed;
};

export const findUTxO = async (lucid: Lucid, ref: string) => {
  const [txH, ix] = ref.split("#");
  const utxos = await lucid.utxosByOutRef([
    {
      txHash: txH,
      outputIndex: Number(ix),
    },
  ]);
  return utxos[0];
};

// create personalised metadata
export function genPersolanizedMetadata(name: string) {
  return {
    name: genericMetadata.name + name,
    image: genericMetadata.image,
    description: genericMetadata.description,
  };
}

export function genStartMerkleRoot() {
  const dataUint = startMerkleTreeData.map((x) => fromHex(x));
  const merkleTree = new MerkleTree(dataUint);
  const merkleRoot: Hash32 = { hash: toHex(merkleTree.rootHash()) };
  return merkleRoot;
}

export function genMintMerkleRoot() {
  const dataUint = mintMerkleTreeData.map((x) => fromHex(x));
  const merkleTree = new MerkleTree(dataUint);
  const merkleRoot: Hash32 = { hash: toHex(merkleTree.rootHash()) };
  return merkleRoot;
}

export async function participantNumberToMerkleData(
  name: string,
  pubkeyhash: string
): Promise<string> {
  const plutusMetaData = Data.fromJson(genPersolanizedMetadata(name));
  const datumHash = toHex(
    C.hash_blake2b256(fromHex(Data.to(new Constr(0, [plutusMetaData]))))
  );
  console.log("pkh+datumHash: " + pubkeyhash + datumHash);
  return pubkeyhash + datumHash;
}

export async function genStartMerkleProof(participantId: number) {
  const dataUint = startMerkleTreeData.map((x) => fromHex(x));
  const merkleTree = new MerkleTree(dataUint);

  const merkleProof: MerkleProof = merkleTree
    .getProof(dataUint[participantId])
    .map((p) =>
      p.left
        ? { Left: [{ hash: toHex(p.left) }] }
        : { Right: [{ hash: toHex(p.right!) }] }
    );

  return merkleProof;
}

export async function genMintMerkleProof(name: string, pkh: string) {
  const dataUint = mintMerkleTreeData.map((x) => fromHex(x));
  const merkleTree = new MerkleTree(dataUint);

  // nft datum
  const metadataDatum = await participantNumberToMerkleData(name, pkh);
  // retrieve the index of the user in the list of merkle tree data.
  const n = mintMerkleTreeData.indexOf(metadataDatum);
  console.log("index of th user in the list: " + n);

  const merkleProof: MerkleProof = merkleTree
    .getProof(dataUint[n])
    .map((p) =>
      p.left
        ? { Left: [{ hash: toHex(p.left) }] }
        : { Right: [{ hash: toHex(p.right!) }] }
    );

  return merkleProof;
}

export function setBit(hexStr: string, bitIndex: number): string {
  const newStr = (
    (BigInt(1) << BigInt(bitIndex)) |
    BigInt("0x" + hexStr)
  ).toString(16);
  return newStr.padStart(hexStr.length, "0");
}
