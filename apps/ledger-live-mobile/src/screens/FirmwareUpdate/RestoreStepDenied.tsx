import React from "react";
import { Text, Flex, Icons, IconBadge } from "@ledgerhq/native-ui";
import { Device } from "@ledgerhq/types-devices";
import { TFunction } from "i18next";
import { getDeviceModel } from "@ledgerhq/devices";
import Button from "../../components/wrappedUi/Button";
import Link from "../../components/wrappedUi/Link";
import { TrackScreen } from "../../analytics";
import { UserRefusedAllowManager } from "@ledgerhq/errors";
import {
  LanguageInstallRefusedOnDevice,
  ImageLoadRefusedOnDevice,
  ImageCommitRefusedOnDevice,
} from "@ledgerhq/live-common/errors";

export const RestoreStepDenied = ({
  t,
  device,
  onPressRetry,
  onPressSkip,
  stepDeniedError,
}: {
  t: TFunction;
  device: Device;
  onPressRetry: () => void;
  onPressSkip: () => void;
  stepDeniedError: Error;
}) => {
  const deviceName = getDeviceModel(device.modelId).productName;
  const analyticsDrawerName =
    stepDeniedError instanceof LanguageInstallRefusedOnDevice
      ? `Error: the language change was cancelled on ${deviceName}`
      : (stepDeniedError as Error) instanceof ImageLoadRefusedOnDevice ||
        (stepDeniedError as Error) instanceof ImageCommitRefusedOnDevice
      ? `Error: the restoration of lock screen picture was cancelled on ${deviceName}`
      : (stepDeniedError as Error) instanceof UserRefusedAllowManager
      ? `Error: the restoration of apps was cancelled on ${deviceName}`
      : `Error: ${(stepDeniedError as Error).name}`;
  return (
    <Flex alignItems="center" justifyContent="center" px={1}>
      <TrackScreen category={analyticsDrawerName} refreshSource={false} />
      <IconBadge iconColor="primary.c100" iconSize={32} Icon={Icons.InfoAltFillMedium} />
      <Text fontSize={7} fontWeight="semiBold" textAlign="center" mt={6}>
        {t(`FirmwareUpdate.steps.restoreSettings.errors.${stepDeniedError.name}`, {
          deviceName: getDeviceModel(device.modelId).productName,
        })}
      </Text>
      <Text fontSize={4} textAlign="center" color="neutral.c80" mt={6}>
        {t("FirmwareUpdate.steps.restoreSettings.errors.description")}
      </Text>
      <Button
        event="button_clicked"
        eventProperties={{
          button: "Retry",
          screen: "Firmware update",
          drawer: analyticsDrawerName,
        }}
        type="main"
        outline={false}
        onPress={onPressRetry}
        mt={8}
        alignSelf="stretch"
      >
        {t("common.retry")}
      </Button>
      <Flex mt={8} mb={6} alignSelf="stretch">
        <Link
          event="button_clicked"
          eventProperties={{
            button: "Skip",
            screen: "Firmware update",
            drawer: analyticsDrawerName,
          }}
          onPress={onPressSkip}
        >
          {t("common.skip")}
        </Link>
      </Flex>
    </Flex>
  );
};