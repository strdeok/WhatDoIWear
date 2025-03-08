import dayjs from "dayjs";
import { create } from "zustand";

export const useStore = create((set, get) => ({
  date: dayjs().format("YYYYMMDD"),
  hour: Number(dayjs().format("HH")),
  minute: Number(dayjs().format("mm")),

  address: {},
  setAddress: (newAddress: object) =>
    set(() => ({ address: { ...newAddress } })),

  xy: {
    x: 0,
    y: 0,
  },
  setXY: (newXY: { x: number; y: number }) => set(() => ({ xy: { ...newXY } })),

  nowWeather: {
    temperature: "",
    humidity: "",
    wind: "",
  },
  setNowWeather: (newNowWeather: {
    temperature: string;
    humidity: string;
    wind: string;
  }) => set(() => ({ nowWeather: { ...newNowWeather } })),

  todayWeather: {
    highestTemp: "",
    lowestTemp: "",
    todayWind: "",
  },
  setTodayWeather: (newTodayWeather: {
    highestTemp: string;
    lowestTemp: string;
    todayWind: string;
  }) =>
    set(() => ({
      todayWeather: { ...newTodayWeather },
    })),

  clothes: [],
  setClothes: (newClothes: string[]) =>
    set(() => ({ clothes: [...newClothes] })),

  editedTime: () => {
    const { hour, minute }: any = get();
    if (minute < 10) {
      const editedMinute = 30 + minute;
      const editedHour = hour - 1;
      return editedHour.toString() + editedMinute.toString();
    } else {
      return dayjs().format("HHmm");
    }
  },
}));
