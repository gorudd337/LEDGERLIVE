/* eslint-disable consistent-return */
import { getAccountCurrency, getAccountUnit } from "@ledgerhq/live-common/account/index";
import { formatCurrencyUnit } from "@ledgerhq/live-common/currencies/index";
import { getAddressExplorer, getDefaultExplorerView } from "@ledgerhq/live-common/explorers";
import cryptoFactory from "@ledgerhq/live-common/families/cosmos/chain/chain";
import { mapDelegationInfo } from "@ledgerhq/live-common/families/cosmos/logic";
import { useCosmosFamilyPreloadData } from "@ledgerhq/live-common/families/cosmos/react";
import {
  CosmosAccount,
  CosmosDelegationInfo,
  CosmosValidatorItem,
} from "@ledgerhq/live-common/families/cosmos/types";
import { CryptoCurrency, Unit } from "@ledgerhq/types-cryptoassets";
import { Account, Operation } from "@ledgerhq/types-live";
import { BigNumber } from "bignumber.js";
import React, { useMemo } from "react";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";
import Box from "~/renderer/components/Box/Box";
import CounterValue from "~/renderer/components/CounterValue";
import { useDiscreetMode } from "~/renderer/components/Discreet";
import Ellipsis from "~/renderer/components/Ellipsis";
import FormattedVal from "~/renderer/components/FormattedVal";
import Text from "~/renderer/components/Text";
import {
  Address,
  B,
  OpDetailsData,
  OpDetailsSection,
  OpDetailsTitle,
  OpDetailsVoteData,
} from "~/renderer/drawers/OperationDetails/styledComponents";
import { openURL } from "~/renderer/linking";
import { localeSelector } from "~/renderer/reducers/settings";
import { AmountCellExtraProps, OperationDetailsExtraProps } from "../types";

function getURLFeesInfo({
  op,
  currencyId,
}: {
  op: Operation;
  currencyId: string;
}): string | null | undefined {
  if (op.fee.gt(200000) && currencyId) {
    return cryptoFactory(currencyId).stakingDocUrl;
  }
}
function getURLWhatIsThis({
  op,
  currencyId,
}: {
  op: Operation;
  currencyId: string;
}): string | null | undefined {
  if (op.type !== "IN" && op.type !== "OUT" && currencyId) {
    return cryptoFactory(currencyId).stakingDocUrl;
  }
}
export const redirectAddress = (currency: CryptoCurrency, address: string) => () => {
  const url = getAddressExplorer(getDefaultExplorerView(currency), address);
  if (url) openURL(url);
};

type OperationDetailsDelegationProps = {
  discreet: boolean;
  unit: Unit;
  currency: CryptoCurrency;
  delegations: Array<CosmosDelegationInfo>;
  account: Account;
  isTransactionField?: boolean;
  validators: CosmosValidatorItem[];
};
export const OperationDetailsDelegation = ({
  unit,
  currency,
  delegations,
  isTransactionField,
  validators,
}: OperationDetailsDelegationProps) => {
  const mappedDelegationInfo = useMemo(() => mapDelegationInfo(delegations, validators, unit), [
    delegations,
    validators,
    unit,
  ]);
  return (
    <OpDetailsSection>
      {!isTransactionField && (
        <OpDetailsTitle>
          <Trans i18nKey={"operationDetails.extra.validators"} />
        </OpDetailsTitle>
      )}

      {mappedDelegationInfo.map(({ formattedAmount, validator, address }, i) => (
        <OpDetailsData key={address + i}>
          <OpDetailsVoteData>
            <Box>
              <Text>
                <Trans
                  i18nKey="operationDetails.extra.votesAddress"
                  values={{
                    votes: formattedAmount,
                    name: validator?.name ?? address,
                  }}
                >
                  <Text ff="Inter|SemiBold">{""}</Text>
                  {""}
                  <Text ff="Inter|SemiBold">{""}</Text>
                </Trans>
              </Text>
            </Box>
            <Address onClick={redirectAddress(currency, address)}>{address}</Address>
          </OpDetailsVoteData>
        </OpDetailsData>
      ))}
    </OpDetailsSection>
  );
};

const OperationDetailsExtra = ({
  extra,
  type,
  account,
}: OperationDetailsExtraProps<CosmosAccount>) => {
  const unit = getAccountUnit(account);
  const currency = getAccountCurrency(account);
  const discreet = useDiscreetMode();
  const locale = useSelector(localeSelector);
  const currencyId = account.currency.id;
  const { validators: cosmosValidators } = useCosmosFamilyPreloadData(currencyId);
  const formatConfig = {
    disableRounding: true,
    alwaysShowSign: false,
    showCode: true,
    discreet,
    locale,
  };
  let ret = null;
  if (currency.type === "CryptoCurrency") {
    switch (type) {
      case "DELEGATE": {
        const { validators: delegations } = extra;
        if (!delegations || !delegations.length) return null;
        return (
          <OperationDetailsDelegation
            discreet={discreet}
            unit={unit}
            currency={currency}
            delegations={delegations}
            account={account}
            validators={cosmosValidators}
          />
        );
      }
      case "UNDELEGATE": {
        const { validators } = extra;
        if (!validators || validators.length <= 0) return null;
        const validator = extra.validators[0];
        const formattedValidator = cosmosValidators.find(
          v => v.validatorAddress === validator.address,
        );
        const formattedAmount = formatCurrencyUnit(unit, BigNumber(validator.amount), formatConfig);
        ret = (
          <>
            <B />
            <OpDetailsSection>
              <OpDetailsTitle>
                <Trans i18nKey={"operationDetails.extra.undelegatedFrom"} />
              </OpDetailsTitle>
              <OpDetailsData>
                <Address onClick={redirectAddress(currency, validator.address)}>
                  {formattedValidator ? formattedValidator.name : validator.address}
                </Address>
              </OpDetailsData>
            </OpDetailsSection>
            <B />
            <OpDetailsSection>
              <OpDetailsTitle>
                <Trans i18nKey={"operationDetails.extra.undelegatedAmount"} />
              </OpDetailsTitle>
              <OpDetailsData>{formattedAmount}</OpDetailsData>
            </OpDetailsSection>
          </>
        );
        break;
      }
      case "REDELEGATE": {
        const { sourceValidator, validators } = extra;
        if (!validators || validators.length <= 0 || !sourceValidator) return null;
        const validator = extra.validators[0];
        const formattedValidator = cosmosValidators.find(
          v => v.validatorAddress === validator.address,
        );
        const formattedSourceValidator = cosmosValidators.find(
          v => v.validatorAddress === sourceValidator,
        );
        const formattedAmount = formatCurrencyUnit(unit, BigNumber(validator.amount), formatConfig);
        ret = (
          <>
            <B />
            <OpDetailsSection>
              <OpDetailsTitle>
                <Trans i18nKey={"operationDetails.extra.redelegatedFrom"} />
              </OpDetailsTitle>
              <OpDetailsData>
                <Address onClick={redirectAddress(currency, sourceValidator)}>
                  {formattedSourceValidator ? formattedSourceValidator.name : sourceValidator}
                </Address>
              </OpDetailsData>
            </OpDetailsSection>
            <B />

            <OpDetailsSection>
              <OpDetailsTitle>
                <Trans i18nKey={"operationDetails.extra.redelegatedTo"} />
              </OpDetailsTitle>
              <OpDetailsData>
                <Address onClick={redirectAddress(currency, validator.address)}>
                  {formattedValidator ? formattedValidator.name : validator.address}
                </Address>
              </OpDetailsData>
            </OpDetailsSection>
            <OpDetailsSection>
              <OpDetailsTitle>
                <Trans i18nKey={"operationDetails.extra.redelegatedAmount"} />
              </OpDetailsTitle>
              <OpDetailsData>{formattedAmount}</OpDetailsData>
            </OpDetailsSection>
          </>
        );
        break;
      }
      case "REWARD": {
        const { validators } = extra;
        if (!validators || validators.length <= 0) return null;
        const validator = extra.validators[0];
        const formattedValidator = cosmosValidators.find(
          v => v.validatorAddress === validator.address,
        );
        ret = (
          <>
            <B />
            <OpDetailsSection>
              <OpDetailsTitle>
                <Trans i18nKey={"operationDetails.extra.rewardFrom"} />
              </OpDetailsTitle>
              <OpDetailsData>
                <Address onClick={redirectAddress(currency, validator.address)}>
                  {formattedValidator ? formattedValidator.name : validator.address}
                </Address>
              </OpDetailsData>
            </OpDetailsSection>
          </>
        );
        break;
      }
      default:
        break;
    }
  }
  return (
    <>
      {ret}
      {extra.memo && (
        <OpDetailsSection>
          <OpDetailsTitle>
            <Trans i18nKey={"operationDetails.extra.memo"} />
          </OpDetailsTitle>
          <OpDetailsData>
            <Ellipsis ml={2}>{extra.memo}</Ellipsis>
          </OpDetailsData>
        </OpDetailsSection>
      )}
    </>
  );
};

const RedelegateAmountCell = ({ operation, currency, unit }: AmountCellExtraProps) => {
  const amount =
    operation.extra && operation.extra.validators
      ? BigNumber(operation.extra.validators[0].amount)
      : BigNumber(0);
  return !amount.isZero() ? (
    <>
      <FormattedVal val={amount} unit={unit} showCode fontSize={4} color={"palette.text.shade80"} />

      <CounterValue
        color="palette.text.shade60"
        fontSize={3}
        date={operation.date}
        currency={currency}
        value={amount}
      />
    </>
  ) : null;
};
const UndelegateAmountCell = ({ operation, currency, unit }: AmountCellExtraProps) => {
  const amount =
    operation.extra && operation.extra.validators
      ? BigNumber(operation.extra.validators[0].amount)
      : BigNumber(0);
  return !amount.isZero() ? (
    <>
      <FormattedVal val={amount} unit={unit} showCode fontSize={4} color={"palette.text.shade80"} />

      <CounterValue
        color="palette.text.shade60"
        fontSize={3}
        date={operation.date}
        currency={currency}
        value={amount}
      />
    </>
  ) : null;
};
export const amountCellExtra = {
  REDELEGATE: RedelegateAmountCell,
  UNDELEGATE: UndelegateAmountCell,
};

export default {
  getURLFeesInfo,
  getURLWhatIsThis,
  OperationDetailsExtra,
  amountCellExtra,
};