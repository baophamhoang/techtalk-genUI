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

export function buildSignalBundle(personaId: string, scenario: string): SignalBundle {
  const personas: Record<string, Persona> = {
    minh: { id: "minh", name: "Minh", age: 28, city: "HCM", profile: "Office worker", pattern: "Healthy-leaning, 5 orders/week, office-lunch, AOV 60k" },
    lan: { id: "lan", name: "Lan", age: 35, city: "Hanoi", profile: "Single mother, 2 kids", pattern: "Group orders of 3, weekend-heavy, AOV 180k, budget-conscious" },
    tuan: { id: "tuan", name: "Tuấn", age: 22, city: "Da Nang", profile: "Student", pattern: "Late-night (>22:00), AOV 35k, fast/cheap food, freeship chaser" },
    an: { id: "an", name: "An", age: 40, city: "HCM", profile: "Family of 4", pattern: "Premium spender, AOV 300k, weekend dinner + holidays, quality-focused" },
  };

  const scenarioData: Record<string, { time: string; weather: { temp: number; condition: string }; behavior: { recentOrders: number; searchHistory: string[]; sessionMinutes: number }; location: string }> = {
    baseline: {
      time: "10:00",
      weather: { temp: 32, condition: "sunny" },
      behavior: { recentOrders: 2, searchHistory: [], sessionMinutes: 5 },
      location: "home",
    },
    weather: {
      time: "14:00",
      weather: { temp: 22, condition: "cold" },
      behavior: { recentOrders: 0, searchHistory: [], sessionMinutes: 2 },
      location: "home",
    },
    searchAbandon: {
      time: "22:30",
      weather: { temp: 28, condition: "rainy" },
      behavior: { recentOrders: 1, searchHistory: ["phở", "bún", "mì"], sessionMinutes: 8 },
      location: "home",
    },
  };

  const data = scenarioData[scenario] ?? scenarioData.baseline;
  return {
    persona: personas[personaId] ?? personas.minh,
    scenario,
    ...data,
  };
}