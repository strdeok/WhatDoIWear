import { useEffect, useState } from "react";
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
  const [feelsLikeTemperature, setFeelsLikeTemperature] = useState(0);
  const [loading, setLoading] = useState(true);

  const school = "송도1동";
  const schoolLocation = { latitude: 37.376786, longitude: 126.634701 };

  interface NowWeather {
    temperature: string;
    humidity: string;
    wind: string;
    rain: string;
    rainType: string;
  }

  interface TodayWeather {
    highestTemp: string;
    lowestTemp: string;
    todayWind: string;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ 위치 정보 가져오기
        let currentLocation = schoolLocation;

        if (active === "now") {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
        setLocation(currentLocation); // location 업데이트
      } catch (error) {
        console.error("위치 정보 가져오기 중 오류 발생:", error);
      }
    };

    fetchData();
  }, [active]); // 위치 정보만 업데이트됨

  useEffect(() => {
    if (!location) return;

    const getAddressData = new Promise((resolve, reject) => {
      useGetAddress(location)
        .then((addressData) => {
          resolve(addressData);
        })
        .catch((error) => {
          console.error("주소 데이터 가져오기 실패:", error);
          reject(error);
        });
    });

    // 3️⃣ XY 좌표 변환 (주소 데이터를 받은 후 실행)
    getAddressData
      .then((address): Promise<{ x: number; y: number }> => {
        const typedAddress = address as {
          depth_1: string;
          depth_2: string;
          depth_3: string;
        };
        console.log("주소", typedAddress);
        return useGetXY(typedAddress);
      })
      .then(
        (xy: { x: number; y: number }): Promise<[NowWeather, TodayWeather]> => {
          if (active === "now") {
            console.log("now", xy);
            return Promise.all([
              GetNowWeather(date, xy, editedTime) as Promise<NowWeather>,
              GetTodayWeather(date, xy) as Promise<TodayWeather>,
            ]);
          } else {
            console.log("school", xy);
            return Promise.all([
              GetNowSchoolWeather(date, editedTime) as Promise<NowWeather>,
              GetTodaySchoolWeather(date) as Promise<TodayWeather>,
            ]);
          }
        }
      )
      .then(([getNowWeather, getTodayWeather]) => {
        console.log("지금날씨", getNowWeather);
        setNowWeather(getNowWeather);
        setTodayWeather(getTodayWeather);

        return [getNowWeather, getTodayWeather] as [NowWeather, TodayWeather];
      })
      .then(([getNowWeather, getTodayWeather]) => {
        const month = Number(dayjs().format("MM"));
        const feelsLike =
          month <= 9 || month >= 5
            ? CalculateSummerFeelTemperature(
                getNowWeather.temperature,
                getNowWeather.humidity
              )
            : CalculateWinterFeelTemperature(
                getNowWeather.temperature,
                getNowWeather.wind
              );
        setFeelsLikeTemperature(feelsLike);
        return getTodayWeather;
      })
      .then((getTodayWeather) => {
        console.log("오늘날씨", getTodayWeather);
        return RecommendClothes(getTodayWeather);
      })
      .then((recommendClothes) => {
        console.log(recommendClothes);
        setClothes(recommendClothes);
      })
      .then(() => {
        setLoading(false);
      });
  }, [location, active]);

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

            <p className="text-sm">체감온도: {feelsLikeTemperature}℃</p>
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
