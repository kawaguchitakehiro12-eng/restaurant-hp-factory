import type { StoreRecord } from "@/types/store";

export const amberStore: StoreRecord = {
  id: "b2c3d4e5-0003-4000-8000-000000000003",
  slug: "amber",
  templateType: "bar",
  publishStatus: "published",

  name: "AMBER",
  nameEn: "AMBER BAR",
  location: "銀座",
  catchCopy: "夜を彩る、一杯の余韻",
  subCopy: ["夜景の見えるカウンターで", "一杯の余韻を。"],
  concept:
    "厳選ウイスキーとクラフトカクテル。深い木目と真鍮の灯りが織りなす、大人のためのバーラウンジ。静かな夜に、グラスを傾ける時間を。",

  address: "東京都中央区銀座6-10-1 B1F",
  phone: "03-1234-5678",
  access: "東京メトロ銀座駅 A3出口より徒歩3分",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.5!2d139.765!3d35.671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQwJzE1LjYiTiAxMznCsDQ1JzU0LjAiRQ!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp",
  instagramUrl: "https://www.instagram.com/",
  instagramHandle: "@amber_bar_ginza",
  reservationUrl: "#reservation",

  businessHours: {
    dinner: "18:00 – 02:00",
  },
  closedDays: "月曜",

  menu: [
    {
      id: "menu-001",
      sortOrder: 1,
      name: "AMBER オールドファッション",
      nameEn: "AMBER Old Fashioned",
      price: "¥1,400",
      description: "バーボン、ビターズ、オレンジピール。当店のシグネチャー",
      imageUrl:
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=90&auto=format&fit=crop",
      badge: "Signature",
    },
    {
      id: "menu-002",
      sortOrder: 2,
      name: "スモーキー ネグローニ",
      nameEn: "Smoky Negroni",
      price: "¥1,300",
      description: "ジン、カンパリ、スイートベルモット。ピートの香りが漂う大人の一杯",
      imageUrl:
        "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=1200&q=90&auto=format&fit=crop",
      badge: "人気",
    },
    {
      id: "menu-003",
      sortOrder: 3,
      name: "シングルモルト グラス",
      nameEn: "Single Malt",
      price: "¥980〜",
      description: "スコットランド、ジャパニーズ。30種以上からグラスで",
      imageUrl:
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-004",
      sortOrder: 4,
      name: "燻製ナッツ & オリーブ",
      nameEn: "Smoked Nuts & Olives",
      price: "¥780",
      description: "軽やかなおつまみ。グラスの合間に",
      imageUrl:
        "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-005",
      sortOrder: 5,
      name: "チーズ & チャコリート",
      nameEn: "Cheese & Charcuterie",
      price: "¥1,680",
      description: "厳選チーズと燻製肉の盛り合わせ",
      imageUrl:
        "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-006",
      sortOrder: 6,
      name: "トリュフポテト",
      nameEn: "Truffle Fries",
      price: "¥920",
      description: "黒トリュフの香りを纏った、シェア向けスナック",
      imageUrl:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200&q=90&auto=format&fit=crop",
    },
  ],

  courses: [],

  photos: [
    {
      id: "photo-hero",
      sortOrder: 1,
      role: "hero",
      url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=2400&q=90&auto=format&fit=crop",
      alt: "AMBERのバーカウンター",
    },
    {
      id: "photo-concept",
      sortOrder: 2,
      role: "concept",
      url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1400&q=90&auto=format&fit=crop",
      alt: "カクテルと灯り",
    },
    {
      id: "photo-interior",
      sortOrder: 3,
      role: "interior",
      url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=90&auto=format&fit=crop",
      alt: "バーラウンジ",
    },
    {
      id: "photo-gallery-1",
      sortOrder: 4,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=90&auto=format&fit=crop",
      alt: "ウイスキーグラス",
      caption: "グラスに注がれる、琥珀色の時間。",
    },
    {
      id: "photo-gallery-2",
      sortOrder: 5,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200&q=90&auto=format&fit=crop",
      alt: "バーテンダー",
      caption: "一杯ずつ、丁寧に。",
    },
    {
      id: "photo-gallery-3",
      sortOrder: 6,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1574096079513-d8259312b785?w=1200&q=90&auto=format&fit=crop",
      alt: "カウンター席",
      caption: "木目と真鍮が織りなす空間。",
    },
    {
      id: "photo-gallery-4",
      sortOrder: 7,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=1200&q=90&auto=format&fit=crop",
      alt: "ボトル棚",
      caption: "厳選されたスピリッツ。",
    },
  ],

  topics: [
    {
      id: "topic-001",
      sortOrder: 1,
      date: "2026.06",
      category: "新作",
      title: "夏季限定「スモークド・マティーニ」登場",
    },
    {
      id: "topic-002",
      sortOrder: 2,
      date: "2026.05",
      category: "イベント",
      title: "ウイスキーペアリングナイト（5/20〜）",
    },
    {
      id: "topic-003",
      sortOrder: 3,
      date: "2026.04",
      category: "お知らせ",
      title: "カウンター席リニューアルオープン",
    },
  ],

  templateExtensions: {
    templateType: "bar",
    conceptPoints: [
      "国内外30種以上のウイスキー",
      "バーテンダーによるオリジナルカクテル",
      "木目と真鍮の落ち着いた空間",
    ],
    space: {
      title: "灯りと木目のラウンジ",
      description:
        "深いブラウンの木目、真鍮のランプ、低い照明。会話が自然と深まる、大人のための空間です。",
      features: [
        "全12席・カウンター8席",
        "個室2室（要予約）",
        "夜景の見える窓際席",
      ],
      photoId: "photo-interior",
    },
  },
};
