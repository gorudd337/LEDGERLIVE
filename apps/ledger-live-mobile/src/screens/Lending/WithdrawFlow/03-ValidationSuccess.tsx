import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";
import { CompositeScreenProps, useTheme } from "@react-navigation/native";
import { TrackScreen } from "../../../analytics";
import PreventNativeBack from "../../../components/PreventNativeBack";
import ValidateSuccess from "../../../components/ValidateSuccess";
import { accountScreenSelector } from "../../../reducers/accounts";
import { ScreenName } from "../../../const";
import { LendingWithdrawFlowNavigatorParamList } from "../../../components/RootNavigator/types/LendingWithdrawFlowNavigator";
import {
  StackNavigatorNavigation,
  StackNavigatorProps,
} from "../../../components/RootNavigator/types/helpers";
import { BaseNavigatorStackParamList } from "../../../components/RootNavigator/types/BaseNavigator";

type NavigationProps = CompositeScreenProps<
  StackNavigatorProps<
    LendingWithdrawFlowNavigatorParamList,
    ScreenName.LendingWithdrawValidationSuccess
  >,
  StackNavigatorProps<BaseNavigatorStackParamList>
>;

export default function ValidationSuccess({
  navigation,
  route,
}: NavigationProps) {
  const { colors } = useTheme();
  const onClose = useCallback(() => {
    const n =
      navigation.getParent<
        StackNavigatorNavigation<BaseNavigatorStackParamList>
      >() || navigation;
    n.pop();
  }, [navigation]);
  const { account, parentAccount } = useSelector(accountScreenSelector(route));
  const goToOperationDetails = useCallback(() => {
    if (!account) return;
    const result = route.params?.result;
    if (!result) return;
    navigation.navigate(ScreenName.OperationDetails, {
      accountId: account.id,
      parentId: parentAccount && parentAccount.id,
      operation:
        result.subOperations && result.subOperations[0]
          ? result.subOperations[0]
          : result,
    });
  }, [account, route.params?.result, navigation, parentAccount]);
  const { currency } = route.params;
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <TrackScreen
        category="Lend Withdraw"
        name="Success"
        eventProperties={{
          currencyName: currency?.name,
        }}
      />
      <PreventNativeBack />
      <ValidateSuccess
        title={<Trans i18nKey="transfer.lending.withdraw.validation.success" />}
        description={
          <Trans i18nKey="transfer.lending.withdraw.validation.info" />
        }
        onViewDetails={goToOperationDetails}
        onClose={onClose}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});