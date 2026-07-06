import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { mentorStyles } from "@/lib/ai-mentor";
import { getAccountDashboard, updateMentorStyle } from "@/lib/api/account.functions";
import type { MentorStyle } from "@/lib/account-store.server";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/settings")({
  loader: async () => getAccountDashboard(),
  head: () => ({
    meta: [
      { title: "Settings — AI-Sana" },
      { name: "description", content: "AI-Sana student settings and mentor style." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const dashboard = Route.useLoaderData();
  const { language } = useLanguage();
  const c = copy[language];
  const [mentorStyle, setMentorStyle] = useState<MentorStyle>(dashboard.account.mentorStyle);
  const [status, setStatus] = useState("");

  const save = async (style: MentorStyle) => {
    setMentorStyle(style);
    setStatus(c.saving);
    try {
      await updateMentorStyle({ data: { mentorStyle: style } });
      setStatus(c.saved);
    } catch {
      setStatus(c.error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-container-padding-mobile py-stack-lg md:px-container-padding-desktop">
        <section className="border border-outline-variant bg-surface-container-lowest p-7 shadow-[12px_12px_0_var(--secondary-container)]">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            AI-Sana
          </p>
          <h1 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
            {c.title}
          </h1>
          <p className="mt-4 max-w-2xl text-on-surface-variant">{c.desc}</p>
        </section>

        <section className="mt-stack-lg grid gap-gutter md:grid-cols-2">
          {mentorStyles.map((style) => (
            <button
              className={`border p-6 text-left transition-all ${
                mentorStyle === style.id
                  ? "border-secondary bg-secondary-container shadow-[8px_8px_0_var(--secondary)]"
                  : "border-outline-variant bg-surface hover:border-secondary"
              }`}
              key={style.id}
              onClick={() => save(style.id)}
              type="button"
            >
              <span className="material-symbols-outlined text-secondary">{style.icon}</span>
              <h2 className="mt-3 font-title-lg text-title-lg text-primary">
                {style.title[language]}
              </h2>
              <p className="mt-2 text-on-surface-variant">{style.description[language]}</p>
            </button>
          ))}
        </section>

        {status ? <p className="mt-5 text-on-surface-variant">{status}</p> : null}
      </main>
    </div>
  );
}

const copy = {
  EN: {
    title: "Mentor style",
    desc: "Choose how AI-Sana explains tasks and gives feedback.",
    saving: "Saving...",
    saved: "Mentor style saved.",
    error: "Could not save mentor style. Please try again.",
  },
  KZ: {
    title: "Ментор стилі",
    desc: "AI-Sana тапсырманы қалай түсіндіріп, қандай тонмен кері байланыс беретінін таңда.",
    saving: "Сақталып жатыр...",
    saved: "Ментор стилі сақталды.",
    error: "Ментор стилін сақтау мүмкін болмады. Қайта көріңіз.",
  },
  RU: {
    title: "Стиль ментора",
    desc: "Выберите, как AI-Sana объясняет задачи и даёт обратную связь.",
    saving: "Сохраняем...",
    saved: "Стиль ментора сохранён.",
    error: "Не удалось сохранить стиль. Попробуйте ещё раз.",
  },
};
