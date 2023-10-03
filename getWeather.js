// https://weather.gc.ca/rss/city/qc-147_e.xml
// https://weather.gc.ca/city/pages/qc-147_metric_e.html
// const city = "qc-147";
// const lang = "e";
// const url = `https://weather.gc.ca/rss/city/${city}_${lang}.xml`;

/*
{
  type: "Current Conditions",
  condition: "Partly Cloudy",
  temperature: "18.4°C",
  pressureTendency: "102.0 kPa falling",
  humidity: "61 %",
}
*/

const ecweather = require("ec-weather");

async function getWeather() {
  const options = {
    lang: "en",
    city: "qc-147",
  };
  const response = await ecweather(options);
  const current = response.entries.filter(
    (entry) => entry.type === "Current Conditions"
  )[0];
  const temp = current.temperature.replace("°C", "");
  const rain = current.condition.toLowerCase().includes("rain") ? true : false;

  return {
    rain,
    temp: parseFloat(temp),
  };
}

async function main() {
  const weather = await getWeather();
  console.log(weather);
}

main().catch((error) => console.error(error));
