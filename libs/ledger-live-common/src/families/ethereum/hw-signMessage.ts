import Eth from "@ledgerhq/hw-app-eth";
import Transport from "@ledgerhq/hw-transport";
import { TypedDataUtils } from "eth-sig-util";
import { bufferToHex } from "ethereumjs-util";
import { Eth as MMEth, MetaMaskConnector } from "mm-app-eth";
import { getEnv } from "../../env";
import type { MessageData, Result } from "../../hw/signMessage/types";
import type { TypedMessage, TypedMessageData } from "./types";
type EthResolver = (
  arg0: Transport,
  arg1: MessageData | TypedMessageData
) => Promise<Result>;
export const domainHash = (message: TypedMessage) => {
  return TypedDataUtils.hashStruct(
    "EIP712Domain",
    message.domain,
    message.types,
    true
  );
};
export const messageHash = (message: TypedMessage) => {
  return TypedDataUtils.hashStruct(
    message.primaryType,
    message.message,
    message.types,
    true
  );
};

const resolver: EthResolver = async (
  transport,
  // @ts-expect-error only available on MessageData. (type guard)
  { path, message, rawMessage }
) => {
  const eth: Eth | MMEth = await (async () => {
    if (getEnv("SANDBOX_MODE") === 2) {
      const connector = new MetaMaskConnector({
        port: 3333,
      });
      await connector.start();
      return new MMEth(connector.getProvider());
    }
    return new Eth(transport);
  })();
  let result;

  if (typeof message === "string") {
    result = await eth.signPersonalMessage(path, rawMessage.slice(2));
  } else {
    if (getEnv("EXPERIMENTAL_EIP712")) {
      result = await eth.signEIP712Message(path, message);
    } else {
      result = await eth.signEIP712HashedMessage(
        path,
        bufferToHex(domainHash(message)),
        bufferToHex(messageHash(message))
      );
    }
  }

  result["v"] = result["v"].toString(16);
  if (result["v"].length % 2 !== 0) {
    result["v"] = "0" + result["v"];
  }

  const signature = `0x${result["r"]}${result["s"]}${result["v"]}`;
  return {
    rsv: result,
    signature,
  };
};

export default resolver;
