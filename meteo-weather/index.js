import { parse } from "./parse.js";
import { transform } from "./transform.js";
import fetch from "node-fetch";

/**
 * Retrieve forecast for specified city / language and return parsed result.
 * @param {object} options - two optional parameters:
 *      lang {string} - either 'en' or 'fr'.  Default 'en'.
 *      city {string} - 5 character Environment Canada city code.  Default 'nb-23' (St. John, NB)
 * @return {promise} Javascript object containing the parsed city weather forecast.
 */

export default async function meteoWeather(options = {}) {
  // default options
  const city = options.city || "nb-23";
  const lang = options.lang || "en";

  // get the raw XML from the RSS feed
  const url = `https://weather.gc.ca/rss/city/${city.toLowerCase()}_${lang
    .slice(0, 1)
    .toLowerCase()}.xml`;

  try {
    const res = await fetch(url);

    // convert to text
    const text = await res.text();

    const parsed = await parse(text)

    // apply transformations
    const data = transform(lang, city, parsed);

    // return result
    return data;
  } catch (error) {
    throw new Error(`Error processing ${url}. ${error}`);
  }
}
