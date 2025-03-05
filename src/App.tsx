import { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";
import dayjs from "dayjs";

interface LocationData {
  depth_1: string;
  depth_2: string;
  depth_3: string;
}

interface ApiForm {
  category: string;
}

function App() {
  // 위도 경도 설정
  const locationRef = useRef({ latitude: 0, longitude: 0 });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      locationRef.current.latitude = position.coords.latitude;
      locationRef.current.longitude = position.coords.longitude;

      // 위치가 업데이트 될 때마다 주소를 갱신
      getAddress();
    });
  }, []);

  // 주소로 받기

  const [address, setAddress] = useState({
    depth_1: "",
    depth_2: "",
    depth_3: "",
  });

  const KakaoKey = import.meta.env.VITE_KAKAO_KEY;
  const getAddress = async () => {
    await axios
      .get(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${locationRef.current.longitude}&y=${locationRef.current.latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${KakaoKey}`,
            "Content-Type": "content-type: application/json;charset=UTF-8",
          },
        }
      )
      .then((res) => {
        const data = res.data.documents[1];
        const saveData = {
          depth_1: data.region_1depth_name,
          depth_2: data.region_2depth_name,
          depth_3: data.region_3depth_name,
        };
        setAddress(saveData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // x, y 주소 받기
  const [xy, setXY] = useState({
    x: 0,
    y: 0,
  });

  const getXY = async () => {
    await axios
      .get("/location.json")
      .then((res) => {
        const locationData = res.data.data;

        // Step 1: depth_3이 일치하는 항목 필터링
        let filtered = locationData.filter(
          (element: LocationData) => element.depth_3 === address.depth_3
        );

        // Step 2: depth_2가 일치하는 항목이 있으면 필터링
        if (filtered.length > 1) {
          const filteredByDepth2 = filtered.filter(
            (element: LocationData) => element.depth_2 === address.depth_2
          );
          if (filteredByDepth2.length > 0) {
            filtered = filteredByDepth2;
          }
        }

        // Step 3: depth_1까지 일치하는 항목이 있으면 필터링
        if (filtered.length > 1) {
          const filteredByDepth1 = filtered.filter(
            (element: LocationData) => element.depth_1 === address.depth_1
          );
          if (filteredByDepth1.length > 0) {
            filtered = filteredByDepth1;
          }
        }

        // 가장 최적의 결과 출력
        if (filtered.length > 0) {
          const getXY_value = { x: filtered[0].X, y: filtered[0].Y };
          setXY(getXY_value);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 공동데이터 요청
  const [nowWeather, setNowWeather] = useState({
    temperature: "",
    humidity: "",
    wind: "",
  });
  const date = dayjs().format("YYYYMMDD");
  const time = dayjs().format("HHmm");
  const getNowWeather = () => {
    axios
      .get(
        `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&numOfRows=10&pageNo=1&dataType=JSON&base_date=${date}&base_time=${time}&nx=${
          xy.x
        }&ny=${xy.y}`
      )
      .then((res) => {
        const data = res.data.response.body.items.item;
        const temperature = `${
          data.find((item: ApiForm) => item.category == "T1H").obsrValue
        }`;
        const humidity = `${
          data.find((item: ApiForm) => item.category == "REH").obsrValue
        }`;
        const wind = `${
          data.find((item: ApiForm) => item.category == "WSD").obsrValue
        }`;
        const nowWeather = {
          temperature,
          humidity,
          wind,
        };
        setNowWeather(nowWeather);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [todayWeather, setTodayWeather] = useState({
    highestTemp: "",
    lowestTemp: "",
    todayWind: "",
  });

  const getTodayWeather = () => {
    axios
      .get(
        `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst
?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&numOfRows=200&pageNo=1&dataType=JSON
&base_date=${date}&base_time=0200&nx=${xy.x}&ny=${xy.y}
`
      )
      .then((res) => {
        const data = res.data.response.body.items.item;
        const highestTemp = `${
          data.find((item: ApiForm) => item.category == "TMX").fcstValue
        }`;

        const lowestTemp = `${
          data.find((item: ApiForm) => item.category == "TMN").fcstValue
        }`;

        const todayWind = `${
          data.find((item: ApiForm) => item.category == "WSD").fcstValue
        }`;
        setTodayWeather({
          highestTemp,
          lowestTemp,
          todayWind,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 옷차림 추천하기
  const [clothes, setClothes] = useState([]);

  const recommendClothes = () => {
    axios.get("/clothes.json").then((res) => {
      const data = res.data.data;
      console.log(nowWeather.temperature);
      for (var i = 0; i < data.length - 1; i++) {
        // 마지막 요소는 i + 1이 존재하지 않도록 -1까지 반복
        if (
          nowWeather.temperature < data[i].temperature &&
          nowWeather.temperature >= data[i + 1].temperature
        ) {
          setClothes(data[i].clothes);
        }
      }

      if (nowWeather.temperature > data[0].temperature) {
        setClothes(data[0].clothes);
      } else if (nowWeather.temperature < data[data.length - 1].temperature) {
        setClothes(data[data.length - 1].clothes);
      }
    });
  };

  useEffect(() => {
    getXY();
  }, [address]);

  useEffect(() => {
    getNowWeather();
    getTodayWeather();
  }, [xy]);

  useEffect(() => {
    recommendClothes();
  }, [nowWeather]);

  return (
    <>
      <p>현재 온도 {nowWeather.temperature}℃</p>
      <p>현재 습도 {nowWeather.humidity}%</p>
      <p>현재 바람 {nowWeather.wind}m/s</p>
      {clothes.map((element) => {
        return <div>{element} </div>;
      })}
      <p>오늘 최고 기온 {todayWeather.highestTemp}</p>
      <p>오늘 최저 기온 {todayWeather.lowestTemp}</p>
      <p>오늘 바람 {todayWeather.todayWind}</p>
    </>
  );
}

export default App;
