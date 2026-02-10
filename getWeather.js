import meteoWeather from "./meteo-weather/index.js";

async function getWeather() {
  const options = {
    lang: "en",
    city: "s0000635",
    province: "QC",
    subdir: "00",
  };
  const response = await meteoWeather(options);
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
