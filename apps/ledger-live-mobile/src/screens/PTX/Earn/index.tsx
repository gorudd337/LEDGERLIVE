import React, { memo } from "react";
import { Platform } from "react-native";
import { useLocalLiveAppManifest } from "@ledgerhq/live-common/platform/providers/LocalLiveAppProvider/index";
import {
  useRemoteLiveAppContext,
  useRemoteLiveAppManifest,
} from "@ledgerhq/live-common/platform/providers/RemoteLiveAppProvider/index";
import { useTheme } from "styled-components/native";
import { Flex, InfiniteLoader } from "@ledgerhq/native-ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TrackScreen from "../../../analytics/TrackScreen";
import GenericErrorView from "../../../components/GenericErrorView";
import { WebPTXPlayer } from "../../../components/WebPTXPlayer";
import { EarnLiveAppNavigatorParamList } from "../../../components/RootNavigator/types/EarnLiveAppNavigator";
import { StackNavigatorProps } from "../../../components/RootNavigator/types/helpers";
import { ScreenName } from "../../../const";
import {
  counterValueCurrencySelector,
  discreetModeSelector,
  languageSelector,
} from "../../../reducers/settings";
import { useSelector } from "react-redux";
import { MAIN_BUTTON_BOTTOM, MAIN_BUTTON_SIZE } from "../../../components/TabBar/shared";
import { LiveAppManifest } from "@ledgerhq/live-common/platform/types";

export type Props = StackNavigatorProps<EarnLiveAppNavigatorParamList, ScreenName.Earn>;

const appManifestNotFoundError = new Error("Earn App not found");
const DEFAULT_EARN_APP_ID = "earn";

export const EarnScreen = memo(Earn);

function Earn({ route }: Props) {
  const { theme } = useTheme();
  const language = useSelector(languageSelector);
  const { ticker: currencyTicker } = useSelector(counterValueCurrencySelector);
  const discreet = useSelector(discreetModeSelector);
  const insets = useSafeAreaInsets();

  const { platform: appId, ...params } = route.params || {};
  const searchParams = route.path
    ? new URL("ledgerlive://" + route.path).searchParams
    : new URLSearchParams();

  const localManifest: LiveAppManifest | undefined = useLocalLiveAppManifest(DEFAULT_EARN_APP_ID);
  const remoteManifest: LiveAppManifest | undefined = useRemoteLiveAppManifest(DEFAULT_EARN_APP_ID);
  const { state: remoteLiveAppState } = useRemoteLiveAppContext();

  const manifest: LiveAppManifest | undefined = !localManifest ? remoteManifest : localManifest;

  if (!remoteLiveAppState.isLoading && !manifest) {
    // We want to track occurrences of this error in Sentry
    console.error(appManifestNotFoundError);
  }

  const isAndroid = Platform.OS === "android";

  return manifest ? (
    <Flex
      /**
       * NB: not using SafeAreaView because it flickers during navigation
       * https://github.com/th3rdwave/react-native-safe-area-context/issues/219
       */
      flex={1}
      pt={insets.top}
      pb={isAndroid ? MAIN_BUTTON_BOTTOM : MAIN_BUTTON_SIZE} // iOS calculates differently
      backgroundColor={"background.main"} // Earn app bg color
    >
      <TrackScreen category="EarnDashboard" name="Earn" />
      <WebPTXPlayer
        manifest={manifest}
        disableHeader
        inputs={{
          theme,
          lang: language,
          locale: language, // LLM doesn't support different locales. By doing this we don't have to have specific LLM/LLD logic in earn, and in future if LLM supports locales we will change this from `language` to `locale`
          currencyTicker,
          discreetMode: discreet ? "true" : "false",
          ...params,
          ...Object.fromEntries(searchParams.entries()),
        }}
      />
    </Flex>
  ) : (
    <Flex flex={1} p={10} justifyContent="center" alignItems="center">
      {remoteLiveAppState.isLoading ? (
        <InfiniteLoader />
      ) : (
        <GenericErrorView error={appManifestNotFoundError} />
      )}
    </Flex>
  );
}