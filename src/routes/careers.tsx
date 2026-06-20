import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers - Aibi" },
      {
        name: "description",
        content: "Careers and open roles at Aibi.",
      },
    ],
  }),
  component: Careers,
});

function Careers() {
  const { language } = useLanguage();
  const copy =
    language === "KZ"
      ? {
          eyebrow: "Команда",
          title: "Вакансиялар",
          body: "Біз мектеп оқушыларына қолжетімді дайындық беретін платформа құрып жатырмыз. Білім теңдігі миссиясы сізге жақын болса, танысуға қуаныштымыз.",
          emptyTitle: "Қазір ашық вакансия жоқ",
          emptyText: "Aibi командасында жаңа позициялар пайда болғанда, осы бетті жаңартамыз.",
        }
      : language === "RU"
        ? {
            eyebrow: "Команда",
            title: "Вакансии",
            body: "Мы строим платформу для доступной подготовки школьников. Если вам близка миссия образовательного равенства, будем рады познакомиться.",
            emptyTitle: "Открытых вакансий пока нет",
            emptyText: "Мы обновим эту страницу, когда появятся новые позиции в команде Aibi.",
          }
        : {
            eyebrow: "Careers",
            title: "Careers",
            body: "We are building a platform for accessible student preparation. If educational equity matters to you, we would be glad to meet.",
            emptyTitle: "No open roles yet",
            emptyText: "We will update this page when new Aibi team positions appear.",
          };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
          {copy.eyebrow}
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-4">
          {copy.title}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-6">{copy.body}</p>
        <section className="mt-stack-lg border border-outline-variant bg-surface-container-lowest p-8">
          <h2 className="font-headline-md text-headline-md text-primary">{copy.emptyTitle}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">{copy.emptyText}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
