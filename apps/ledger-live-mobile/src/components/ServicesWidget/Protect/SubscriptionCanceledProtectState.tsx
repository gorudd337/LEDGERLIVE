import { Tag } from "@ledgerhq/native-ui";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { urls } from "../../../config/urls";
import Button from "../../Button";

function SubscriptionCanceledProtectState({
  params,
}: {
  params: Record<string, string>;
}) {
  const { t } = useTranslation();

  const { contactLedgerSupportURI, viewDetailsURI } = params || {};

  const onContactLedgerSupport = useCallback(() => {
    const url = `${contactLedgerSupportURI}&source=${urls.recoverSources.myLedger}`;
    Linking.canOpenURL(url).then(() => Linking.openURL(url));
  }, [contactLedgerSupportURI]);

  const onViewDetails = useCallback(() => {
    const url = `${viewDetailsURI}&source=${urls.recoverSources.myLedger}`;
    Linking.canOpenURL(url).then(() => Linking.openURL(url));
  }, [viewDetailsURI]);

  return (
    <>
      <Button
        type="main"
        outline={false}
        onPress={onContactLedgerSupport}
        mt={8}
        mb={6}
      >
        {t(
          `servicesWidget.protect.status.subscriptionCanceled.actions.contactLedgerSupport`,
        )}
      </Button>
      <Button type="default" outline={false} onPress={onViewDetails}>
        {t(
          `servicesWidget.protect.status.subscriptionCanceled.actions.viewDetails`,
        )}
      </Button>
    </>
  );
}

const StateTag = () => {
  const { t } = useTranslation();

  return (
    <Tag
      color="neutral.c40"
      textColor="neutral.c90"
      ellipsizeMode="tail"
      size="medium"
    >
      {t(`servicesWidget.protect.status.subscriptionCanceled.title`)}
    </Tag>
  );
};

SubscriptionCanceledProtectState.StatusTag = StateTag;

export default SubscriptionCanceledProtectState;