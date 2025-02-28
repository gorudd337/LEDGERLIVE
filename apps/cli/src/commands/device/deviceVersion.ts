import { from } from "rxjs";
import { withDevice } from "@ledgerhq/live-common/hw/deviceAccess";
import { getVersion } from "@ledgerhq/live-common/device/use-cases/getVersionUseCase";
import { deviceOpt } from "../../scan";
export default {
  args: [deviceOpt],
  job: ({
    device,
  }: Partial<{
    device: string;
  }>) => withDevice(device || "")(t => from(getVersion(t))),
};
