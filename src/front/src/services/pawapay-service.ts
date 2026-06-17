/**
 * PawaPay provider detection and country mapping service.
 *
 * Msisdn format: digits only, no "+" prefix, e.g. "237695000000"
 * Country code is extracted from the first 1-4 digits of the MSISDN.
 */

/* ─── Country phone prefix → ISO country code ──────────── */
const MSISDN_PREFIX_TO_COUNTRY: Record<string, string> = {
  "237": "CMR", // Cameroon
  "225": "CIV", // Côte d'Ivoire
  "229": "BEN", // Benin
  "226": "BFA", // Burkina Faso
  "243": "COD", // DRC
  "251": "ETH", // Ethiopia
  "241": "GAB", // Gabon
  "233": "GHA", // Ghana
  "224": "GIN", // Guinea
  "254": "KEN", // Kenya
  "231": "LBR", // Liberia
  "261": "MDG", // Madagascar
  "265": "MWI", // Malawi
  "223": "MLI", // Mali
  "222": "MRT", // Mauritania
  "230": "MUS", // Mauritius
  "258": "MOZ", // Mozambique
  "234": "NGA", // Nigeria
  "250": "RWA", // Rwanda
  "221": "SEN", // Senegal
  "232": "SLE", // Sierra Leone
  "252": "SOM", // Somalia
  "255": "TZA", // Tanzania
  "228": "TGO", // Togo
  "256": "UGA", // Uganda
  "260": "ZMB", // Zambia
  "263": "ZWE", // Zimbabwe
};

/* ─── MMO providers indexed by ISO country code ────────── */
const COUNTRY_PROVIDERS: Record<
  string,
  { value: string; label: string; currency: string }[]
> = {
  BEN: [
    { value: "MTN_MOMO_BEN", label: "MTN Mobile Money", currency: "XOF" },
    { value: "MOOV_BEN", label: "Moov", currency: "XOF" },
  ],
  BFA: [
    { value: "MOOV_BFA", label: "Moov", currency: "XOF" },
    { value: "ORANGE_BFA", label: "Orange Money", currency: "XOF" },
  ],
  CMR: [
    { value: "MTN_MOMO_CMR", label: "MTN Mobile Money", currency: "XAF" },
    { value: "ORANGE_CMR", label: "Orange Money", currency: "XAF" },
  ],
  CIV: [
    { value: "MTN_MOMO_CIV", label: "MTN Mobile Money", currency: "XOF" },
    { value: "ORANGE_CIV", label: "Orange Money", currency: "XOF" },
    { value: "WAVE_CIV", label: "Wave", currency: "XOF" },
  ],
  COD: [
    { value: "VODACOM_MPESA_COD", label: "Vodacom M-Pesa", currency: "CDF" },
    { value: "AIRTEL_COD", label: "Airtel Money", currency: "CDF" },
    { value: "ORANGE_COD", label: "Orange Money", currency: "CDF" },
  ],
  ETH: [{ value: "MPESA_ETH", label: "Safaricom M-Pesa", currency: "ETB" }],
  GAB: [
    { value: "AIRTEL_GAB", label: "Airtel Money", currency: "XAF" },
    { value: "MOOV_GAB", label: "Moov", currency: "XAF" },
  ],
  GHA: [
    { value: "MTN_MOMO_GHA", label: "MTN Mobile Money", currency: "GHS" },
    { value: "VODAFONE_GHA", label: "Vodafone Cash", currency: "GHS" },
    { value: "AIRTELTIGO_GHA", label: "AirtelTigo Money", currency: "GHS" },
  ],
  GIN: [
    { value: "ORANGE_GIN", label: "Orange Money", currency: "GNF" },
    { value: "MTN_MOMO_GIN", label: "MTN Mobile Money", currency: "GNF" },
  ],
  KEN: [
    { value: "MPESA_KEN", label: "M-Pesa", currency: "KES" },
    { value: "AIRTEL_KEN", label: "Airtel Money", currency: "KES" },
  ],
  LBR: [
    { value: "MTN_MOMO_LBR", label: "MTN Mobile Money", currency: "LRD" },
    { value: "ORANGE_LBR", label: "Orange Money", currency: "LRD" },
  ],
  MDG: [
    { value: "MVOLA_MDG", label: "MVola", currency: "MGA" },
    { value: "AIRTEL_MDG", label: "Airtel Money", currency: "MGA" },
    { value: "ORANGE_MDG", label: "Orange Money", currency: "MGA" },
  ],
  MWI: [
    { value: "AIRTEL_MWI", label: "Airtel Money", currency: "MWK" },
    { value: "TN_MOMO_MWI", label: "TN Mobile Money", currency: "MWK" },
  ],
  MLI: [
    { value: "ORANGE_MLI", label: "Orange Money", currency: "XOF" },
    { value: "MOOV_MLI", label: "Moov", currency: "XOF" },
  ],
  MRT: [
    { value: "MAURITEL_MRT", label: "Mauritel", currency: "MRU" },
    { value: "MOOV_MRT", label: "Moov", currency: "MRU" },
  ],
  MUS: [{ value: "MPESA_MUS", label: "M-Pesa", currency: "MUR" }],
  MOZ: [
    { value: "MPESA_MOZ", label: "M-Pesa", currency: "MZN" },
    { value: "VODACOM_MOZ", label: "Vodacom", currency: "MZN" },
  ],
  NGA: [
    { value: "PAGA_NGA", label: "Paga", currency: "NGN" },
    { value: "OPAY_NGA", label: "OPay", currency: "NGN" },
    { value: "PALMPAY_NGA", label: "PalmPay", currency: "NGN" },
  ],
  RWA: [
    { value: "MPESA_RWA", label: "M-Pesa", currency: "RWF" },
    { value: "AIRTEL_RWA", label: "Airtel Money", currency: "RWF" },
  ],
  SEN: [
    { value: "ORANGE_SEN", label: "Orange Money", currency: "XOF" },
    { value: "FREE_SEN", label: "Free Money", currency: "XOF" },
    { value: "WAVE_SEN", label: "Wave", currency: "XOF" },
  ],
  SLE: [
    { value: "AFRICELL_SLE", label: "Africell", currency: "SLL" },
    { value: "ORANGE_SLE", label: "Orange Money", currency: "SLL" },
  ],
  SOM: [
    { value: "ZAAD_SOM", label: "Zaad", currency: "SOS" },
    { value: "EDAHAB_SOM", label: "E-Dahab", currency: "SOS" },
  ],
  TZA: [
    { value: "MPESA_TZA", label: "M-Pesa", currency: "TZS" },
    { value: "AIRTEL_TZA", label: "Airtel Money", currency: "TZS" },
    { value: "TIGO_TZA", label: "Tigo Pesa", currency: "TZS" },
    { value: "HALOPESA_TZA", label: "HaloPesa", currency: "TZS" },
  ],
  TGO: [
    { value: "MOOV_TGO", label: "Moov", currency: "XOF" },
    { value: "TOGOCEL_TGO", label: "Togocel", currency: "XOF" },
  ],
  UGA: [
    { value: "MTN_MOMO_UGA", label: "MTN Mobile Money", currency: "UGX" },
    { value: "AIRTEL_UGA", label: "Airtel Money", currency: "UGX" },
  ],
  ZMB: [
    { value: "MTN_MOMO_ZMB", label: "MTN Mobile Money", currency: "ZMW" },
    { value: "AIRTEL_ZMB", label: "Airtel Money", currency: "ZMW" },
  ],
  ZWE: [
    { value: "ECOCASH_ZWE", label: "EcoCash", currency: "USD" },
    { value: "ONEMONEY_ZWE", label: "OneMoney", currency: "USD" },
  ],
};

/* ─── Helpers ──────────────────────────────────────────── */

/**
 * Extract ISO country code from a raw MSISDN (digits only, no "+").
 * Tries 3-digit prefix first, then 2-digit, then 4-digit.
 */
export function detectCountryFromMsisdn(msisdn: string): string | null {
  const digits = msisdn.replace(/[^0-9]/g, "");
  if (digits.length < 3) return null;

  // Try 3-digit prefix (most common)
  const prefix3 = digits.slice(0, 3);
  if (MSISDN_PREFIX_TO_COUNTRY[prefix3]) {
    return MSISDN_PREFIX_TO_COUNTRY[prefix3];
  }

  // Try 2-digit prefix
  const prefix2 = digits.slice(0, 2);
  if (MSISDN_PREFIX_TO_COUNTRY[prefix2]) {
    return MSISDN_PREFIX_TO_COUNTRY[prefix2];
  }

  // Try 4-digit prefix
  const prefix4 = digits.slice(0, 4);
  if (MSISDN_PREFIX_TO_COUNTRY[prefix4]) {
    return MSISDN_PREFIX_TO_COUNTRY[prefix4];
  }

  return null;
}

/**
 * Get available MMO providers for a given ISO country code.
 */
export function getProvidersForCountry(countryCode: string) {
  return COUNTRY_PROVIDERS[countryCode] ?? null;
}

/**
 * Get the country name for display purposes.
 */
export function getCountryName(countryCode: string): string {
  const names: Record<string, string> = {
    BEN: "Benin",
    BFA: "Burkina Faso",
    CMR: "Cameroon",
    CIV: "Côte d'Ivoire",
    COD: "DRC",
    ETH: "Ethiopia",
    GAB: "Gabon",
    GHA: "Ghana",
    GIN: "Guinea",
    KEN: "Kenya",
    LBR: "Liberia",
    MDG: "Madagascar",
    MWI: "Malawi",
    MLI: "Mali",
    MRT: "Mauritania",
    MUS: "Mauritius",
    MOZ: "Mozambique",
    NGA: "Nigeria",
    RWA: "Rwanda",
    SEN: "Senegal",
    SLE: "Sierra Leone",
    SOM: "Somalia",
    TZA: "Tanzania",
    TGO: "Togo",
    UGA: "Uganda",
    ZMB: "Zambia",
    ZWE: "Zimbabwe",
  };
  return names[countryCode] ?? countryCode;
}

/* ─── PawaPay API client ───────────────────────────────── */

const PAWAPAY_API_BASE = "https://api.pawapay.io/v2";

/**
 * Fetch active configuration from PawaPay to get available providers.
 * Falls back to static mapping on failure.
 */
export async function fetchActiveProviders(): Promise<
  Record<string, { value: string; label: string; currency: string }[]>
> {
  try {
    const response = await fetch(`${PAWAPAY_API_BASE}/active-conf`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.warn(
        `PawaPay API returned ${response.status}, using static fallback`,
      );
      return COUNTRY_PROVIDERS;
    }

    const config = await response.json();
    // Transform PawaPay response into our format
    const providers: Record<string, any[]> = {};
    const entries = Array.isArray(config) ? config : (config?.data ?? []);

    for (const entry of entries) {
      const country = entry.country;
      if (!country) continue;
      if (!providers[country]) providers[country] = [];
      providers[country].push({
        value: entry.provider,
        label: entry.displayName ?? entry.provider,
        currency: entry.currency ?? "XOF",
      });
    }

    return Object.keys(providers).length > 0 ? providers : COUNTRY_PROVIDERS;
  } catch (err) {
    console.warn(
      "Failed to fetch PawaPay providers, using static fallback",
      err,
    );
    return COUNTRY_PROVIDERS;
  }
}

/**
 * Get all providers available for a given MSISDN (phone number).
 * Fetches from PawaPay API on first call, falls back to static mapping.
 */
let cachedProviders: Record<string, any[]> | null = null;

export async function getProvidersForMsisdn(msisdn: string) {
  if (!cachedProviders) {
    cachedProviders = await fetchActiveProviders();
  }

  const country = detectCountryFromMsisdn(msisdn);
  if (!country) return null;

  const providers = cachedProviders[country];
  if (!providers || providers.length === 0) return null;

  return {
    country,
    countryName: getCountryName(country),
    providers,
  };
}

/**
 * Reset the provider cache (e.g., on unmount or when a retry is needed).
 */
export function resetProviderCache() {
  cachedProviders = null;
}
