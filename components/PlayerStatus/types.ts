import { Ionicons } from "@expo/vector-icons";

// Wspólne typy dla komponentów w tym folderze
export interface User {
  id: number;
  userName: string;
  age?: number;
  avatar?: string;     // URL do avatara
  avatarUrl?: string;  // alternatywne pole z API profilu
  description?: string;
}

export type Creator = User;

export interface EventInfo {
  location?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}
export type RankId = 0| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface RankContext {
  completedEvents: number;
  uniqueLocations?: number;
}

export interface RankDefinition {
  id: RankId;
  title: string;
  min?: number;
  max?: number;
  requires?: (ctx: RankContext) => boolean;
  description?: string;
  icon?:
    | { type: "emoji"; value: string }
    | { type: "ion"; value: keyof typeof Ionicons.glyphMap };
}
