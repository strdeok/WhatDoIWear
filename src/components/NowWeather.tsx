import { useEffect, useState } from "react";
import { useStore } from "../zustand/state";
import { WiHumidity } from "@react-icons/all-files/wi/WiHumidity";
import { WiStrongWind } from "@react-icons/all-files/wi/WiStrongWind";
import GetNowWeather from "../util/GetNowWeather";
import dayjs from "dayjs";
import CalculateSummerFeelTemperature from "../util/CalculateSummerFeelTemperature";
import CalculateWinterFeelTemperature from "../util/CalculateWinterFeelTemperature";

interface NowWeather {
  temperature: string;
  humidity: string;
  wind: string;
  rain: string;
  rainType: string;
}

export default function NowWeather() {
  const { active, date, xy, editedTime }: any = useStore();
  const [feelsLikeTemperature, setFeelsLikeTemperature] = useState(0);
  const [nowWeather, setNowWeather] = useState<NowWeather>({
    temperature: "",
    humidity: "",
    wind: "",
    rain: "",
    rainType: "",
  });

  useEffect(() => {
    const fetchWeather = async () => {
      if (xy.x === null && xy.y === null) return;

      const nowWeatherData = (await GetNowWeather(
        date,
        xy,
        editedTime
      )) as NowWeather;

      setNowWeather(nowWeatherData);
    };

    fetchWeather();
  }, [active, xy]);

  useEffect(() => {
    const month = Number(dayjs().format("MM"));

    const feelsLike =
      month <= 9 && month >= 5
        ? CalculateSummerFeelTemperature(
            nowWeather.temperature,
            nowWeather.humidity
          )
        : CalculateWinterFeelTemperature(
            nowWeather.temperature,
            nowWeather.wind
          );
    setFeelsLikeTemperature(feelsLike);
  }, [nowWeather]);

  return (
    <>
      <div className="text-xl font-semibold">지금 날씨</div>
      <p className="text-2xl">{nowWeather.temperature}℃</p>
      <br />

      <p className="text-sm">체감온도: {feelsLikeTemperature}℃</p>
      <br />

      <table className="flex flex-col gap-1 w-20">
        <td className="flex items-center justify-between">
          <WiHumidity className="text-xl" />
          {nowWeather.humidity}%
        </td>
        <td className="flex items-center justify-between">
          <WiStrongWind className="text-xl" />
          {nowWeather.wind}m/s
        </td>
        <td className="flex items-center justify-between">
          {nowWeather.rain === "0" ? (
            <>{nowWeather.rainType}</>
          ) : (
            <>
              {nowWeather.rainType}
              {nowWeather.rain}mm
            </>
          )}
        </td>
      </table>
    </>
  );
}
