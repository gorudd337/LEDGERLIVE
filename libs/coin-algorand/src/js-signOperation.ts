import { FeeNotLoaded } from "@ledgerhq/errors";
import type {
  Account,
  DeviceId,
  Operation,
  SignOperationEvent,
  SignOperationFnSignature,
  SignedOperation,
} from "@ledgerhq/types-live";
import { SignerContext } from "@ledgerhq/coin-framework/signer";
import { BigNumber } from "bignumber.js";
import { Observable } from "rxjs";
import { AlgorandAPI } from "./api";
import { buildTransactionPayload, encodeToBroadcast, encodeToSign } from "./buildTransaction";
import type { AlgorandAddress, AlgorandSignature, AlgorandSigner } from "./signer";
import type { Transaction } from "./types";

/**
 * Sign Transaction with Ledger hardware
 */
export const buildSignOperation =
  (
    signerContext: SignerContext<AlgorandSigner, AlgorandAddress | AlgorandSignature>,
    algorandAPI: AlgorandAPI,
  ): SignOperationFnSignature<Transaction> =>
  ({
    account,
    transaction,
    deviceId,
  }: {
    account: Account;
    transaction: Transaction;
    deviceId: DeviceId;
  }): Observable<SignOperationEvent> =>
    new Observable(o => {
      let cancelled = false;

      async function main() {
        if (!transaction.fees) {
          throw new FeeNotLoaded();
        }

        const algoTx = await buildTransactionPayload(algorandAPI)(account, transaction);

        const toSign = encodeToSign(algoTx);

        const { freshAddressPath } = account;

        o.next({ type: "device-signature-requested" });

        const { signature } = (await signerContext(deviceId, signer =>
          signer.sign(freshAddressPath, toSign),
        )) as AlgorandSignature;

        if (cancelled) return;

        o.next({ type: "device-signature-granted" });

        if (!signature) {
          throw new Error("No signature");
        }

        const toBroadcast = encodeToBroadcast(algoTx, signature);

        const operation = buildOptimisticOperation(account, transaction);

        o.next({
          type: "signed",
          signedOperation: {
            operation,
            signature: toBroadcast.toString("hex"),
            expirationDate: null,
          } as SignedOperation,
        });
      }

      main().then(
        () => o.complete(),
        e => o.error(e),
      );

      return () => {
        cancelled = true;
      };
    });

const buildOptimisticOperation = (account: Account, transaction: Transaction): Operation => {
  const { spendableBalance, id, freshAddress, subAccounts } = account;

  const senders = [freshAddress];
  const recipients = [transaction.recipient];
  const { subAccountId, fees } = transaction;

  if (!fees) {
    throw new FeeNotLoaded();
  }

  const value = subAccountId
    ? fees
    : transaction.useAllAmount
    ? spendableBalance
    : transaction.amount.plus(fees);

  const type = subAccountId ? "FEES" : transaction.mode === "optIn" ? "OPT_IN" : "OUT";

  const op: Operation = {
    id: `${id}--${type}`,
    hash: "",
    type,
    value,
    fee: fees,
    blockHash: null,
    blockHeight: null,
    senders,
    recipients,
    accountId: id,
    date: new Date(),
    extra: {},
  };

  const tokenAccount = !subAccountId
    ? null
    : subAccounts && subAccounts.find(ta => ta.id === subAccountId);

  if (tokenAccount && subAccountId) {
    op.subOperations = [
      {
        id: `${subAccountId}--OUT`,
        hash: "",
        type: "OUT",
        value: transaction.useAllAmount ? tokenAccount.balance : transaction.amount,
        fee: new BigNumber(0),
        blockHash: null,
        blockHeight: null,
        senders,
        recipients,
        accountId: subAccountId,
        date: new Date(),
        extra: {},
      },
    ];
  }

  return op;
};

export default buildSignOperation;