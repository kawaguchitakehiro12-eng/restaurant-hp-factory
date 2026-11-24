import type { StoreRecord } from "@/types/store";

export const yakitoriDaidokoroStore: StoreRecord = {
  id: "b2c3d4e5-0004-4000-8000-000000000004",
  slug: "yakitori-daidokoro",
  templateType: "izakaya-casual",
  publishStatus: "published",

  name: "やきとり大道",
  nameEn: "YAKITORI DAIDO",
  location: "下北沢",
  catchCopy: "炭火と笑顔で、おかえりなさい",
  subCopy: "今日も仕事終わりに、一杯どうですか。",
  concept:
    "赤提灯の下で焼く串、冷えたビール、仲間との会話。近所の人がふらっと寄れる、にぎやかな炭火やきとり屋です。",

  address: "東京都世田谷区北沢2-12-8 1F",
  phone: "03-9876-5432",
  access: "小田急・京王井の頭線 下北沢駅 東口より徒歩3分",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.5!2d139.668!3d35.661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDM5JzM5LjYiTiAxMznCsDQwJzA0LjgiRQ!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp",
  instagramUrl: "https://www.instagram.com/",
  instagramHandle: "@yakitori_daido",
  reservationUrl: "#reservation",

  businessHours: {
    dinner: "17:00 – 24:00（L.O.23:30）",
  },
  closedDays: "火曜",

  menu: [
    {
      id: "menu-001",
      sortOrder: 1,
      name: "秘伝つくね",
      nameEn: "Signature Tsukune",
      price: "¥180",
      description: "創業以来継ぎ足した甘辛だれで。",
      imageUrl:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=90&auto=format&fit=crop",
      badge: "名物",
    },
    {
      id: "menu-002",
      sortOrder: 2,
      name: "ねぎま",
      nameEn: "Negima",
      price: "¥160",
      description: "脂ののった鶏ももと長ねぎの定番串",
      imageUrl:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=90&auto=format&fit=crop",
      badge: "人気",
    },
    {
      id: "menu-003",
      sortOrder: 3,
      name: "鶏レバ刺し",
      nameEn: "Chicken Liver Sashimi",
      price: "¥680",
      description: "鮮度抜群。わさび醤油でどうぞ",
      imageUrl:
        "https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=90&auto=format&fit=crop",
      badge: "看板",
    },
    {
      id: "menu-004",
      sortOrder: 4,
      name: "本日の刺身盛り",
      nameEn: "Today's Sashimi",
      price: "¥980",
      description: "その日仕入れた鮮魚の盛り合わせ",
      imageUrl:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=90&auto=format&fit=crop",
      badge: "本日",
    },
    {
      id: "menu-005",
      sortOrder: 5,
      name: "生ビール",
      nameEn: "Draft Beer",
      price: "¥480",
      description: "キンキンに冷えた生ビール",
      imageUrl:
        "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-006",
      sortOrder: 6,
      name: "名物煮込み",
      nameEn: "Signature Stew",
      price: "¥680",
      description: "秘伝のダシが染みた、締めにも合う一品",
      imageUrl:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-007",
      sortOrder: 7,
      name: "季節のサラダ",
      nameEn: "Seasonal Salad",
      price: "¥580",
      description: "今日入荷の野菜で仕立てます",
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=90&auto=format&fit=crop",
      badge: "季節",
    },
    {
      id: "menu-008",
      sortOrder: 8,
      name: "レモンサワー",
      nameEn: "Lemon Sour",
      price: "¥450",
      description: "自家製レモンがたっぷり",
      imageUrl:
        "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1200&q=90&auto=format&fit=crop",
    },
  ],

  courses: [
    {
      id: "course-001",
      sortOrder: 1,
      name: "飲み放題付き スタンダード宴会",
      price: "¥3,980",
      note: "串盛り・刺身・煮込み・ご飯物など全8品 / 2時間飲み放題付き",
      isFeatured: true,
    },
    {
      id: "course-002",
      sortOrder: 2,
      name: "デラックス炭火宴会",
      price: "¥4,980",
      note: "名物つくね・刺身盛り・特選串など全10品 / 2.5時間飲み放題付き",
      isFeatured: false,
    },
    {
      id: "course-003",
      sortOrder: 3,
      name: "気軽に乾杯プラン",
      price: "¥2,980",
      note: "串盛りとシェアメニュー全6品 / 飲み放題なしも可",
      isFeatured: false,
    },
  ],

  photos: [
    {
      id: "photo-hero",
      sortOrder: 1,
      role: "hero",
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=2400&q=90&auto=format&fit=crop",
      alt: "やきとり大道の店内",
    },
    {
      id: "photo-interior",
      sortOrder: 2,
      role: "interior",
      url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=90&auto=format&fit=crop",
      alt: "にぎやかなカウンター",
    },
    {
      id: "photo-food",
      sortOrder: 3,
      role: "food",
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&q=90&auto=format&fit=crop",
      alt: "炭火焼の串",
    },
    {
      id: "photo-gallery-1",
      sortOrder: 4,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=90&auto=format&fit=crop",
      alt: "焼鳥盛り合わせ",
      caption: "炭の香りが食欲をそそる。",
    },
    {
      id: "photo-gallery-2",
      sortOrder: 5,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1200&q=90&auto=format&fit=crop",
      alt: "生ビール",
      caption: "キンキンの一杯をどうぞ。",
    },
    {
      id: "photo-gallery-3",
      sortOrder: 6,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=90&auto=format&fit=crop",
      alt: "刺身とおつまみ",
      caption: "居酒屋らしい一皿たち。",
    },
    {
      id: "photo-gallery-4",
      sortOrder: 7,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=90&auto=format&fit=crop",
      alt: "テーブル席",
      caption: "少人数から宴会まで大歓迎。",
    },
  ],

  topics: [
    {
      id: "topic-001",
      sortOrder: 1,
      date: "2026.06",
      category: "お知らせ",
      title: "宴会コースの飲み放題時間を延長（〜7/31）",
    },
    {
      id: "topic-002",
      sortOrder: 2,
      date: "2026.05",
      category: "新メニュー",
      title: "夏野菜の串焼き始めました",
    },
    {
      id: "topic-003",
      sortOrder: 3,
      date: "2026.04",
      category: "イベント",
      title: "下北沢・肉の日イベント参加決定",
    },
  ],

  templateExtensions: {
    templateType: "izakaya-casual",
    highlights: [
      "炭火で焼く串は一本150円から",
      "2時間飲み放題付き宴会コースあり",
      "少人数から大宴会まで対応",
    ],
    space: {
      title: "赤提灯の下で乾杯",
      description:
        "カウンターで職人の技を眺めたり、テーブルでワイワイ囲んだり。木の温もりと提灯の灯りが、今日の疲れをほどいてくれます。",
      features: [
        "カウンター12席",
        "テーブル36席",
        "宴会最大40名対応",
        "ひとり飲み歓迎",
        "仕事帰りにどうぞ",
        "喫煙コーナーあり",
      ],
      photoId: "photo-interior",
    },
  },
};
