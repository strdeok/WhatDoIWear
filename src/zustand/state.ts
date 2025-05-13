import dayjs from "dayjs";
import { create } from "zustand";

export const useStore = create((set, get) => ({
  date: dayjs().format("YYYYMMDD"),
  hour: Number(dayjs().format("HH")),
  minute: Number(dayjs().format("mm")),

  location: null,
  setActive: (newActive: string) => set(() => ({ active: newActive })),

  address: { depth_1: null, depth_2: null, depth_3: null },
  setAddress: (newAddress: {
    depth_1: string;
    depth_2: string;
    depth_3: string;
  }) => set(() => ({ address: { ...newAddress } })),

  xy: {
    x: null,
    y: null,
  },
  setXY: (newXY: { x: number; y: number }) => set(() => ({ xy: { ...newXY } })),

  fetchLocation: async () => {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      set({ location });
    } catch (error) {}
  },

  kakaoXY: {
    x: null,
    y: null,
  },

  setKakaoXY: (newKakaoXY: { x: number; y: number }) =>
    set(() => ({ kakaoXY: { ...newKakaoXY } })),

  editedTime: () => {
    const { hour, minute }: any = get();
    if (minute < 10) {
      const editedMinute = 30 + minute;
      let editedHour = hour - 1;
      if (editedHour <= 10) {
        editedHour = Number("0" + editedHour.toString());
      }
      return editedHour.toString() + editedMinute.toString();
    } else {
      return dayjs().format("HHmm");
    }
  },

  tmXY: {
    tmX: null,
    tmY: null,
  },
  setTmXY: (newTmXY: { tmX: string; tmY: string }) =>
    set(() => ({
      tmXY: { ...newTmXY },
    })),

  highestTemp: 0,
  setHighestTemp: (newHighestTemp: string) =>
    set(() => ({
      highestTemp: newHighestTemp,
    })),
}));
