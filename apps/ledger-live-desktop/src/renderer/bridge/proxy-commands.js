// @flow
/* eslint-disable flowtype/generic-spacing */

import type { Observable } from "rxjs";
import { from } from "rxjs";
import { map, tap } from "rxjs/operators";
import { log } from "@ledgerhq/logs";
import type {
  AccountRawLike,
  AccountRaw,
  SyncConfig,
  ScanAccountEventRaw,
  SignOperationEventRaw,
  SignedOperationRaw,
  OperationRaw,
} from "@ledgerhq/types-live";
import type {
  TransactionStatus,
  TransactionStatusRaw,
  TransactionRaw,
} from "@ledgerhq/live-common/generated/types";
import {
  fromTransactionRaw,
  toTransactionRaw,
  toTransactionStatusRaw,
  fromSignedOperationRaw,
  toSignOperationEventRaw,
  formatTransaction,
} from "@ledgerhq/live-common/transaction/index";
import {
  fromAccountRaw,
  fromAccountLikeRaw,
  toAccountRaw,
  toOperationRaw,
  formatOperation,
  formatAccount,
} from "@ledgerhq/live-common/account/index";
import { startSpan } from "@ledgerhq/live-common/performance";
import { getCryptoCurrencyById } from "@ledgerhq/live-common/currencies/index";
import { toScanAccountEventRaw } from "@ledgerhq/live-common/bridge/index";
import * as bridgeImpl from "@ledgerhq/live-common/bridge/impl";

const cmdCurrencyPreload = ({ currencyId }: { currencyId: string }): Observable<mixed> => {
  const currency = getCryptoCurrencyById(currencyId);
  return from(bridgeImpl.getCurrencyBridge(currency).preload(currency));
};
cmdCurrencyPreload.inferSentryTransaction = ({ currencyId }) => ({
  tags: { currencyId },
});

const cmdCurrencyScanAccounts = (o: {
  currencyId: string,
  deviceId: string,
  syncConfig: SyncConfig,
}): Observable<ScanAccountEventRaw> => {
  const currency = getCryptoCurrencyById(o.currencyId);
  const bridge = bridgeImpl.getCurrencyBridge(currency);
  return bridge
    .scanAccounts({
      currency,
      deviceId: o.deviceId,
      syncConfig: o.syncConfig,
    })
    .pipe(map(toScanAccountEventRaw));
};
cmdCurrencyScanAccounts.inferSentryTransaction = ({ currencyId }) => ({
  tags: { currencyId },
});

const cmdAccountReceive = (o: {
  account: AccountRaw,
  arg: {
    deviceId: string,
    subAccountId?: string,
    verify?: boolean,
    freshAddressIndex?: number,
  },
}): Observable<{ address: string, path: string }> => {
  const account = fromAccountRaw(o.account);
  const bridge = bridgeImpl.getAccountBridge(account, null);
  return bridge.receive(account, o.arg);
};

const accountsCache: { [_: string]: AccountRaw } = {};

const cmdAccountSyncSet = ({ account }: { account: AccountRaw }): Observable<void> => {
  accountsCache[account.id] = account;
  return from([]);
};

const cmdAccountSync = (o: {
  account: AccountRaw,
  syncConfig: SyncConfig,
}): Observable<AccountRaw> => {
  accountsCache[o.account.id] = o.account;
  const span = startSpan("sync", "fromAccountRaw");
  const account = fromAccountRaw(o.account);
  span.finish();
  const bridge = bridgeImpl.getAccountBridge(account, null);
  return bridge.sync(account, o.syncConfig).pipe(
    map(f => {
      const span = startSpan("sync", "toAccountRaw");
      const fromCache = accountsCache[o.account.id];
      const latestAccount = fromCache === o.account ? account : fromAccountRaw(fromCache);
      const r = toAccountRaw(f(latestAccount));
      span.finish();
      return r;
    }),
  );
};
cmdAccountSync.inferSentryTransaction = ({ account }) => ({
  tags: { currencyId: account.currencyId },
});

const cmdAccountPrepareTransaction = (o: {
  account: AccountRaw,
  transaction: TransactionRaw,
}): Observable<TransactionRaw> => {
  const account = fromAccountRaw(o.account);
  const transaction = fromTransactionRaw(o.transaction);
  const bridge = bridgeImpl.getAccountBridge(account, null);
  return from(bridge.prepareTransaction(account, transaction).then(toTransactionRaw));
};

const cmdAccountGetTransactionStatus = (o: {
  account: AccountRaw,
  transaction: TransactionRaw,
}): Observable<TransactionStatusRaw> => {
  const account = fromAccountRaw(o.account);
  const transaction = fromTransactionRaw(o.transaction);
  const bridge = bridgeImpl.getAccountBridge(account, null);
  return from(
    bridge
      .getTransactionStatus(account, transaction)
      .then((raw: TransactionStatus) => toTransactionStatusRaw(raw, account.currency.family)),
  );
};

const cmdAccountSignOperation = (o: {
  account: AccountRaw,
  transaction: TransactionRaw,
  deviceId: string,
}): Observable<SignOperationEventRaw> => {
  const account = fromAccountRaw(o.account);
  const transaction = fromTransactionRaw(o.transaction);

  log("transaction-summary", `→ FROM ${formatAccount(account, "basic")}`);
  log("transaction-summary", `✔️ transaction ${formatTransaction(transaction, account)}`);

  const bridge = bridgeImpl.getAccountBridge(account, null);
  return bridge.signOperation({ account, transaction, deviceId: o.deviceId }).pipe(
    map(toSignOperationEventRaw),
    tap(e => {
      if (e.type === "signed") {
        log("transation-summary", "✔️ has been signed!", { signedOperation: e.signOperation });
      }
    }),
  );
};
cmdAccountSignOperation.inferSentryTransaction = ({ account }) => ({
  tags: { currencyId: account.currencyId },
});

const cmdAccountBroadcast = (o: {
  account: AccountRaw,
  signedOperation: SignedOperationRaw,
}): Observable<OperationRaw> => {
  const account = fromAccountRaw(o.account);
  const signedOperation = fromSignedOperationRaw(o.signedOperation, account.id);
  const bridge = bridgeImpl.getAccountBridge(account, null);
  return from(
    bridge.broadcast({ account, signedOperation }).then(o => {
      log(
        "transaction-summary",
        `✔️ broadcasted! optimistic operation: ${formatOperation(account)(o)}`,
      );
      return toOperationRaw(o, true);
    }),
  );
};
cmdAccountBroadcast.inferSentryTransaction = ({ account }) => ({
  tags: { currencyId: account.currencyId },
});

const cmdAccountEstimateMaxSpendable = (o: {
  account: AccountRawLike,
  parentAccount: ?AccountRaw,
  transaction: ?TransactionRaw,
}): Observable<string> => {
  const account = fromAccountLikeRaw(o.account);
  const parentAccount = o.parentAccount ? fromAccountRaw(o.parentAccount) : null;
  const transaction = o.transaction ? fromTransactionRaw(o.transaction) : null;
  const bridge = bridgeImpl.getAccountBridge(account, parentAccount);
  return from(
    bridge.estimateMaxSpendable({ account, parentAccount, transaction }).then(o => o.toString()),
  );
};

export const commands = {
  CurrencyPreload: cmdCurrencyPreload,
  AccountSync: cmdAccountSync,
  AccountReceive: cmdAccountReceive,
  AccountGetTransactionStatus: cmdAccountGetTransactionStatus,
  AccountPrepareTransaction: cmdAccountPrepareTransaction,
  AccountSignOperation: cmdAccountSignOperation,
  AccountBroadcast: cmdAccountBroadcast,
  CurrencyScanAccounts: cmdCurrencyScanAccounts,
  AccountEstimateMaxSpendable: cmdAccountEstimateMaxSpendable,
  AccountSyncSet: cmdAccountSyncSet,
};