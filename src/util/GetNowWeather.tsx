import axios from "axios";
import { IoRainyOutline } from "react-icons/io5";
import { WiRainMix } from "react-icons/wi";
import { FiCloudSnow } from "react-icons/fi";

interface ApiForm {
  category: string;
}

export default async function GetNowWeather(
  date: string,
  xy: {
    x: number;
    y: number;
  },
  editedTime: () => string
) {
  const translateRainType = (rainType: string) => {
    switch (rainType) {
      case "0":
        return "강수없음";
      case "1":
        return <IoRainyOutline className="text-2xl" />;
      case "2 ":
        return <WiRainMix className="text-2xl" />;
      case "3":
        return <FiCloudSnow className="text-2xl" />;
      case "5":
        return <IoRainyOutline className="text-2xl" />;
      case "6":
        return <WiRainMix className="text-2xl" />;
      case "7":
        return <FiCloudSnow className="text-2xl" />;
    }
  };

  try {
    const res = await axios.get(
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${
        import.meta.env.VITE_PUBLIC_API_KEY
      }&numOfRows=10&pageNo=1&dataType=JSON&base_date=${date}&base_time=${editedTime()}&nx=${
        xy.x
      }&ny=${xy.y}`
    );

    const data = res.data.response.body.items.item;
    const temperature = `${
      data.find((item: ApiForm) => item.category === "T1H").obsrValue
    }`;
    const humidity = `${
      data.find((item: ApiForm) => item.category === "REH").obsrValue
    }`;
    const wind = `${
      data.find((item: ApiForm) => item.category === "WSD").obsrValue
    }`;
    const rain = `${
      data.find((item: ApiForm) => item.category === "RN1").obsrValue
    }`;
    const rainType = translateRainType(
      `${data.find((item: ApiForm) => item.category === "PTY").obsrValue}`
    );
    const nowWeather = {
      temperature,
      humidity,
      wind,
      rain,
      rainType,
    };
    return nowWeather;
  } catch (error) {
    return error;
  }
}
