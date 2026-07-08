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
      description: "バーボン、ビters、オレンジピール。当店のシグネチャー",
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
      description: "ピートの香りが漂う、大人の一杯",
      imageUrl:
        "https://images.unsplash.com/photo-1514362545857-3bc1654bd098?w=1200&q=90&auto=format&fit=crop",
      badge: "人気",
    },
    {
      id: "menu-003",
      sortOrder: 3,
      name: "シングルモルト グラス",
      nameEn: "Single Malt",
      price: "¥980〜",
      description: "スコットランド・ジャパニーズを中心に30種以上",
      imageUrl:
        "https://images.unsplash.com/photo-1569529465841-df137a758cf2?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-004",
      sortOrder: 4,
      name: "燻製ナッツ & オリーブ",
      nameEn: "Smoked Nuts & Olives",
      price: "¥780",
      description: "カクテルと相性の良い、軽やかなおつまみ",
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
      url: "https://images.unsplash.com/photo-1514362545857-3bc1654bd098?w=1400&q=90&auto=format&fit=crop",
      alt: "カクテルと灯り",
    },
    {
      id: "photo-interior",
      sortOrder: 3,
      role: "interior",
      url: "https://images.unsplash.com/photo-1572116469696-31de077812ae?w=1600&q=90&auto=format&fit=crop",
      alt: "バーラウンジ",
    },
    {
      id: "photo-gallery-1",
      sortOrder: 4,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1569529465841-df137a758cf2?w=1200&q=90&auto=format&fit=crop",
      alt: "ウイスキーグラス",
      caption: "グラスに注がれる、琥珀色の時間。",
    },
    {
      id: "photo-gallery-2",
      sortOrder: 5,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1551024709-8f239be4e341?w=1200&q=90&auto=format&fit=crop",
      alt: "バーテンダー",
      caption: "一杯ずつ、丁寧に。",
    },
    {
      id: "photo-gallery-3",
      sortOrder: 6,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1572116469696-31de077812ae?w=1200&q=90&auto=format&fit=crop",
      alt: "カウンター席",
      caption: "木目と真鍮が織りなす空間。",
    },
    {
      id: "photo-gallery-4",
      sortOrder: 7,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1525268323446-0505b6fe7768?w=1200&q=90&auto=format&fit=crop",
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
        "全12席のカウンター",
        "ソファ席・個室（要予約）",
        "夜景の見える窓際席",
      ],
      photoId: "photo-interior",
    },
  },
};
