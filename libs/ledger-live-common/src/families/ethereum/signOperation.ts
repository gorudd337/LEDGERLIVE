import { Transaction as EthereumTx } from "@ethereumjs/tx";
import { FeeNotLoaded } from "@ledgerhq/errors";
import Eth from "@ledgerhq/hw-app-eth";
import { byContractAddressAndChainId } from "@ledgerhq/hw-app-eth/erc20";
import ethLedgerServices from "@ledgerhq/hw-app-eth/lib/services/ledger";
import { LoadConfig } from "@ledgerhq/hw-app-eth/lib/services/types";
import { log } from "@ledgerhq/logs";
import { BigNumber } from "bignumber.js";
import eip55 from "eip55";
import invariant from "invariant";
import { Eth as MMEth, MetaMaskConnector } from "mm-app-eth";
import { encode } from "rlp";
import { from, Observable, of } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { apiForCurrency } from "../../api/Ethereum";
import { getEnv } from "../../env";
import { withDevice } from "../../hw/deviceAccess";
import { isNFTActive } from "../../nft";
import type { Account, Operation, SignOperationEvent } from "../../types";
import { modes } from "./modules";
import { buildEthereumTx, getGasLimit } from "./transaction";
import type { Transaction } from "./types";
export const signOperation = ({
  account,
  deviceId,
  transaction,
}: {
  account: Account;
  deviceId: any;
  transaction: Transaction;
}): Observable<SignOperationEvent> =>
  from(
    transaction.nonce !== undefined
      ? of(transaction.nonce)
      : apiForCurrency(account.currency).getAccountNonce(account.freshAddress)
  ).pipe(
    mergeMap((nonce) =>
      withDevice(deviceId)(
        (transport) =>
          new Observable<SignOperationEvent>((o) => {
            let cancelled;

            async function main() {
              // First, we need to create a partial tx and send to the device
              const { freshAddressPath, freshAddress } = account;
              const { gasPrice } = transaction;
              const gasLimit = getGasLimit(transaction);

              if (!gasPrice || !new BigNumber(gasLimit).gt(0)) {
                log(
                  "ethereum-error",
                  "buildTransaction missingData: gasPrice=" +
                    String(gasPrice) +
                    " gasLimit=" +
                    String(gasLimit)
                );
                throw new FeeNotLoaded();
              }

              const { ethTxObject, tx, common, fillTransactionDataResult } =
                buildEthereumTx(account, transaction, nonce);
              const to = eip55.encode((tx.to || "").toString());
              const value = new BigNumber(
                "0x" + (tx.value.toString("hex") || "0")
              );
              // rawData Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
              const rawData = tx.raw();
              rawData[6] = Buffer.from([common.chainIdBN().toNumber()]);
              const txHex = Buffer.from(encode(rawData)).toString("hex");
              const loadConfig: LoadConfig = {};
              if (isNFTActive(account.currency)) {
                loadConfig.nftExplorerBaseURL =
                  getEnv("NFT_ETH_METADATA_SERVICE") + "/v1/ethereum";
              }

              const m = modes[transaction.mode];
              invariant(m, "missing module for mode=" + transaction.mode);

              const resolutionConfig = m.getResolutionConfig
                ? m.getResolutionConfig(account, transaction)
                : {};

              const resolution =
                getEnv("SANDBOX_MODE") === 2
                  ? null
                  : await ethLedgerServices.resolveTransaction(
                      txHex,
                      loadConfig,
                      resolutionConfig
                    );

              const eth: Eth | MMEth = await (async () => {
                if (getEnv("SANDBOX_MODE") === 2) {
                  const connector = new MetaMaskConnector({
                    port: 3333,
                  });
                  o.next({ type: "device-signature-requested" });
                  await connector.start();
                  return new MMEth(connector.getProvider());
                }
                return new Eth(transport);
              })();
              eth.setLoadConfig(loadConfig);

              // FIXME this part is still required for compound to correctly display info on the device
              const addrs =
                (fillTransactionDataResult &&
                  fillTransactionDataResult.erc20contracts) ||
                [];

              for (const addr of addrs) {
                const tokenInfo = byContractAddressAndChainId(
                  addr,
                  account.currency.ethereumLikeInfo?.chainId || 0
                );

                if (tokenInfo) {
                  await eth.provideERC20TokenInformation(tokenInfo);
                  if (cancelled) return;
                }
              }

              o.next({ type: "device-signature-requested" });
              const result: {
                r: string;
                s: string;
                v: string;
                txHash?: string;
              } = await eth.signTransaction(
                freshAddressPath,
                txHex,
                resolution
              );
              if (cancelled) return;
              o.next({ type: "device-signature-granted" });
              // Second, we re-set some tx fields from the device signature
              const v = `0x${result.v}`;
              const r = `0x${result.r}`;
              const s = `0x${result.s}`;

              const signedTx = new EthereumTx(
                { ...ethTxObject, v, r, s },
                { common }
              );

              // Generate the signature ready to be broadcasted
              const signature = `0x${signedTx.serialize().toString("hex")}`;

              // build optimistic operation
              const txHash = result?.txHash || ""; // resolved at broadcast time

              const senders = [freshAddress];
              const recipients = [to];
              const fee = gasPrice.times(gasLimit);
              const transactionSequenceNumber = nonce;
              const accountId = account.id;
              // currently, all mode are always at least one OUT tx on ETH parent
              const operation: Operation = {
                id: `${accountId}-${txHash}-OUT`,
                hash: txHash,
                transactionSequenceNumber: transactionSequenceNumber as
                  | number
                  | undefined,
                type: "OUT",
                value: new BigNumber(value),
                fee,
                blockHash: null,
                blockHeight: null,
                senders,
                recipients,
                accountId,
                date: new Date(),
                extra: {},
              };
              m.fillOptimisticOperation(account, transaction, operation);
              o.next({
                type: "signed",
                signedOperation: {
                  operation,
                  signature,
                  expirationDate: null,
                },
              });
            }

            main().then(
              () => o.complete(),
              (e) => o.error(e)
            );
            return () => {
              cancelled = true;
            };
          })
      )
    )
  );
