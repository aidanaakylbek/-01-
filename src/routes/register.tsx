import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";
import { registerAccount } from "@/lib/api/account.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register - AI-Sana" },
      { name: "description", content: "Create your AI-Sana student account." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [parentInvite, setParentInvite] = useState<{
    code: string;
    configured: boolean;
    link: string;
  } | null>(null);

  const copy =
    language === "RU"
      ? {
          title: "Регистрация",
          subtitle: "Создайте аккаунт и подключите родителя через Telegram.",
          name: "Имя ученика",
          email: "Электронная почта",
          grade: "Класс",
          parentName: "Имя родителя",
          parentPhone: "Телефон родителя",
          parentHint: "Отчет будет отправляться только после подключения родителя к Telegram-боту.",
          submitError: "Не получилось создать аккаунт. Проверьте данные.",
          success:
            "Аккаунт создан. Недельный отчет будет отправляться после подтверждения родителя через Telegram.",
          inviteTitle: "Код для Telegram готов",
          inviteHint: "Отправьте эту ссылку родителю. После открытия бот сразу подтвердит родителя.",
          inviteConfigMissing:
            "Telegram bot username еще не настроен. Добавьте TELEGRAM_BOT_USERNAME в Vercel Environment Variables.",
          openTelegram: "Открыть Telegram bot",
          continue: "Продолжить",
          password: "Пароль",
          submit: "Создать аккаунт",
          haveAccount: "Уже есть аккаунт?",
          signIn: "Войти",
        }
      : language === "EN"
        ? {
            title: "Register",
            subtitle: "Create an account and connect a parent through Telegram.",
            name: "Student name",
            email: "Email",
            grade: "Grade",
            parentName: "Parent name",
            parentPhone: "Parent phone number",
            parentHint: "Reports are sent only after the parent connects to the Telegram bot.",
            submitError: "Could not create account. Check the form.",
            success: "Account created. Weekly reports will be sent after Telegram parent verification.",
            inviteTitle: "Telegram code is ready",
            inviteHint: "Send this link to the parent. The bot verifies the parent after opening it.",
            inviteConfigMissing:
              "Telegram bot username is not configured yet. Add TELEGRAM_BOT_USERNAME in Vercel Environment Variables.",
            openTelegram: "Open Telegram bot",
            continue: "Continue",
            password: "Password",
            submit: "Create Account",
            haveAccount: "Already have an account?",
            signIn: "Sign In",
          }
        : {
            title: "Тіркелу",
            subtitle: "Аккаунт ашып, ата-ананы Telegram арқылы қосыңыз.",
            name: "Оқушының аты",
            email: "Электрондық пошта",
            grade: "Сынып",
            parentName: "Ата-ананың аты",
            parentPhone: "Ата-ананың телефон нөмірі",
            parentHint: "Есеп ата-ана Telegram ботқа қосылғаннан кейін ғана жіберіледі.",
            submitError: "Аккаунт ашылмады. Мәліметтерді тексеріңіз.",
            success:
              "Аккаунт ашылды. Ата-анаңыз Telegram арқылы расталғаннан кейін апталық есеп жіберіледі.",
            inviteTitle: "Telegram коды дайын",
            inviteHint:
              "Осы сілтемені ата-анаңызға жіберіңіз. Ата-ана ботты ашқанда код автоматты барады.",
            inviteConfigMissing:
              "Telegram bot username әлі қойылмаған. Vercel Environment Variables ішіне TELEGRAM_BOT_USERNAME қосыңыз.",
            openTelegram: "Telegram bot ашу",
            continue: "Жалғастыру",
            password: "Құпия сөз",
            submit: "Аккаунт ашу",
            haveAccount: "Аккаунтыңыз бар ма?",
            signIn: "Кіру",
          };

  const submitAccount = async (form: HTMLFormElement) => {
    const formData = new FormData(form);

    try {
      setErrorMessage("");

      await registerAccount({
        data: {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          grade: String(formData.get("grade") ?? ""),
          parentName: String(formData.get("parentName") ?? ""),
          parentPhone: String(formData.get("parentPhone") ?? ""),
          password: String(formData.get("password") ?? ""),
        },
      });

      setStatusMessage(copy.success);
      const invite = (await fetch("/api/parent/create-invite", { method: "POST" }).then((response) =>
        response.json(),
      )) as ParentInviteResponse;
      setParentInvite({
        code: invite.inviteCode,
        configured: invite.telegramConfigured,
        link: invite.telegramLink,
      });
    } catch {
      setErrorMessage(copy.submitError);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitAccount(event.currentTarget);
  };

  return (
    <GameLayout>
      <div className="mx-auto max-w-md">
        <GameCard className="bg-white/95">
          <div className="mb-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#6D28D9] text-white shadow-[0_6px_0_#4C1D95]">
              <span className="material-symbols-outlined text-3xl">person_add</span>
            </div>
            <h1 className="mb-3 text-4xl font-black text-[#1E1B4B]">{copy.title}</h1>
            <p className="font-semibold text-[#6B5E8F]">{copy.subtitle}</p>
          </div>

          {parentInvite ? (
            <div className="rounded-[28px] border-2 border-[#DDD6FE] bg-[#F5F3FF] p-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                {copy.inviteTitle}
              </p>
              <p className="mt-2 text-4xl font-black text-[#1E1B4B]">{parentInvite.code}</p>
              <p className="mt-2 font-semibold text-[#6B5E8F]">
                {parentInvite.configured ? copy.inviteHint : copy.inviteConfigMissing}
              </p>
              <div className="mt-5 grid gap-3">
                {parentInvite.configured ? (
                  <a
                    className="rounded-2xl bg-[#FACC15] px-5 py-4 text-center font-black text-[#1E1B4B] shadow-[0_6px_0_#D97706]"
                    href={parentInvite.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.openTelegram}
                  </a>
                ) : null}
                <button
                  className="rounded-2xl bg-[#6D28D9] px-5 py-4 font-black text-white shadow-[0_6px_0_#4C1D95]"
                  type="button"
                  onClick={() => void navigate({ to: "/diagnostic" })}
                >
                  {copy.continue}
                </button>
              </div>
            </div>
          ) : null}

          <form className={`flex flex-col gap-5 ${parentInvite ? "mt-6" : ""}`} onSubmit={handleSubmit}>
            <RegisterInput autoComplete="name" label={copy.name} name="name" type="text" />
            <RegisterInput autoComplete="email" label={copy.email} name="email" type="email" />

            <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
              {copy.grade}
              <select
                className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                name="grade"
                required
              >
                <option value="">-</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </select>
            </label>

            <RegisterInput autoComplete="name" label={copy.parentName} name="parentName" type="text" />
            <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
              {copy.parentPhone}
              <input
                className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                name="parentPhone"
                type="tel"
                autoComplete="tel"
                placeholder="+7 700 123 45 67"
                required
              />
              <span className="text-sm font-semibold text-[#6B5E8F]">
                {statusMessage || copy.parentHint}
              </span>
            </label>

            <RegisterInput
              autoComplete="new-password"
              label={copy.password}
              minLength={6}
              name="password"
              type="password"
            />

            {errorMessage ? (
              <p className="rounded-2xl border-2 border-[#EF4444]/40 bg-[#FEE2E2] px-4 py-3 text-sm font-bold text-[#991B1B]">
                {errorMessage}
              </p>
            ) : null}

            <button
              className="mt-2 h-13 rounded-2xl bg-[#6D28D9] font-black text-white shadow-[0_6px_0_#4C1D95] transition hover:-translate-y-0.5"
              type="submit"
            >
              {copy.submit}
            </button>
          </form>

          <p className="mt-8 text-center font-semibold text-[#6B5E8F]">
            {copy.haveAccount}{" "}
            <Link className="font-black text-[#6D28D9] hover:underline" to="/login">
              {copy.signIn}
            </Link>
          </p>
        </GameCard>
      </div>
    </GameLayout>
  );
}

type ParentInviteResponse = {
  inviteCode: string;
  telegramConfigured: boolean;
  telegramLink: string;
};

function RegisterInput({
  autoComplete,
  label,
  minLength,
  name,
  type,
}: {
  autoComplete: string;
  label: string;
  minLength?: number;
  name: string;
  type: string;
}) {
  return (
    <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
      {label}
      <input
        className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
        name={name}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
    </label>
  );
}
