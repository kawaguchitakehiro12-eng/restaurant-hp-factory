import type { StoreRecord } from "@/types/store";

export const nueeStore: StoreRecord = {
  id: "b2c3d4e5-0002-4000-8000-000000000002",
  slug: "nuee",
  templateType: "cafe",
  publishStatus: "published",

  name: "nuée",
  nameEn: "NUÉE CAFÉ",
  location: "表参道",
  catchCopy: "光に包まれる、午後の余白",
  subCopy: "A quiet moment, brewed with care.",
  concept:
    "表参道の路地に佇む、白を基調としたスペシャルティカフェ。韓国・ソウルで培った感性と、東京の洗練が出会う場所。コーヒーと季節のスイーツで、日常に小さな特別を。",

  address: "東京都渋谷区神宮前4-18-3 1F",
  phone: "03-5678-1234",
  access: "東京メトロ表参道駅 A2出口より徒歩4分",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.5!2d139.712!3d35.665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDM5JzU0LjAiTiAxMznCsDQyJzQzLjIiRQ!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp",
  instagramUrl: "https://www.instagram.com/",
  instagramHandle: "@nuee_cafe",
  reservationUrl: "#reservation",

  businessHours: {
    weekday: "8:00 – 19:00",
    weekend: "9:00 – 20:00",
  },
  closedDays: "不定休",

  menu: [
    {
      id: "menu-001",
      sortOrder: 1,
      name: "nuéeラテ",
      nameEn: "Nuée Latte",
      price: "¥780",
      description: "自家焙煎エスプレッソと、特製ミルクのなめらかなハーモニー",
      imageUrl:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=90&auto=format&fit=crop",
      badge: "人気No.1",
    },
    {
      id: "menu-002",
      sortOrder: 2,
      name: "ソウルティラミス",
      nameEn: "Seoul Tiramisu",
      price: "¥920",
      description: "韓国風の軽やかな口当たり。ほろ苦いコーヒーと相性抜群",
      imageUrl:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=90&auto=format&fit=crop",
      badge: "限定",
    },
    {
      id: "menu-003",
      sortOrder: 3,
      name: "季節のクロワッサン",
      nameEn: "Seasonal Croissant",
      price: "¥580",
      description: "毎朝焼き上げる、バター香る一層の贅沢",
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=90&auto=format&fit=crop",
    },
  ],

  courses: [],

  photos: [
    {
      id: "photo-hero",
      sortOrder: 1,
      role: "hero",
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=2400&q=90&auto=format&fit=crop",
      alt: "nuéeの店内",
    },
    {
      id: "photo-concept",
      sortOrder: 2,
      role: "concept",
      url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400&q=90&auto=format&fit=crop",
      alt: "nuéeのカフェ空間",
    },
    {
      id: "photo-interior",
      sortOrder: 3,
      role: "interior",
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=90&auto=format&fit=crop",
      alt: "白と光の空間",
    },
    {
      id: "photo-gallery-1",
      sortOrder: 4,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=90&auto=format&fit=crop",
      alt: "スペシャルティコーヒー",
      caption: "一杯ずつ、丁寧に。",
    },
    {
      id: "photo-gallery-2",
      sortOrder: 5,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=90&auto=format&fit=crop",
      alt: "カフェの午後",
      caption: "表参道の静かな午後。",
    },
    {
      id: "photo-gallery-3",
      sortOrder: 6,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=90&auto=format&fit=crop",
      alt: "カウンター席",
      caption: "バリスタとの会話も楽しみのひとつ。",
    },
    {
      id: "photo-gallery-4",
      sortOrder: 7,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=1200&q=90&auto=format&fit=crop",
      alt: "季節のスイーツ",
      caption: "韓国発、季節限定スイーツ。",
    },
  ],

  topics: [
    {
      id: "topic-001",
      sortOrder: 1,
      date: "2026.06",
      category: "新作",
      title: "夏限定「ピーチクリームソーダ」登場",
    },
    {
      id: "topic-002",
      sortOrder: 2,
      date: "2026.05",
      category: "限定",
      title: "韓国コラボ「抹茶シグネチャーラテ」期間限定販売",
    },
    {
      id: "topic-003",
      sortOrder: 3,
      date: "2026.04",
      category: "お知らせ",
      title: "テラス席オープン（4/1〜）",
    },
  ],

  templateExtensions: {
    templateType: "cafe",
    conceptPoints: [
      "シングルオリジンのスペシャルティコーヒー",
      "韓国発・季節限定のスイーツ",
      "自然光が差し込む、白い空間",
    ],
    interior: {
      title: "白と光の空間",
      description:
        "余白を大切にしたミニマルなインテリア。大きな窓から差し込む自然光が、どの席でも心地よい陰影をつくります。",
      features: [
        "白を基調としたミニマルデザイン",
        "観葉植物と柔らかな間接照明",
        "窓際席・カウンター席・ソファ席",
      ],
      photoId: "photo-interior",
    },
  },
};
