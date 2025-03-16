import { useEffect,  useState } from "react";
import { useStore } from "./zustand/state";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoWaterOutline } from "react-icons/io5";
import { GiWindsock } from "react-icons/gi";
import Loading from "./components/Loading";
import Modal from "./components/Modal";
import useGetAddress from "./util/GetAddress";
import useGetXY from "./util/GetXY";
import GetNowWeather from "./util/GetNowWeather";
import GetTodayWeather from "./util/GetTodayWeather";
import GetNowSchoolWeather from "./util/GetNowSchoolWeather";
import GetTodaySchoolWeather from "./util/GetTodaySchoolWeather";
import RecommendClothes from "./util/RecommendClothes";
import CalculateSummerFeelTemperature from "./util/CalculateSummerFeelTemperature";
import CalculateWinterFeelTemperature from "./util/CalculateWinterFeelTemperature";
import GetMicroDust from "./components/GetMicroDust";
import GetKakaoMap from "./util/GetKakaoMap";
import dayjs from "dayjs";

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
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);



  const school = "송도1동";
  const schoolLocation = { latitude: 37.376786, longitude: 126.634701 };

  useEffect(() => {
    if (active === "school") {
      setLocation(schoolLocation);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error("위치 정보를 가져올 수 없습니다:", error)
      );
    }
  }, [active]);

  useEffect(() => {
    if (!location) return;
    setLoading(true);

    const fetchData = async () => {
      await Promise.all([
        useGetAddress(location, setAddress),
        useGetXY(address, setXY),
      ]);
    };
    fetchData();
  }, [location]);

  useEffect(() => {
    if (!xy || xy.x === 0 || xy.y === 0) return;
    setLoading(true);

    const fetchWeather = async () => {
      if (active === "now") {
        await Promise.all([
          GetNowWeather(date, xy, setNowWeather, editedTime),
          GetTodayWeather(date, xy, setTodayWeather),
        ]);
      } else {
        await Promise.all([
          GetNowSchoolWeather(date, setNowWeather, editedTime),
          GetTodaySchoolWeather(date, setTodayWeather),
        ]);
      }
      setLoading(false);
    };
    fetchWeather();
  }, [xy, active]);

  useEffect(() => {
    if (!todayWeather) return;
    RecommendClothes(todayWeather, setClothes);
  }, [todayWeather]);

  const [feelTemperature, setFeelTemperature] = useState<number>();
  useEffect(() => {
    if (!nowWeather) return;
    const month = Number(dayjs().format("MM"));
    setFeelTemperature(
      month <= 9 || month >= 5
        ? CalculateSummerFeelTemperature(
            nowWeather.temperature,
            nowWeather.wind
          )
        : CalculateWinterFeelTemperature(
            nowWeather.temperature,
            nowWeather.humidity
          )
    );
  }, [nowWeather]);

  return (
    <>
      <div className="relative w-full h-full pb-16 flex flex-col items-center justify-center text-center text-white  bg-gradient-to-b from-[#62c1e5] to-[#20a7db] overflow-x-hidden min-h-[45rem]">
        {loading ? <Loading /> : null}
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
        {!loading ? (
          <div className="max-w-xs mt-14 w-full flex flex-row gap-3 justify-between">
            <button
              className={`border rounded-lg p-2 shadow-md w-1/2 ${
                active == "now" ? "bg-[#1a81a9] border-none" : "border-white"
              }`}
              onClick={() => {
                if (active === "school") {
                  setActive("now");
                  setLoading(true);
                }
              }}
            >
              현재 지역 날씨
            </button>

            <button
              className={`border rounded-lg p-2 shadow-md w-1/2 ${
                active != "now" ? "bg-[#1a81a9] border-none" : "border-white"
              }`}
              onClick={() => {
                if (active === "now") {
                  setActive("school");
                  setLoading(true);
                }
              }}
            >
              현재 학교 날씨
            </button>
          </div>
        ) : null}
        <footer className="text-xs text-blue-300 mt-8">
          <p>출처: 기상청 | 한국환경공단 | 카카오 API</p>
          <a href="https://open.kakao.com/o/sEt8gDlh">
            문의: https://open.kakao.com/o/sEt8gDlh
          </a>
        </footer>
      </div>
    </>
  );
}

export default App;
