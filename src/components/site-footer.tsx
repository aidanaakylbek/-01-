import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/use-language";

export function SiteFooter() {
  const { t, language } = useLanguage();
  const links =
    language === "KZ"
      ? { about: "Біз туралы", careers: "Вакансиялар", privacy: "Құпиялылық саясаты" }
      : language === "RU"
        ? { about: "О нас", careers: "Вакансии", privacy: "Политика конфиденциальности" }
        : { about: "About", careers: "Careers", privacy: "Privacy Policy" };

  return (
    <footer className="w-full border-t-2 border-[#DDD6FE] bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-10 px-5 py-12 md:flex-row md:items-center">
        <div className="max-w-md">
          <div className="mb-4 text-3xl font-black tracking-tight text-[#6D28D9]">
            AI-Sana
          </div>
          <p className="mb-5 text-base font-semibold leading-7 text-[#6B5E8F]">
            {t("footer_desc")}
          </p>
          <a
            className="mb-5 block text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6] transition-colors hover:text-[#6D28D9]"
            href="mailto:info.aisana@gmail.com"
          >
            info.aisana@gmail.com
          </a>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#A78BFA]">
            {t("footer_rights")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link
            className="rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-5 py-3 text-sm font-black text-[#1E1B4B] transition hover:border-[#8B5CF6] hover:text-[#6D28D9]"
            to="/about"
          >
            {links.about}
          </Link>
          <Link
            className="rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-5 py-3 text-sm font-black text-[#1E1B4B] transition hover:border-[#8B5CF6] hover:text-[#6D28D9]"
            to="/careers"
          >
            {links.careers}
          </Link>
          <Link
            className="rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-5 py-3 text-sm font-black text-[#1E1B4B] transition hover:border-[#8B5CF6] hover:text-[#6D28D9]"
            to="/privacy"
          >
            {links.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
