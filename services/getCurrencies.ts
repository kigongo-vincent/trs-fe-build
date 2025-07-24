export interface CurrencyI {
  logo: string;
  code: string;
}

export async function getCurrencies(
  setLoading: (loading: boolean) => void,
  setCurrencies: (currencies: CurrencyI[]) => void
) {
  setLoading(true);
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=currencies,flags"
    );
    if (!response.ok) throw new Error("Failed to fetch currency data");

    const data = await response.json();

    const seen = new Set<string>();
    const currencies: CurrencyI[] = [];

    for (const country of data) {
      const { currencies: curr, flags } = country;
      if (!curr || !flags?.svg) continue;

      for (const code in curr) {
        if (!seen.has(code)) {
          seen.add(code);
          currencies.push({
            code: code,
            logo: flags.svg,
          });
        }
      }
    }

    setCurrencies(currencies.sort((a, b) => a.code.localeCompare(b.code)));
  } catch (error) {
    console.error("Error fetching currencies:", error);
  } finally {
    setLoading(false);
  }
}
