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
    <footer className="bg-surface w-full border-t border-surface-variant">
      <div className="flex flex-col md:flex-row justify-between items-start py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-12 md:mb-0 max-w-sm">
          <div className="font-headline-md text-headline-md text-secondary font-bold mb-6">
            Aibi
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            {t("footer_desc")}
          </p>
          <a
            className="mb-6 block font-label-caps text-label-caps text-secondary uppercase tracking-widest hover:text-primary transition-colors"
            href="mailto:info.aibi@gmail.com"
          >
            info.aibi@gmail.com
          </a>
          <p className="font-label-caps text-label-caps text-outline uppercase tracking-widest opacity-60">
            {t("footer_rights")}
          </p>
        </div>
        <div className="flex flex-col gap-6 md:items-end">
          <Link
            className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
            to="/about"
          >
            {links.about}
          </Link>
          <Link
            className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
            to="/careers"
          >
            {links.careers}
          </Link>
          <Link
            className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
            to="/privacy"
          >
            {links.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
