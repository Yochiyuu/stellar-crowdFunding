import { useState } from "react";
import { TransactionBuilder, rpc } from "@stellar/stellar-sdk";
import { signTransaction } from "~/config/wallet.client";
import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";

// Tipe untuk hasil GetTransactionResponse yang sukses
type SuccessfulTransactionResponse = rpc.Api.GetTransactionResponse & {
    status: "SUCCESS";
    resultXdr: string;
};

interface UseSubmitTransactionOptions {
  rpcUrl: string;
  networkPassphrase: string;
  onSuccess?: (result: SuccessfulTransactionResponse) => void;
  onError?: (error: unknown) => void;
}

export function useSubmitTransaction(options: UseSubmitTransactionOptions) {
  const [isSubmitting, setSubmitting] = useState(false);

  async function submit(tx: AssembledTransaction<any>): Promise<{ success: boolean, error?: unknown, result?: rpc.Api.GetTransactionResponse }> {
    setSubmitting(true);
    let sentTx: rpc.Api.SendTransactionResponse;
    let txHash: string;
    let getTxResponse: rpc.Api.GetTransactionResponse | undefined = undefined;

    try {
      const builtTxXDR = tx.toXDR();
      const signedXDR = await signTransaction(builtTxXDR);

      const server = new rpc.Server(options.rpcUrl);
      sentTx = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXDR.signedTxXdr, options.networkPassphrase)
      );

      txHash = sentTx.hash;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        try {
          const response = await fetch(`${options.rpcUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getTransaction",
              params: { hash: txHash },
            }),
          });

          const data = await response.json();

          if (data.error) {
            if (data.error.code === -32602 || data.error.message?.includes("not found")) {
              continue;
            } else {
              throw new Error(`RPC Error: ${data.error.message}`);
            }
          }

          if (data.result) {
            getTxResponse = data.result as rpc.Api.GetTransactionResponse;
            const status = getTxResponse?.status;

            if (status === "SUCCESS") {
              if (getTxResponse.resultXdr) {
                const successfulResult = getTxResponse as SuccessfulTransactionResponse;
                options.onSuccess?.(successfulResult); 
                return { success: true, result: successfulResult };
              } else {
                 // Jika sukses tapi tidak ada resultXdr (seperti donasi), panggil onSuccess tanpa argumen
                 (options.onSuccess as (() => void) | undefined)?.();
                 return { success: true, result: getTxResponse };
              }
            } else if (status === "FAILED") {
              throw new Error(`Transaction failed: ${JSON.stringify(getTxResponse)}`);
            }
          }
        } catch (e: any) {
          if (e.name === "TypeError" || e.message?.includes("fetch")) {
            continue;
          }
          throw e;
        }
      }

      throw new Error(`Transaction timeout after ${maxAttempts * 2} seconds. Hash: ${txHash}`);

    } catch (e) {
      options.onError?.(e);
      return { success: false, error: e };
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, isSubmitting };
}
