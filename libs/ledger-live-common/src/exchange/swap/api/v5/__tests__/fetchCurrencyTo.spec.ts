import network from "@ledgerhq/live-network/network";

import { fetchCurrencyTo } from "../fetchCurrencyTo";
import { fetchCurrencyToMock } from "../__mocks__/fetchCurrencyTo.mocks";
import { DEFAULT_SWAP_TIMEOUT_MS } from "../../../const/timeout";
import { LedgerAPI4xx } from "@ledgerhq/errors";

jest.mock("@ledgerhq/live-network/network");

const mockNetwork = network as jest.Mock;

describe("fetchCurrencyFrom", () => {
  it("success with 200", async () => {
    mockNetwork.mockReturnValueOnce({
      data: fetchCurrencyToMock,
    });

    const result = await fetchCurrencyTo({
      providers: ["changelly", "cic", "oneinch"],
      currencyFrom: "bitcoin",
    });

    expect(result).toStrictEqual(fetchCurrencyToMock);
    expect(mockNetwork).toHaveBeenCalledWith({
      method: "GET",
      timeout: DEFAULT_SWAP_TIMEOUT_MS,
      url: "https://swap-stg.ledger.com/v5/currencies/to?providers-whitelist=changelly%2Ccic%2Coneinch&additional-coins-flag=false&currencyFrom=bitcoin",
    });
  });

  it("fails with 400", async () => {
    mockNetwork.mockRejectedValueOnce(new LedgerAPI4xx());

    try {
      await fetchCurrencyTo({
        providers: ["changelly", "cic", "oneinch"],
        currencyFrom: "bitcoin",
      });
    } catch (e) {
      expect(e).toBeInstanceOf(LedgerAPI4xx);
    }
  });
});