// https://weather.gc.ca/rss/city/qc-147_e.xml
// https://weather.gc.ca/city/pages/qc-147_metric_e.html

const fetch = require("node-fetch");

const city = "qc-147";
const lang = "e";
const url = `https://weather.gc.ca/rss/city/${city}_${lang}.xml`;

async function getWeather() {
  const response = await fetch(url);
  const xml = await response.text();
  const warning = xml.split('<summary type="html">')[1].split("</summary>")[0];
  const observed = xml
    .split("[CDATA[")[1]
    .split("]]")[0]
    .replace(/<b>/g, "")
    .replace(/<\/b>/g, "")
    .replace(/<br\/>/g, "")
    .replace(/&deg;C/g, "")
    .replace(/km\/h/g, "")
    .replace(/km/g, "")
    .replace(/kPa/g, "")
    .replace(/%/g, "")
    .replace(/\/ Tendency/g, "")
    .trim()
    .split(/\n/)
    .map((entry) => entry.trim().toLowerCase());
  const [_, ...tail] = observed;
  const entries = tail.map((entry) => entry.split(":"));
  const current = entries.reduce((acc, curr) => {
    const [key, val] = curr;
    return Object.assign(acc, { [key.trim()]: val.trim() });
  }, {});
  const condition = current.condition;
  const rain = current.condition.split(" ").includes("rain") ? true : false;
  const snow = current.condition.split(" ").includes("snow") ? true : false;
  const temp = current.temperature;
  const pressure = current.pressure
    .split(" ")
    .map((val) => parseFloat(val))
    .filter((val) => !isNaN(val))[0]
    .toFixed(1);
  const isFalling = current.pressure.split(" ").includes("falling");
  const isRising = current.pressure.split(" ").includes("rising");
  const humidity = current.humidity;
  const windchill = temp < 0 ? current.windchill : temp;
  const wind = current.wind
    .split(" ")
    .map((val) => parseInt(val))
    .filter((val) => !isNaN(val))[0]
    .toString();
  const summary = {
    warning,
    condition,
    snow,
    rain,
    temp,
    pressure,
    isFalling,
    isRising,
    humidity,
    windchill,
    wind,
  };
  return summary;
}

async function main() {
  const weather = await getWeather();
  console.log(weather);
}

main().catch((error) => console.error(error));
