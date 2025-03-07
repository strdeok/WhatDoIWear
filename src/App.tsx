import { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { IoWaterOutline } from "react-icons/io5";
import { GiWindsock } from "react-icons/gi";

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
  const hour = Number(dayjs().format("HH"));
  const minute = Number(dayjs().format("mm"));
  const editedTime = () => {
    if (minute < 10) {
      const editedMinute = 30 + minute;
      const editedHour = hour - 1;
      return editedHour.toString() + editedMinute.toString();
    } else return dayjs().format("HHmm");
  };

  const getNowWeather = () => {
    axios
      .get(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&numOfRows=10&pageNo=1&dataType=JSON&base_date=${date}&base_time=${editedTime()}&nx=${
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

  const getTodayWeather = async () => {
    await axios
      .get(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst
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

  const school = "송도 1동";

  const getNowSchoolWeather = () => {
    axios
      .get(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&numOfRows=10&pageNo=1&dataType=JSON&base_date=${date}&base_time=${editedTime()}&nx=54&ny=123`
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

  const getTodaySchoolWeather = async () => {
    await axios
      .get(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst
?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&numOfRows=200&pageNo=1&dataType=JSON
&base_date=${date}&base_time=0200&nx=54&ny=123
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

  const recommendClothes = async () => {
    await axios.get("/clothes.json").then((res) => {
      const data = res.data.data;
      for (var i = 0; i < data.length - 1; i++) {
        // 마지막 요소는 i + 1이 존재하지 않도록 -1까지 반복
        if (
          todayWeather.highestTemp <= data[i].temperature &&
          todayWeather.highestTemp > data[i + 1].temperature
        ) {
          setClothes(data[i].clothes);
        }
      }

      if (todayWeather.highestTemp > data[0].temperature) {
        setClothes(data[0].clothes);
      } else if (
        todayWeather.highestTemp < data[data.length - 1].temperature &&
        todayWeather.highestTemp.length > 1
      ) {
        setClothes(data[data.length - 1].clothes);
      }
    });
  };

  // 주의 모달 띄우기
  const [activeModal, setActivevModal] = useState(false);

  const Modal = () => {
    return (
      <div className="absolute bg-white text-black border border-black rounded-xl p-3 left-0">
        <p
          className="float-right"
          onClick={() => {
            setActivevModal(false);
          }}
        >
          <IoMdClose />
        </p>
        <div className="float-end">
          <p>옷차림은 02시에 발표된 오늘의 최고 기온을 기준으로 합니다.</p>
          <p>예보는 실시간으로 바뀔 수 있으니 참고자료로만 사용해주세요.</p>
        </div>
      </div>
    );
  };

  const [active, setActive] = useState("now");

  useEffect(() => {
    getXY();
  }, [address]);

  useEffect(() => {
    getNowWeather();
    getTodayWeather();
  }, [xy]);

  useEffect(() => {
    recommendClothes();
  }, [todayWeather]);

  return (
    <div className="w-full h-full flex items-center justify-center text-center text-white bg-[#7AB2B2]">
      <main className="relative flex flex-col w-2/3 items-center justify-center gap-8 border-2 p-10 rounded-xl shadow-2xl">
        <div>
          <div>{active === "now" ? address.depth_3 : school}</div>
          <div className="text-xl font-semibold">지금 날씨</div>
          <p className="text-5xl">{nowWeather.temperature}℃</p>
          <br />
          <p className="flex gap-4 items-center justify-center">
            <IoWaterOutline />
            {nowWeather.humidity}%
          </p>
          <p className="flex gap-4 items-center justify-center">
            <GiWindsock />
            {nowWeather.wind}m/s
          </p>
        </div>

        <div className="text-xs">
          <div className="text-sm">오늘 날씨</div>
          <p>
            최고 {todayWeather.highestTemp}℃ / 최저 {todayWeather.lowestTemp}℃
          </p>
        </div>

        <div>
          <div className="flex flex-row items-center">
            <div className="text-xl mr-2">추천 옷차림</div>
            <div
              onClick={() => {
                setActivevModal(true);
              }}
            >
              <IoIosInformationCircleOutline />
            </div>
          </div>
          {activeModal ? <Modal /> : null}

          {clothes.map((element) => {
            return <div>{element} </div>;
          })}
        </div>
      </main>{" "}
      <div className="absolute bottom-5 flex flex-row gap-3">
        <button
          className={`border border-white rounded-lg p-2 shadow-md bg-${
            active === "now" ? "[#4D869C]" : null
          }`}
          onClick={() => {
            setActive("now");
            getTodayWeather();
            getNowWeather();
          }}
        >
          현재 지역 날씨
        </button>

        <button
          className={`border border-white rounded-lg p-2 shadow-md bg-${
            active !== "now" ? "[#4D869C]" : null
          }`}
          onClick={() => {
            setActive("school");
            getTodaySchoolWeather();
            getNowSchoolWeather();
          }}
        >
          현재 학교 날씨
        </button>
      </div>
    </div>
  );
}

export default App;
