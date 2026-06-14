import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";

export const luxuryIzakayaData: LuxuryIzakayaData = {
  store: {
    name: "宵月",
    nameEn: "SHOGETSU",
    location: "西麻布",
    exclusivity: "完全予約制",
    tagline: "旬を紡ぐ、大人の隠れ家",
    heroCopy: [
      "西麻布の路地奥に、",
      "灯り一つの隠れ家。",
      "会食の席で語られる、",
      "その名の店。",
    ],
    concept:
      "路地裏に佇む、わずか八席のみの空間。全国から届く旬を、炭火と手仕事で。言葉を少なく、余白を多く——静寂だけが、時間を刻む。",
    story: [
      "店主は銀座の名店で十五年、板前として腕を磨いた。",
      "「もっと小さな場所で、一人ひとりと向き合いたい」——その想いから、西麻布の路地に宵月を開いた。",
      "カウンター八席。個室二つ。それ以上の席は、意図的に設けていない。",
    ],
    address: "東京都港区西麻布3-12-8 B1F",
    phone: "03-1234-5678",
    hours: {
      dinner: "17:30 – 23:00",
      closed: "日曜・祝日",
    },
    seats: "カウンター8席・個室2室",
    access: "六本木駅より徒歩7分",
    reservationUrl: "#reservation",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.7479754683747!2d139.7225!3d35.658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDM5JzI4LjgiTiAxMznCsDQzJzIxLjAiRQ!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp",
  },
  useCases: [
    {
      label: "接待",
      title: "大切なお客様をお招きする夜に",
      description:
        "個室は静けさと格式を備え、商談の余韻を損なわない空間です。お料理長がその日のご要望に合わせ、最適なコースをご提案いたします。",
    },
    {
      label: "会食",
      title: "信頼を深める、大人の食事会",
      description:
        "西麻布・麻布十番で選ばれる理由は、料理以上の「空気」にあります。言葉少なく、食と酒が会話を代弁する夜を。",
    },
    {
      label: "記念日",
      title: "かけがえのない一日を、余白とともに",
      description:
        "カウンターでは板前との距離感、個室では二人だけの時間。どちらも、忘れられない夜のための特別な席です。",
    },
  ],
  commitments: [
    {
      number: "壱",
      title: "産地直送の旬",
      description:
        "毎朝、全国の産地から届く鮮魚と野菜。季節の移ろいを、一期一会の味わいに。",
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1400&q=92&auto=format&fit=crop",
    },
    {
      number: "弐",
      title: "備長炭の火入れ",
      description:
        "紀州備長炭の遠赤外線が引き出す旨味。一本一本、職人の目と手で。",
      image:
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1400&q=92&auto=format&fit=crop",
    },
    {
      number: "参",
      title: "酒との調和",
      description:
        "全国の蔵元から厳選した日本酒を常時30種。料理に寄り添う一杯を。",
      image:
        "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1400&q=92&auto=format&fit=crop",
    },
  ],
  recommendations: [
    {
      name: "本日のお造り",
      price: "¥3,800",
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=92&auto=format&fit=crop",
    },
    {
      name: "宵月の焼き鳥",
      price: "¥2,400",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=92&auto=format&fit=crop",
    },
    {
      name: "季節の煮物",
      price: "¥1,800",
      image:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=92&auto=format&fit=crop",
    },
  ],
  courses: [
    { name: "月見", price: "¥8,800", note: "全7品" },
    { name: "宵", price: "¥15,000", note: "全9品", featured: true },
    { name: "匠", price: "¥22,000", note: "全11品" },
  ],
  galleryImages: [
    {
      src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1600&q=92&auto=format&fit=crop",
      alt: "檜のカウンターと温かな灯り",
      caption: "檜一枚板のカウンター。灯りは、食事の主役を奪わない。",
    },
    {
      src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=92&auto=format&fit=crop",
      alt: "板前の手仕事",
      caption: "目の前で仕上げる、本日の一献。",
    },
    {
      src: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1200&q=92&auto=format&fit=crop",
      alt: "日本酒のラインナップ",
      caption: "料理に寄り添う、厳選の日本酒。",
    },
    {
      src: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=1200&q=92&auto=format&fit=crop",
      alt: "個室の静謐な空間",
      caption: "接待・記念日に。静けさを求める方へ。",
    },
  ],
  topics: [
    { date: "2026.05", title: "初夏の限定コース「涼風」" },
    { date: "2026.04", title: "美食誌「和の極み」特集掲載" },
  ],
  heroImage:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=2400&q=95&auto=format&fit=crop",
  aboutImage:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=92&auto=format&fit=crop",
};

/** @deprecated テンプレートコンポーネントは luxuryIzakayaData を使用してください */
export const store = luxuryIzakayaData.store;
export const useCases = luxuryIzakayaData.useCases;
export const commitments = luxuryIzakayaData.commitments;
export const recommendations = luxuryIzakayaData.recommendations;
export const courses = luxuryIzakayaData.courses;
export const galleryImages = luxuryIzakayaData.galleryImages;
export const topics = luxuryIzakayaData.topics;
export const heroImage = luxuryIzakayaData.heroImage;
export const aboutImage = luxuryIzakayaData.aboutImage;
