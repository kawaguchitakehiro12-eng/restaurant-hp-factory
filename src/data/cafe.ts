/**
 * @deprecated src/data/stores/ を使用してください
 */
import { toCafeData } from "@/lib/stores/adapters";
import { nueeStore } from "@/data/stores/nuee";

export const cafeData = toCafeData(nueeStore);
