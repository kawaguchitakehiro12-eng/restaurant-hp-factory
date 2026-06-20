import type { ContractTemplateId } from "@/types/demo";
import type { DemoMenuItem, DemoTopicItem, DemoGalleryPhoto } from "@/types/demo-content";
import { generateId } from "@/lib/admin/form-utils";

const IMG = {
  heroJapanese:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=2400&q=90&auto=format&fit=crop",
  heroCafe:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=2400&q=90&auto=format&fit=crop",
  heroBar:
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=2400&q=90&auto=format&fit=crop",
  interior:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=92&auto=format&fit=crop",
  food:
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=92&auto=format&fit=crop",
  exterior:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=90&auto=format&fit=crop",
  gallery1:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1600&q=92&auto=format&fit=crop",
  gallery2:
    "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1200&q=92&auto=format&fit=crop",
  cafeMenu:
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=90&auto=format&fit=crop",
};

type TemplateSamples = {
  catchCopy: string;
  subCopy: string;
  subCopyLines: string[];
  concept: string;
  businessHours: string;
  weekdayHours: string;
  weekendHours: string;
  closedDays: string;
  hero: string;
  interior: string;
  food: string;
  exterior: string;
  menus: Omit<DemoMenuItem, "id" | "visible" | "sortOrder">[];
  topics: Omit<DemoTopicItem, "id" | "visible">[];
};

const SAMPLES: Record<ContractTemplateId, TemplateSamples> = {
  "luxury-japanese": {
    catchCopy: "旬を紡ぐ、大人の隠れ家",
    subCopy: "",
    subCopyLines: ["厳選された旬の食材を", "炭火と手仕事で。", "静寂の中で味わう一献。"],
    concept:
      "全国から届く旬の食材を、炭火と手仕事で。季節の会席コースで、特別なひとときをお過ごしください。",
    businessHours: "17:30 – 23:00",
    weekdayHours: "",
    weekendHours: "",
    closedDays: "日曜・祝日",
    hero: IMG.heroJapanese,
    interior: IMG.interior,
    food: IMG.food,
    exterior: IMG.exterior,
    menus: [
      {
        name: "季節の会席",
        price: "¥8,800",
        description: "旬の食材を使用した本日のおすすめコース",
        imageUrl: IMG.food,
      },
      {
        name: "旬魚のお造り",
        price: "¥3,800",
        description: "築地直送の鲜魚を職人が仕立てる",
        imageUrl: IMG.food,
      },
      {
        name: "備長炭焼き",
        price: "¥2,400",
        description: "炭火の香りを楽しむ人気メニュー",
        imageUrl: IMG.food,
      },
    ],
    topics: [
      {
        title: "新メニューのお知らせ",
        body: "季節限定メニューをご用意しました",
        date: "2026.06",
      },
    ],
  },
  cafe: {
    catchCopy: "光に包まれる、午後の余白",
    subCopy: "A quiet moment, brewed with care.",
    subCopyLines: [],
    concept:
      "自家焙煎のスペシャルティコーヒーと、季節のスイーツ。日常に小さな特別を届けるカフェです。",
    businessHours: "",
    weekdayHours: "8:00 – 19:00",
    weekendHours: "9:00 – 20:00",
    closedDays: "不定休",
    hero: IMG.heroCafe,
    interior: IMG.interior,
    food: IMG.cafeMenu,
    exterior: IMG.exterior,
    menus: [
      {
        name: "季節のタルト",
        price: "¥920",
        description: "旬のフルーツを使った人気スイーツ",
        imageUrl: IMG.cafeMenu,
      },
      {
        name: "スペシャルティラテ",
        price: "¥780",
        description: "自家焙煎豆と特製ミルクのハーモニー",
        imageUrl: IMG.cafeMenu,
      },
      {
        name: "ブランチプレート",
        price: "¥1,480",
        description: "休日の午後にぴったりのセット",
        imageUrl: IMG.cafeMenu,
      },
    ],
    topics: [
      {
        title: "新メニューのお知らせ",
        body: "季節限定メニューをご用意しました",
        date: "2026.06",
      },
    ],
  },
  bar: {
    catchCopy: "夜を彩る、クラフトの世界",
    subCopy: "",
    subCopyLines: ["夜景の見えるカウンターで", "一杯の余韻を。"],
    concept:
      "厳選ウイスキーとクラフトカクテル。大人の夜を彩る、落ち着いたバーラウンジ。",
    businessHours: "18:00 – 02:00",
    weekdayHours: "",
    weekendHours: "",
    closedDays: "月曜",
    hero: IMG.heroBar,
    interior: IMG.interior,
    food: IMG.food,
    exterior: IMG.exterior,
    menus: [
      {
        name: "クラフトカクテル",
        price: "¥1,200",
        description: "バーテンダーが仕立てる本日の一杯",
        imageUrl: IMG.heroBar,
      },
      {
        name: "ウイスキー",
        price: "¥980〜",
        description: "国内外の厳選ボトルをご用意",
        imageUrl: IMG.heroBar,
      },
      {
        name: "夜景の見えるカウンター",
        price: "",
        description: "特別な夜を演出する席をご予約ください",
        imageUrl: IMG.heroBar,
      },
    ],
    topics: [
      {
        title: "新メニューのお知らせ",
        body: "季節限定メニューをご用意しました",
        date: "2026.06",
      },
    ],
  },
  bal: {
    catchCopy: "ワインと共に、至福のひととき",
    subCopy: "",
    subCopyLines: ["イタリア直輸のワインと", "タパスを楽しむバル。"],
    concept: "生ハムとチーズ、タパス盛り合わせ。気軽に立ち寄れる本格バル。",
    businessHours: "17:00 – 24:00",
    weekdayHours: "",
    weekendHours: "",
    closedDays: "不定休",
    hero: IMG.exterior,
    interior: IMG.interior,
    food: IMG.food,
    exterior: IMG.exterior,
    menus: [
      {
        name: "生ハムとチーズ",
        price: "¥1,680",
        description: "イタリア直輸の生ハム盛り合わせ",
        imageUrl: IMG.food,
      },
      {
        name: "ワイン",
        price: "¥780〜",
        description: "ソムリエ厳選のグラスワイン",
        imageUrl: IMG.food,
      },
      {
        name: "タパス盛り合わせ",
        price: "¥2,200",
        description: "シェフのおすすめ前菜5種",
        imageUrl: IMG.food,
      },
    ],
    topics: [
      {
        title: "新メニューのお知らせ",
        body: "季節限定メニューをご用意しました",
        date: "2026.06",
      },
    ],
  },
  "izakaya-casual": {
    catchCopy: "気軽に、賑やかに",
    subCopy: "",
    subCopyLines: ["仕事帰りに一杯。", "仲間と囲む、居酒屋の時間。"],
    concept: "名物煮込みと焼鳥、レモンサワー。大衆居酒屋ならではの温かい雰囲気。",
    businessHours: "17:00 – 23:30",
    weekdayHours: "",
    weekendHours: "",
    closedDays: "なし",
    hero: IMG.heroJapanese,
    interior: IMG.interior,
    food: IMG.food,
    exterior: IMG.exterior,
    menus: [
      {
        name: "名物煮込み",
        price: "¥680",
        description: "秘伝のダシが効いた看板メニュー",
        imageUrl: IMG.food,
      },
      {
        name: "焼鳥",
        price: "¥150〜",
        description: "炭火で焼き上げる自慢の一串",
        imageUrl: IMG.food,
      },
      {
        name: "レモンサワー",
        price: "¥480",
        description: "キレのある自家製レモンサワー",
        imageUrl: IMG.food,
      },
    ],
    topics: [
      {
        title: "新メニューのお知らせ",
        body: "季節限定メニューをご用意しました",
        date: "2026.06",
      },
    ],
  },
};

export function getTemplateSamples(templateId: ContractTemplateId): TemplateSamples {
  return SAMPLES[templateId] ?? SAMPLES["luxury-japanese"];
}

export function createSampleMenuItems(templateId: ContractTemplateId): DemoMenuItem[] {
  return getTemplateSamples(templateId).menus.map((m, i) => ({
    ...m,
    id: `sample-menu-${i}`,
    visible: true,
    sortOrder: i + 1,
  }));
}

export function createSampleTopics(templateId: ContractTemplateId): DemoTopicItem[] {
  return getTemplateSamples(templateId).topics.map((t, i) => ({
    ...t,
    id: `sample-topic-${i}`,
    visible: true,
  }));
}

export function createEmptyMenuItem(sortOrder: number): DemoMenuItem {
  return {
    id: generateId("menu"),
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    visible: true,
    sortOrder,
  };
}

export function createEmptyTopic(): DemoTopicItem {
  return {
    id: generateId("topic"),
    title: "",
    body: "",
    date: new Date().toISOString().slice(0, 7).replace("-", "."),
    visible: true,
  };
}

export function createEmptyGalleryPhoto(sortOrder: number): DemoGalleryPhoto {
  return {
    id: generateId("gallery"),
    url: "",
    alt: "",
    caption: "",
    sortOrder,
  };
}
