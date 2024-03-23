import React from "react";
import { useSelector } from "react-redux";
import Card from "~/renderer/components/Box/Card";
import {
  counterValueCurrencySelector,
  languageSelector,
  localeSelector,
} from "~/renderer/reducers/settings";
import { useRemoteLiveAppManifest } from "@ledgerhq/live-common/platform/providers/RemoteLiveAppProvider/index";
import WebPlatformPlayer from "~/renderer/components/WebPlatformPlayer";
import useTheme from "~/renderer/hooks/useTheme";
import { useLocalLiveAppManifest } from "@ledgerhq/live-common/platform/providers/LocalLiveAppProvider/index";
import { useDiscreetMode } from "~/renderer/components/Discreet";

const DEFAULT_REFER_APP_ID = "refer-a-friend";

const Refer = () => {
  const language = useSelector(languageSelector);
  const locale = useSelector(localeSelector);
  const fiatCurrency = useSelector(counterValueCurrencySelector);
  const localManifest = useLocalLiveAppManifest(DEFAULT_REFER_APP_ID);
  const remoteManifest = useRemoteLiveAppManifest(DEFAULT_REFER_APP_ID);
  const manifest = localManifest || remoteManifest;
  const themeType = useTheme().colors.palette.type;
  const discreetMode = useDiscreetMode();

  return (
    <Card grow style={{ overflow: "hidden" }} data-test-id="refer-app-container">
      {manifest ? (
        <WebPlatformPlayer
          config={{
            topBarConfig: {
              hide: true,
            },
          }}
          manifest={manifest}
          inputs={{
            theme: themeType,
            lang: language,
            locale: locale,
            currencyTicker: fiatCurrency.ticker,
            discreetMode: discreetMode ? "true" : "false",
          }}
        />
      ) : null}
    </Card>
  );
};

export default Refer;
