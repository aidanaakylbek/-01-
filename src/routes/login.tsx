import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { getAccountDashboard, loginAccount } from "@/lib/api/account.functions";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - AI-Sana" },
      { name: "description", content: "Sign in to your AI-Sana account." },
    ],
  }),
  component: Login,
});

function Login() {
  const { language } = useLanguage();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy =
    language === "RU"
      ? {
          title: "Войти",
          subtitle: "Продолжите подготовку к НИШ и БИЛ.",
          email: "Электронная почта",
          password: "Пароль",
          remember: "Запомнить меня",
          forgot: "Забыли пароль?",
          submit: "Войти",
          noAccount: "Нет аккаунта?",
          register: "Регистрация",
          invalid: "Email или пароль неверный.",
        }
      : language === "KZ"
        ? {
            title: "Кіру",
            subtitle: "НЗМ және БИЛ дайындық жолын жалғастырыңыз.",
            email: "Электрондық пошта",
            password: "Құпия сөз",
            remember: "Мені есте сақтау",
            forgot: "Құпия сөзді ұмыттыңыз ба?",
            submit: "Кіру",
            noAccount: "Аккаунтыңыз жоқ па?",
            register: "Тіркелу",
            invalid: "Email немесе құпия сөз дұрыс емес.",
          }
        : {
            title: "Sign In",
            subtitle: "Continue your NIS and BIL preparation.",
            email: "Email",
            password: "Password",
            remember: "Remember me",
            forgot: "Forgot password?",
            submit: "Sign In",
            noAccount: "No account yet?",
            register: "Register",
            invalid: "Email or password is incorrect.",
          };

  useEffect(() => {
    let active = true;

    void getAccountDashboard()
      .then((dashboard) => {
        if (!active || !dashboard.authenticated) {
          return;
        }

        window.location.replace(getClientPostLoginRedirect(dashboard.account));
      })
      .catch(() => {
        // The form below still handles login even if this optional pre-check fails.
      });

    return () => {
      active = false;
    };
  }, []);

  const submitLogin = async (form: HTMLFormElement) => {
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(form);

    try {
      const result = await loginAccount({
        data: {
          email: String(formData.get("email") ?? "").trim().toLowerCase(),
          password: String(formData.get("password") ?? ""),
          remember: formData.get("remember") === "on",
        },
      });

      window.location.assign(result.redirectTo);
    } catch {
      setError(copy.invalid);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitLogin(event.currentTarget);
  };

  return (
    <GameLayout>
      <div className="mx-auto max-w-md">
        <GameCard className="bg-white/95">
          <div className="mb-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#6D28D9] text-white shadow-[0_6px_0_#4C1D95]">
              <span className="material-symbols-outlined text-3xl">login</span>
            </div>
            <h1 className="mb-3 text-4xl font-black text-[#1E1B4B]">{copy.title}</h1>
            <p className="font-semibold text-[#6B5E8F]">{copy.subtitle}</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
              {copy.password}
              <input
                className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 font-semibold text-[#6B5E8F]">
                <input className="h-4 w-4 accent-secondary" name="remember" type="checkbox" />
                {copy.remember}
              </label>
              <button className="font-black text-[#6D28D9] hover:underline" type="button">
                {copy.forgot}
              </button>
            </div>

            {error ? (
              <p className="rounded-2xl border-2 border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-black text-[#EF4444]">
                {error}
              </p>
            ) : null}

            <button
              className="mt-2 h-13 rounded-2xl bg-[#6D28D9] font-black text-white shadow-[0_6px_0_#4C1D95] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
              disabled={isSubmitting}
              type="button"
              onClick={(event) => {
                const form = event.currentTarget.form;

                if (form?.reportValidity()) {
                  void submitLogin(form);
                }
              }}
            >
              {isSubmitting ? "..." : copy.submit}
            </button>
          </form>

          <p className="mt-8 text-center font-semibold text-[#6B5E8F]">
            {copy.noAccount}{" "}
            <Link className="font-black text-[#6D28D9] hover:underline" to="/register">
              {copy.register}
            </Link>
          </p>
        </GameCard>
      </div>
    </GameLayout>
  );
}

type LoginRedirectAccount = {
  diagnosticCompleted: boolean;
  parentPhoneVerified: boolean;
  parentTelegramConnected: boolean;
  role: "student" | "admin";
  subscriptionExpiresAt?: string;
  subscriptionStatus: "inactive" | "active" | "expired" | "cancelled";
  telegramParentVerified: boolean;
};

function getClientPostLoginRedirect(account: LoginRedirectAccount) {
  if (account.role === "admin") {
    return "/home";
  }

  if (
    !account.telegramParentVerified &&
    !(account.parentTelegramConnected && account.parentPhoneVerified)
  ) {
    return "/verify-parent-telegram";
  }

  if (!account.diagnosticCompleted) {
    return "/diagnostic";
  }

  if (!hasClientActiveSubscription(account)) {
    return "/pricing";
  }

  return "/home";
}

function hasClientActiveSubscription(account: LoginRedirectAccount) {
  if (account.subscriptionStatus !== "active") {
    return false;
  }

  if (!account.subscriptionExpiresAt) {
    return true;
  }

  return new Date(account.subscriptionExpiresAt).getTime() > Date.now();
}
