interface IMenuItem {
  title: string;
  href: string;
}

export const menuItems: IMenuItem[] = [
  {
    title: "اخبار",
    href: "/topic/news",
  },
  {
    title: "بررسی‌ها",
    href: "/topic/reviews",
  },
  {
    title: "برترین‌ها",
    href: "/topic/best",
  },
  {
    title: "دستگاه‌ها",
    href: "/topic/devices",
  },
  {
    title: "درباره ما",
    href: "/about",
  },
  {
    title: "تماس با ما",
    href: "/contact",
  },
];

export const siteInfo = {
  title: "TechMag فارسی",
  description: "مجله فناوری و تکنولوژی",
};
