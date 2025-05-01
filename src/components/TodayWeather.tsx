import { useEffect, useState } from "react";
import { useStore } from "../zustand/state";
import GetTodayWeather from "../util/GetTodayWeather";

interface TodayWeather {
  highestTemp: string;
  lowestTemp: string;
  todayWind: string;
}

export default function TodayWeather() {
  const { date, xy, active, setHighestTemp }: any = useStore();
  const [todayWeather, setTodayWeather] = useState<TodayWeather>({
    highestTemp: "",
    lowestTemp: "",
    todayWind: "",
  });

  useEffect(() => {
    const fetchWeather = async () => {
      if (xy.x === null && xy.y === null) return;

      const nowWeatherData = (await GetTodayWeather(date, xy)) as TodayWeather;

      setTodayWeather(nowWeatherData);
      setHighestTemp(nowWeatherData.highestTemp);
    };

    fetchWeather();
  }, [active, xy]);

  return (
    <div className="text-xs">
      <div className="text-sm">오늘 날씨</div>
      <p>
        최고 {todayWeather.highestTemp}℃ / 최저 {todayWeather.lowestTemp}℃
      </p>
    </div>
  );
}
