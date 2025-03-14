import { useEffect, useState } from "react";
import { useStore } from "./zustand/state";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoWaterOutline } from "react-icons/io5";
import { GiWindsock } from "react-icons/gi";
import useGetAddress from "./util/GetAddress";
import useGetXY from "./util/GetXY";
import GetNowWeather from "./util/GetNowWeather";
import GetTodayWeather from "./util/GetTodayWeather";
import GetNowSchoolWeather from "./util/GetNowSchoolWeather";
import GetTodaySchoolWeather from "./util/GetTodaySchoolWeather";
import RecommendClothes from "./util/RecommendClothes";
import Modal from "./components/Modal";
import CalculateSummerFeelTemperature from "./util/CalculateSummerFeelTemperature";
import CalculateWinterFeelTemperature from "./util/CalculateWinterFeelTemperature";
import dayjs from "dayjs";
import GetMicroDust from "./util/GetMicroDust";
import GetKakaoMap from "./util/GetKakaoMap";

function App() {
  const {
    address,
    setAddress,
    xy,
    setXY,
    nowWeather,
    setNowWeather,
    date,
    todayWeather,
    setTodayWeather,
    clothes,
    setClothes,
    editedTime,
  }: any = useStore(); // zustand 변수

  // react 훅
  const [activeModal, setActiveModal] = useState(false);
  const [active, setActive] = useState("now");
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(true);

  // 커스텀 훅
  const getAddress = useGetAddress(location, setAddress);
  const getNowWeather = GetNowWeather(date, xy, setNowWeather, editedTime);
  const getTodayWeather = GetTodayWeather(date, xy, setTodayWeather);
  const getNowSchoolWeather = GetNowSchoolWeather(
    date,
    setNowWeather,
    editedTime
  );
  const getTodaySchoolWeather = GetTodaySchoolWeather(date, setTodayWeather);
  const getXY = useGetXY(address, setXY);
  const recommendClothes = RecommendClothes(todayWeather, setClothes);

  const school = "송도1동";

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          setLoading(false);
        }
      );
    }
  }, []);

  // 위도 경도 토대로 주소 받아오기
  useEffect(() => {
    if (!loading && location.latitude !== 0 && location.longitude !== 0) {
      getAddress();
    }
  }, [location, loading]);

  // 주소를 토대로 XY값 받기기
  useEffect(() => {
    if (address && Object.keys(address).length > 0) {
      getXY();
    }
  }, [address]);

  // 현재 지역 날씨 || 현재 학교 날씨
  useEffect(() => {
    if (xy && xy.x !== 0 && xy.y !== 0) {
      if (active === "now") {
        getNowWeather();
        getTodayWeather();
      } else {
        getTodaySchoolWeather();
        getNowSchoolWeather();
      }
    }
  }, [xy, active]);

  // 옷 추천하기
  useEffect(() => {
    recommendClothes();
  }, [todayWeather, setTodayWeather]);

  // 체감온도 계산하기
  const [feelTemperature, setFeelTemperature] = useState<number>();
  useEffect(() => {
    const month = Number(dayjs().format("MM"));
    function getFeelsLike(
      temp: number,
      windSpeed: number,
      humidity: number
    ): number {
      if (month <= 9 || month >= 5)
        return CalculateSummerFeelTemperature(temp, windSpeed);
      else if (month >= 10 || month <= 4)
        return CalculateWinterFeelTemperature(temp, humidity);
      else return temp;
    }
    if (nowWeather) {
      setFeelTemperature(
        getFeelsLike(
          nowWeather.temperature,
          nowWeather.wind,
          nowWeather.humidity
        )
      );
    }
  }, [nowWeather]);

  return (
    <div className="relative w-full  pb-16 flex flex-col items-center justify-center text-center text-white  bg-gradient-to-b from-[#62c1e5] to-[#20a7db] overflow-x-hidden min-h-[45rem]">
      <main
        className="relative flex flex-col w-full max-w-xs items-center justify-center gap-8 border-2 p-10 rounded-xl shadow-2xl mt-10 
      "
      >
        <GetKakaoMap location={location} />
        <div>
          <div>{active === "now" ? address.depth_3 : school}</div>
          <div className="text-xl font-semibold">지금 날씨</div>
          <p className="text-5xl">{nowWeather.temperature}℃</p>
          <br />

          <p className="text-sm">체감온도: {feelTemperature}℃</p>
          <br />

          <div className="flex flex-col gap-1">
            <p className="flex gap-4 items-center justify-center">
              <IoWaterOutline className="text-xl" />
              {nowWeather.humidity}%
            </p>
            <p className="flex gap-4 items-center justify-center">
              <GiWindsock className="text-xl" />
              {nowWeather.wind}m/s
            </p>
            <p className="flex gap-4 items-center justify-center">
              {nowWeather.rain === "0" ? (
                <>{nowWeather.rainType}</>
              ) : (
                <>
                  {nowWeather.rainType}
                  {nowWeather.rain}mm
                </>
              )}
            </p>
          </div>
        </div>

        <div>{GetMicroDust()}</div>

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
                setActiveModal(true);
              }}
            >
              <IoIosInformationCircleOutline />
            </div>
          </div>
          {activeModal ? <Modal setActiveModal={setActiveModal} /> : null}

          {clothes.map((element: string) => {
            return <div>{element} </div>;
          })}
        </div>
      </main>
      <div className="max-w-xs mt-14 w-full flex flex-row gap-3 justify-between">
        <button
          className={`border rounded-lg p-2 shadow-md w-1/2 ${
            active == "now" ? "bg-[#1a81a9] border-none" : "border-white"
          }`}
          onClick={() => {
            setActive("now");
          }}
        >
          현재 지역 날씨
        </button>

        <button
          className={`border rounded-lg p-2 shadow-md w-1/2 ${
            active != "now" ? "bg-[#1a81a9] border-none" : "border-white"
          }`}
          onClick={() => {
            setActive("school");
          }}
        >
          현재 학교 날씨
        </button>
      </div>
      <footer className="text-xs text-blue-300 mt-8">
        <p>출처: 기상청 | 한국환경공단 | 카카오 API</p>
        <a href="https://github.com/strdeok">
          제작: https://github.com/strdeok
        </a>
      </footer>
    </div>
  );
}

export default App;
