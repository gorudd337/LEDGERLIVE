import { Tag } from "@ledgerhq/native-ui";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { urls } from "../../../config/urls";
import Button from "../../Button";

function ActiveProtectState({ params }: { params: Record<string, string> }) {
  const { t } = useTranslation();

  const { viewDetailsURI } = params || {};

  const onViewDetails = useCallback(() => {
    const url = `${viewDetailsURI}&source=${urls.recoverSources.myLedger}`;
    Linking.canOpenURL(url).then(() => Linking.openURL(url));
  }, [viewDetailsURI]);

  return (
    <Button type="main" outline={false} onPress={onViewDetails} mt={8}>
      {t(`servicesWidget.protect.status.active.actions.viewDetails`)}
    </Button>
  );
}

const StateTag = () => {
  const { t } = useTranslation();

  return (
    <Tag
      color="primary.c80"
      textColor="neutral.c00"
      ellipsizeMode="tail"
      size="medium"
    >
      {t(`servicesWidget.protect.status.active.title`)}
    </Tag>
  );
};

ActiveProtectState.StatusTag = StateTag;

export default ActiveProtectState;