import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";
import { registerAccount, requestParentWhatsAppVerification } from "@/lib/api/account.functions";

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
  const [verificationState, setVerificationState] = useState<"idle" | "sending" | "sent">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const copy =
    language === "RU"
      ? {
          title: "Регистрация",
          subtitle: "Создайте аккаунт и начните персональную подготовку.",
          name: "Имя ученика",
          email: "Электронная почта",
          grade: "Класс",
          parentWhatsApp: "WhatsApp родителя",
          sendCode: "Отправить код",
          sendingCode: "Отправляем...",
          code: "Код из WhatsApp",
          codeHint: "Код действует 10 минут. Без подтверждения отчет не будет привязан к родителю.",
          codeSent: "Код отправлен на",
          codeError: "Не получилось отправить код. Проверьте WhatsApp API и номер родителя.",
          submitError: "Не получилось создать аккаунт. Проверьте код из WhatsApp.",
          password: "Пароль",
          submit: "Создать аккаунт",
          haveAccount: "Уже есть аккаунт?",
          signIn: "Войти",
        }
      : language === "KZ"
        ? {
            title: "Тіркелу",
            subtitle: "Аккаунт ашып, жеке дайындықты бастаңыз.",
            name: "Оқушының аты",
            email: "Электрондық пошта",
            grade: "Сынып",
            parentWhatsApp: "Ата-ананың WhatsApp нөмірі",
            sendCode: "Код жіберу",
            sendingCode: "Жіберіліп жатыр...",
            code: "WhatsApp-тағы код",
            codeHint: "Код 10 минут жарамды. Расталмаса, отчет ата-анаға байланыспайды.",
            codeSent: "Код жіберілді:",
            codeError: "Код жіберілмеді. WhatsApp API мен ата-ана номерін тексеріңіз.",
            submitError: "Аккаунт ашылмады. WhatsApp кодын тексеріңіз.",
            password: "Құпия сөз",
            submit: "Аккаунт ашу",
            haveAccount: "Аккаунтыңыз бар ма?",
            signIn: "Кіру",
          }
        : {
            title: "Register",
            subtitle: "Create an account and start personalized preparation.",
            name: "Student name",
            email: "Email",
            grade: "Grade",
            parentWhatsApp: "Parent WhatsApp",
            sendCode: "Send code",
            sendingCode: "Sending...",
            code: "WhatsApp code",
            codeHint: "The code is valid for 10 minutes. Reports need a verified parent number.",
            codeSent: "Code sent to",
            codeError: "Could not send the code. Check WhatsApp API and parent number.",
            submitError: "Could not create account. Check the WhatsApp code.",
            password: "Password",
            submit: "Create Account",
            haveAccount: "Already have an account?",
            signIn: "Sign In",
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
          parentWhatsApp: String(formData.get("parentWhatsApp") ?? ""),
          parentWhatsAppVerificationCode: String(
            formData.get("parentWhatsAppVerificationCode") ?? "",
          ),
          password: String(formData.get("password") ?? ""),
        },
      });

      void navigate({ to: "/diagnostic" });
    } catch {
      setErrorMessage(copy.submitError);
    }
  };

  const sendParentCode = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const studentName = String(formData.get("name") ?? "");
    const parentWhatsApp = String(formData.get("parentWhatsApp") ?? "");

    if (!studentName.trim() || !parentWhatsApp.trim()) {
      form.reportValidity();
      return;
    }

    try {
      setVerificationState("sending");
      setErrorMessage("");
      setStatusMessage("");

      const result = await requestParentWhatsAppVerification({
        data: { studentName, parentWhatsApp },
      });

      setVerificationState("sent");
      setStatusMessage(`${copy.codeSent} ${result.phone}`);
    } catch {
      setVerificationState("idle");
      setErrorMessage(copy.codeError);
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

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
              {copy.name}
              <input
                className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </label>

            <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
              {copy.email}
              <input
                className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>

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

            <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
              {copy.parentWhatsApp}
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                  name="parentWhatsApp"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 700 123 45 67"
                  required
                />
                <button
                  className="h-13 rounded-2xl border-2 border-[#8B5CF6] px-5 font-black text-[#6D28D9] transition hover:bg-[#6D28D9] hover:text-white disabled:opacity-60"
                  type="button"
                  disabled={verificationState === "sending"}
                  onClick={(event) => {
                    const form = event.currentTarget.form;

                    if (form) {
                      void sendParentCode(form);
                    }
                  }}
                >
                  {verificationState === "sending" ? copy.sendingCode : copy.sendCode}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
              {copy.code}
              <input
                className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                name="parentWhatsAppVerificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                placeholder="123456"
                required
              />
              <span className="text-sm font-semibold text-[#6B5E8F]">
                {statusMessage || copy.codeHint}
              </span>
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border-2 border-[#EF4444]/40 bg-[#FEE2E2] px-4 py-3 text-sm font-bold text-[#991B1B]">
                {errorMessage}
              </p>
            ) : null}

            <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
              {copy.password}
              <input
                className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <button
              className="mt-2 h-13 rounded-2xl bg-[#6D28D9] font-black text-white shadow-[0_6px_0_#4C1D95] transition hover:-translate-y-0.5"
              type="button"
              onClick={(event) => {
                const form = event.currentTarget.form;

                if (form?.reportValidity()) {
                  void submitAccount(form);
                }
              }}
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

