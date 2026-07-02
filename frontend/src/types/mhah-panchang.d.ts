declare module 'mhah-panchang' {
  interface Named {
    name: string;
    name_en_IN?: string;
    name_en_UK?: string;
    ino: number;
  }
  interface Timed extends Named {
    start: string;
    end: string;
  }
  interface Masa extends Named {
    isLeapMonth?: boolean;
  }
  export interface Calendar {
    Tithi: Named;
    Paksha: Named;
    Nakshatra: Named;
    Yoga: Named;
    Karna: Named;
    Masa: Masa;
    MoonMasa: Masa;
    Raasi: Named;
    Ritu: Named;
    Gana: Named;
    Guna: Named;
    Trinity: Named;
  }
  export interface Calculate extends Omit<Calendar, 'Tithi' | 'Nakshatra' | 'Karna' | 'Yoga'> {
    Day: Named;
    Tithi: Timed;
    Nakshatra: Timed;
    Karna: Timed;
    Yoga: Timed;
  }
  export interface SunTimes {
    solarNoon: string;
    nadir: string;
    sunRise: string;
    sunSet: string;
    sunRiseEnd: string;
    sunSetStart: string;
    dawn: string;
    dusk: string;
    nauticalDawn: string;
    nauticalDusk: string;
    nightEnd: string;
    night: string;
  }
  export class MhahPanchang {
    calendar(date: Date, lat: number, lng: number): Calendar;
    calculate(date: Date, lat: number, lng: number): Calculate;
    sunTimer(date: Date, lat: number, lng: number): SunTimes;
  }
}
