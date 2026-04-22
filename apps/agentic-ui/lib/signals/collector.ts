export interface Persona {
  id: string;
  name: string;
  age: number;
  city: string;
  profile: string;
  pattern: string;
}

export interface SignalBundle {
  persona: Persona;
  scenario: string;
  time: string;
  weather: {
    temp: number;
    condition: string;
  };
  behavior: {
    recentOrders: number;
    searchHistory: string[];
    sessionMinutes: number;
  };
  location: string;
}

type ScenarioKey = "baseline" | "weather" | "searchAbandon";

interface PersonaScenarioData {
  time: string;
  location: string;
  behavior: { recentOrders: number; searchHistory: string[]; sessionMinutes: number };
}

const PERSONAS: Record<string, Persona> = {
  minh: {
    id: "minh", name: "Minh", age: 28, city: "HCM",
    profile: "Office worker, Quận 1",
    pattern: "Thích đồ cay (bún bò Huế, mì cay), ăn trưa văn phòng, 5 đơn/tuần, AOV 65k, đặt lúc 11-12h",
  },
  lan: {
    id: "lan", name: "Lan", age: 35, city: "Hà Nội",
    profile: "Mẹ đơn thân, 2 con nhỏ, Cầu Giấy",
    pattern: "Ưu tiên món lành mạnh và phù hợp trẻ em, đặt theo nhóm 3 người, AOV 180k, hay tìm combo tiết kiệm",
  },
  tuan: {
    id: "tuan", name: "Tuấn", age: 22, city: "Đà Nẵng",
    profile: "Sinh viên, ký túc xá",
    pattern: "Thích gà rán, trà sữa, pizza - ăn khuya sau 22h, AOV 35k, luôn tìm freeship và mã giảm giá",
  },
  an: {
    id: "an", name: "An", age: 40, city: "HCM",
    profile: "Gia đình 4 người, Quận 7",
    pattern: "Thích hải sản và lẩu cao cấp, đặt bữa tối cuối tuần, AOV 350k, ưu tiên chất lượng hơn giá",
  },
};

// Shared weather per scenario — same real-world event, different persona context
const SCENARIO_WEATHER: Record<ScenarioKey, { temp: number; condition: string }> = {
  baseline: { temp: 32, condition: "nắng" },
  weather:  { temp: 16, condition: "lạnh" },
  searchAbandon: { temp: 28, condition: "mưa" },
};

// Each persona × scenario produces unique time, location, and behavioral signals
const PERSONA_SCENARIOS: Record<string, Record<ScenarioKey, PersonaScenarioData>> = {
  minh: {
    baseline: {
      time: "11:45",
      location: "văn phòng Quận 1, HCM",
      behavior: { recentOrders: 4, searchHistory: ["cơm trưa", "bún bò Huế", "mì cay"], sessionMinutes: 4 },
    },
    weather: {
      time: "19:30",
      location: "nhà Bình Thạnh, HCM",
      behavior: { recentOrders: 1, searchHistory: ["cháo nóng", "súp bò"], sessionMinutes: 3 },
    },
    searchAbandon: {
      time: "22:15",
      location: "nhà Bình Thạnh, HCM",
      behavior: { recentOrders: 0, searchHistory: ["mì cay", "bún bò", "lẩu cay"], sessionMinutes: 14 },
    },
  },
  lan: {
    baseline: {
      time: "18:30",
      location: "nhà Cầu Giấy, Hà Nội",
      behavior: { recentOrders: 3, searchHistory: ["cháo gà", "cơm gia đình", "rau củ hầm"], sessionMinutes: 6 },
    },
    weather: {
      time: "12:00",
      location: "nhà Cầu Giấy, Hà Nội",
      behavior: { recentOrders: 0, searchHistory: ["cháo nóng", "súp gà cho bé"], sessionMinutes: 5 },
    },
    searchAbandon: {
      time: "21:00",
      location: "nhà Cầu Giấy, Hà Nội",
      behavior: { recentOrders: 1, searchHistory: ["cơm cho bé", "cháo", "phở ít dầu"], sessionMinutes: 18 },
    },
  },
  tuan: {
    baseline: {
      time: "22:45",
      location: "ký túc xá Đại học Đà Nẵng",
      behavior: { recentOrders: 1, searchHistory: ["gà rán", "trà sữa", "pizza"], sessionMinutes: 7 },
    },
    weather: {
      time: "14:30",
      location: "phòng trọ Đà Nẵng",
      behavior: { recentOrders: 0, searchHistory: ["mì gói", "pizza", "gà rán giá rẻ"], sessionMinutes: 4 },
    },
    searchAbandon: {
      time: "23:30",
      location: "ký túc xá Đại học Đà Nẵng",
      behavior: { recentOrders: 0, searchHistory: ["bánh mì", "gà rán", "trà sữa freeship"], sessionMinutes: 22 },
    },
  },
  an: {
    baseline: {
      time: "19:00",
      location: "nhà Quận 7, HCM",
      behavior: { recentOrders: 6, searchHistory: ["lẩu hải sản", "cơm gia đình", "gà hấp"], sessionMinutes: 5 },
    },
    weather: {
      time: "18:00",
      location: "nhà Quận 7, HCM",
      behavior: { recentOrders: 2, searchHistory: ["lẩu nóng", "cháo hải sản", "súp bào ngư"], sessionMinutes: 3 },
    },
    searchAbandon: {
      time: "20:30",
      location: "nhà Quận 7, HCM",
      behavior: { recentOrders: 2, searchHistory: ["lẩu Thái", "cơm niêu", "gà hấp muối"], sessionMinutes: 11 },
    },
  },
};

export function buildSignalBundle(personaId: string, scenario: string): SignalBundle {
  const persona = PERSONAS[personaId] ?? PERSONAS.minh;
  const scenarioKey = (["baseline", "weather", "searchAbandon"].includes(scenario) ? scenario : "baseline") as ScenarioKey;
  const personaData = (PERSONA_SCENARIOS[personaId] ?? PERSONA_SCENARIOS.minh)[scenarioKey];
  const weather = SCENARIO_WEATHER[scenarioKey];

  return {
    persona,
    scenario,
    time: personaData.time,
    weather,
    behavior: personaData.behavior,
    location: personaData.location,
  };
}
