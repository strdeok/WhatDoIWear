import { useEffect, useRef, useState } from "react";
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
  const locationRef = useRef({ latitude: 0, longitude: 0 });

  // 커스텀 훅
  const getAddress = useGetAddress(locationRef, setAddress);
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

  const school = "송도 1동";

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      locationRef.current.latitude = position.coords.latitude;
      locationRef.current.longitude = position.coords.longitude;
      // 위치가 업데이트 될 때마다 주소를 갱신
      getAddress();
    });
  }, []);

  useEffect(() => {
    getXY();
  }, [address]);

  useEffect(() => {
    if (active === "now") {
      getNowWeather();
      getTodayWeather();
    } else {
      getTodaySchoolWeather();
      getNowSchoolWeather();
    }
  }, [xy, active]);

  useEffect(() => {
    recommendClothes();
  }, [todayWeather, setTodayWeather]);

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
      <div className="absolute bottom-5 flex flex-row gap-3">
        <button
          className={`border border-white rounded-lg p-2 shadow-md ${
            active == "now" ? "bg-[#4D869C]" : null
          }`}
          onClick={() => {
            setActive("now");
          }}
        >
          현재 지역 날씨
        </button>

        <button
          className={`border border-white rounded-lg p-2 shadow-md ${
            active != "now" ? "bg-[#4D869C]" : null
          }`}
          onClick={() => {
            setActive("school");
          }}
        >
          현재 학교 날씨
        </button>
      </div>
    </div>
  );
}

export default App;
