import type { StoreRecord } from "@/types/store";

export const mesaStore: StoreRecord = {
  id: "b2c3d4e5-0005-4000-8000-000000000005",
  slug: "mesa",
  templateType: "bal",
  publishStatus: "published",

  name: "MESA",
  nameEn: "BAR DE VINO & TAPAS",
  location: "中目黒",
  catchCopy: "グラス片手に、今夜はテーブルを囲もう。",
  subCopy: ["小皿のタパスと、気取らないワイン。", "仕事帰りの2人も、4人の乾杯も。"],
  concept:
    "スペインとイタリアの街角にある、夜ごとにぎわう小さな食堂。生ハムを切る音、グラスが触れ合う音。料理はみんなでつまめる小皿が中心、ワインはグラス600円から。肩の力を抜いて、長い夜をどうぞ。",

  address: "東京都目黒区上目黒1-18-6 1F",
  phone: "03-6412-0505",
  access: "東急東横線・日比谷線 中目黒駅 正面改札より徒歩4分",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3242.3!2d139.699!3d35.644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDM4JzM4LjQiTiAxMznCsDQxJzU2LjQiRQ!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp",
  instagramUrl: "https://www.instagram.com/",
  instagramHandle: "@mesa_nakameguro",
  reservationUrl: "#reservation",

  businessHours: {
    dinner: "17:00 – 24:00（L.O.23:00）",
  },
  closedDays: "月曜",

  menu: [
    {
      id: "menu-001",
      sortOrder: 1,
      name: "生ハムとサラミの盛り合わせ",
      nameEn: "Jamón & Salami",
      price: "¥1,280",
      description: "切りたてのハモン・セラーノを中心に3種。",
      imageUrl:
        "https://images.unsplash.com/photo-1541529086526-db283c563270?w=1200&q=90&auto=format&fit=crop",
      badge: "名物",
    },
    {
      id: "menu-002",
      sortOrder: 2,
      name: "海老とマッシュルームのアヒージョ",
      nameEn: "Gambas al Ajillo",
      price: "¥980",
      description: "にんにくオイルはバゲットでぜんぶ拭って。",
      imageUrl:
        "https://images.unsplash.com/photo-1559847844-5315695dadae?w=1200&q=90&auto=format&fit=crop",
      badge: "人気",
    },
    {
      id: "menu-003",
      sortOrder: 3,
      name: "トマトのブルスケッタ",
      nameEn: "Bruschetta",
      price: "¥580",
      description: "完熟トマトとバジル、まずは一皿目に。",
      imageUrl:
        "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-004",
      sortOrder: 4,
      name: "熟成チーズ3種",
      nameEn: "Queso Board",
      price: "¥1,180",
      description: "ブルーチーズにはハチミツといちじくを添えて。",
      imageUrl:
        "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-005",
      sortOrder: 5,
      name: "魚介のパエリア",
      nameEn: "Paella de Marisco",
      price: "¥2,480",
      description: "鉄鍋ごとテーブルへ。2〜3人でちょうどいい量です。",
      imageUrl:
        "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1200&q=90&auto=format&fit=crop",
      badge: "シェア",
    },
    {
      id: "menu-006",
      sortOrder: 6,
      name: "牛ハラミのグリルとフリット",
      nameEn: "Steak Frites",
      price: "¥1,880",
      description: "炭火で香ばしく。山盛りのポテトと一緒に。",
      imageUrl:
        "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-101",
      sortOrder: 7,
      name: "グラスワイン 赤／白",
      nameEn: "Vino de la casa",
      price: "¥600",
      description: "スペイン・イタリアの日替わりハウスワイン",
      imageUrl:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-102",
      sortOrder: 8,
      name: "カヴァ",
      nameEn: "Cava Brut",
      price: "¥700",
      description: "最初の乾杯はスペインの泡で",
      imageUrl:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-103",
      sortOrder: 9,
      name: "自家製サングリア",
      nameEn: "Sangria",
      price: "¥650",
      description: "赤ワインに季節のフルーツを漬け込んで",
      imageUrl:
        "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-104",
      sortOrder: 10,
      name: "ボトルワイン",
      nameEn: "Botella",
      price: "¥3,800〜",
      description: "常時30種。ソムリエが料理に合わせて選びます",
      imageUrl:
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=90&auto=format&fit=crop",
    },
    {
      id: "menu-201",
      sortOrder: 11,
      name: "本日の鮮魚のアクアパッツァ",
      nameEn: "Acqua Pazza",
      price: "¥1,680",
      description: "その日の市場で選んだ魚を丸ごと",
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90&auto=format&fit=crop",
      badge: "本日",
    },
    {
      id: "menu-202",
      sortOrder: 12,
      name: "黒板パスタ",
      nameEn: "Pasta del giorno",
      price: "¥1,280",
      description: "日替わりで1種。スタッフに聞いてください",
      imageUrl:
        "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=1200&q=90&auto=format&fit=crop",
      badge: "日替わり",
    },
    {
      id: "menu-203",
      sortOrder: 13,
      name: "季節野菜のグリル",
      nameEn: "Verduras a la plancha",
      price: "¥880",
      description: "ロメスコソースでどうぞ",
      imageUrl:
        "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=90&auto=format&fit=crop",
      badge: "季節",
    },
    {
      id: "menu-204",
      sortOrder: 14,
      name: "熟成肉のタリアータ",
      nameEn: "Tagliata",
      price: "¥2,480",
      description: "1日5皿限定。赤ワインと一緒に",
      imageUrl:
        "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=90&auto=format&fit=crop",
      badge: "限定",
    },
  ],

  courses: [
    {
      id: "course-001",
      sortOrder: 1,
      name: "MESAのタパスコース",
      price: "¥4,500",
      note: "タパス6品・パエリア・デザート / 2時間飲み放題付き",
      isFeatured: true,
    },
    {
      id: "course-002",
      sortOrder: 2,
      name: "気軽にシェアプラン",
      price: "¥3,000",
      note: "タパス4品とパエリア / 飲み放題なし",
      isFeatured: false,
    },
  ],

  photos: [
    {
      id: "photo-hero",
      sortOrder: 1,
      role: "hero",
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=2400&q=90&auto=format&fit=crop",
      alt: "ワイングラスで乾杯するテーブル",
    },
    {
      id: "photo-food",
      sortOrder: 2,
      role: "food",
      url: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1400&q=90&auto=format&fit=crop",
      alt: "鉄鍋のパエリア",
    },
    {
      id: "photo-interior",
      sortOrder: 3,
      role: "interior",
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=90&auto=format&fit=crop",
      alt: "明るいテーブル席",
    },
    {
      id: "photo-about",
      sortOrder: 4,
      role: "about",
      url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=90&auto=format&fit=crop",
      alt: "灯りのともるカウンター",
    },
    {
      id: "photo-exterior",
      sortOrder: 5,
      role: "exterior",
      url: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1600&q=90&auto=format&fit=crop",
      alt: "緑に囲まれたテラス",
    },
    {
      id: "photo-gallery-1",
      sortOrder: 6,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=1200&q=90&auto=format&fit=crop",
      alt: "生ハムとチーズのボード",
      caption: "まずは生ハムから。",
    },
    {
      id: "photo-gallery-2",
      sortOrder: 7,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=90&auto=format&fit=crop",
      alt: "グラスを合わせる仲間たち",
      caption: "Salud!",
    },
    {
      id: "photo-gallery-3",
      sortOrder: 8,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=1200&q=90&auto=format&fit=crop",
      alt: "グリルした肉料理",
      caption: "赤ワインに合う一皿。",
    },
    {
      id: "photo-gallery-4",
      sortOrder: 9,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1200&q=90&auto=format&fit=crop",
      alt: "テーブルに置かれたパエリア",
      caption: "鉄鍋ごと、みんなで。",
    },
    {
      id: "photo-gallery-5",
      sortOrder: 10,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=1200&q=90&auto=format&fit=crop",
      alt: "ブルスケッタ",
      caption: "一皿目はこれ。",
    },
    {
      id: "photo-gallery-6",
      sortOrder: 11,
      role: "gallery",
      url: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1200&q=90&auto=format&fit=crop",
      alt: "赤ワインとぶどう",
      caption: "今夜のおすすめは黒板で。",
    },
  ],

  topics: [
    {
      id: "topic-001",
      sortOrder: 1,
      date: "2026.10",
      category: "イベント",
      title: "ボジョレー解禁ナイト、11/19（木）開催します",
    },
    {
      id: "topic-002",
      sortOrder: 2,
      date: "2026.09",
      category: "新メニュー",
      title: "秋のきのこのアヒージョ、はじめました",
    },
    {
      id: "topic-003",
      sortOrder: 3,
      date: "2026.08",
      category: "お知らせ",
      title: "ハッピーアワーを土曜日にも拡大しました",
    },
  ],

  templateExtensions: {
    templateType: "bal",
    highlights: ["グラスワイン¥600から", "タパス¥480から", "2〜4人のテーブル中心"],
    happyHour: {
      time: "17:00 – 19:00",
      offer: "グラスワイン・カヴァ・サングリア 全品¥400",
      note: "月〜土曜 / 入店時間で適用",
    },
    table: {
      title: "肩を寄せて、テーブルを囲む。",
      description:
        "窓際の2人席、大皿を広げられる4人席、ひとりでも立ち寄れるカウンター。にぎやかだけど、隣の声はちょうどいい距離。",
      features: ["カウンター8席", "テーブル24席", "テラス8席", "貸切20名〜", "ひとり飲み歓迎"],
      photoId: "photo-interior",
    },
  },
};
