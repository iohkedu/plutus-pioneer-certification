import React from "react";
import { TextContainer } from "./TextContainer";

export const SolvePage = () => {
  return (
    <TextContainer scrollable>
      <p className="text-2xl text-blue-600 mb-4"><b>Solve the Exam! 🖥️🤓</b></p>
      <p className="mb-2"><b>To solve the exam, you&apos;ll have to:</b></p>
      <ol className="list-decimal mb-2">
        <li className="list-inside mb-2 hover:bg-blue-200 p-2 rounded">Open the transaction you made to create the thread token in a blockchain explorer.</li>
        <div className="hover:bg-blue-200  p-2 rounded">
          <li className="list-inside mb-2">That transaction has three outputs:</li>
          <ul className="list-disc mb-2">
            <li className="list-inside">One that sent the &quot;PPP Cert State token&quot; to the exam&apos;s state validator.</li>
            <li className="list-inside">Another one contains the change that returns to your wallet.</li>
            <li className="list-inside">And another one that sent a weird token to a random validator. (We sent you that validator&apos;s CBOR through email.)</li>
          </ul>
        </div>
        <li className="list-inside mb-2 hover:bg-blue-200 p-2 rounded"><b>You require that weird token in your wallet to be able to mint your PPP Certification NFT.</b></li>
        <li className="list-inside mb-2 hover:bg-blue-200 p-2 rounded">The exam consists of figuring out what the validator checks for and using that knowledge to write the off-chain code to unlock the token and send it to your wallet (the one with the same Public Key Hash you sent to IOG). You can write the off-chain however you want.</li>
        <div className="hover:bg-blue-200  p-2 rounded">
          <li className="list-inside mb-2">To figure out what the validator checks for:</li>
          <ul className="list-disc mb-2">
            <li className="list-inside">Try to consume the UTxO with a dummy off-chain that just signs the Tx with your PKH, and you'll get back the source code for the first check as part of the error response. Example: <code className="bg-gray-200 p-0.5 rounded">length (txInfoInputs txInfo) == ?</code>. If your check contains a question mark (<code className="bg-gray-200 p-0.5 rounded">?</code>), that's a randomly generated number between 3 and 5.</li>
            <li className="list-inside">Modify the off-chain to satisfy that check, and you'll get access to the next check.</li>
            <li className="list-inside">Repeat this process until the validator unlocks the UTxO!</li>
          </ul>
        </div>
      </ol>
      <div className="bg-blue-100 p-2 rounded">
        <p>This exam will check your comprehension of on-chain code and your abilities in building off-chain code. Each pioneer has a different exam; no one else can solve yours, and there's no time limit! So, take your time, and have fun!! 🤩</p>
        <br></br>
        <p><b>Switch to the <code className="bg-gray-200 p-1 rounded">Mint</code> tab once you unlock that token and it&apos;s in your wallet.</b></p>
      </div>
    </TextContainer >
  );
};
