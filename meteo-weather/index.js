import { parse } from "./parse.js";
import { transform } from "./transform.js";
import fetch from "node-fetch";

const BASE_URL = "https://dd.weather.gc.ca/today/citypage_weather";

/**
 * Retrieve forecast for specified city / language and return parsed result.
 * @param {object} options
 *      lang {string} - either 'en' or 'fr'.  Default 'en'.
 *      city {string} - Environment Canada city code e.g. 's0000635' (Montréal). Default 's0000635'.
 *      province {string} - 2 letter province code e.g. 'QC'. Default 'QC'.
 *      subdir {string} - subdirectory on the data server. Default '00'.
 * @return {promise} Javascript object containing the parsed city weather forecast.
 */

export default async function meteoWeather(options = {}) {
  const province = options.province || "QC";
  const subdir = options.subdir || "00";
  const city = options.city || "s0000635";
  const lang = options.lang || "en";

  const dirUrl = `${BASE_URL}/${province}/${subdir}/`;

  try {
    // Fetch the directory listing to discover the timestamped filename
    const dirRes = await fetch(dirUrl);
    if (!dirRes.ok) {
      throw new Error(`HTTP ${dirRes.status} from ${dirUrl}`);
    }
    const dirHtml = await dirRes.text();

    // Find the file matching the city code and language
    const pattern = new RegExp(
      `href="([^"]*_MSC_CitypageWeather_${city}_${lang}\\.xml)"`,
      "i"
    );
    const match = dirHtml.match(pattern);
    if (!match) {
      throw new Error(`No file found for city ${city} (${lang}) in ${dirUrl}`);
    }

    const fileUrl = `${dirUrl}${match[1]}`;
    const res = await fetch(fileUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${fileUrl}`);
    }

    const text = await res.text();
    const parsed = await parse(text);
    const data = transform(lang, city, parsed);
    return data;
  } catch (error) {
    throw new Error(`Error processing weather for ${city}. ${error}`);
  }
}
