import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent } from "react";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";
import { loginAccount } from "@/lib/api/account.functions";

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
  const navigate = useNavigate();
  const { language } = useLanguage();

  const copy =
    language === "RU"
      ? {
          title: "Войти",
          subtitle: "Продолжите подготовку к НИШ, БИЛ и РФМШ.",
          email: "Электронная почта",
          password: "Пароль",
          remember: "Запомнить меня",
          forgot: "Забыли пароль?",
          submit: "Войти",
          noAccount: "Нет аккаунта?",
          register: "Регистрация",
        }
      : language === "KZ"
        ? {
            title: "Кіру",
            subtitle: "НЗМ, БИЛ және РФММ дайындық жолын жалғастырыңыз.",
            email: "Электрондық пошта",
            password: "Құпия сөз",
            remember: "Мені есте сақтау",
            forgot: "Құпия сөзді ұмыттыңыз ба?",
            submit: "Кіру",
            noAccount: "Аккаунтыңыз жоқ па?",
            register: "Тіркелу",
          }
        : {
            title: "Sign In",
            subtitle: "Continue your NIS, BIL, and NSPM preparation.",
            email: "Email",
            password: "Password",
            remember: "Remember me",
            forgot: "Forgot password?",
            submit: "Sign In",
            noAccount: "No account yet?",
            register: "Register",
          };

  const submitLogin = async (form: HTMLFormElement) => {
    const formData = new FormData(form);

    await loginAccount({
      data: {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
    });

    void navigate({ to: "/home" });
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
                <input className="w-4 h-4 accent-secondary" name="remember" type="checkbox" />
                {copy.remember}
              </label>
              <button className="font-black text-[#6D28D9] hover:underline" type="button">
                {copy.forgot}
              </button>
            </div>

            <button
              className="mt-2 h-13 rounded-2xl bg-[#6D28D9] font-black text-white shadow-[0_6px_0_#4C1D95] transition hover:-translate-y-0.5"
              type="button"
              onClick={(event) => {
                const form = event.currentTarget.form;

                if (form?.reportValidity()) {
                  void submitLogin(form);
                }
              }}
            >
              {copy.submit}
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

