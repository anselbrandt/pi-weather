/**
 * Transform the parsed Environment Canada citypage XML into a
 * structured object.
 *
 * @param {String} lang - 'en' or 'fr'
 * @param {String} city - city code e.g. 's0000635'
 * @param {object} data - the parsed siteData XML object
 * @return {Object} Transformed weather data
 */
export function transform(lang, city, data) {
  const site = data.siteData;
  const cc = site.currentConditions;

  const condition = cc.condition || "";
  const tempValue = typeof cc.temperature === "object" ? cc.temperature._ : cc.temperature;
  const tempUnits = typeof cc.temperature === "object" ? cc.temperature.units : "C";
  const temperature = `${tempValue}°${tempUnits}`;

  const entries = [
    {
      type: "Current Conditions",
      condition,
      temperature,
    },
  ];

  // Add forecasts if available
  if (site.forecastGroup && site.forecastGroup.forecast) {
    const forecasts = Array.isArray(site.forecastGroup.forecast)
      ? site.forecastGroup.forecast
      : [site.forecastGroup.forecast];

    for (const fc of forecasts) {
      entries.push({
        type: "Weather Forecasts",
        title: fc.period
          ? fc.period.textForecastName || fc.period
          : "",
        summary: fc.textSummary || "",
      });
    }
  }

  return {
    lang,
    city,
    title: site.location
      ? site.location.name._ || site.location.name
      : "",
    entries,
  };
}
