import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent } from "react";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";
import { loginAccount } from "@/lib/api/account.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - AulBridge" },
      { name: "description", content: "Sign in to your AulBridge account." },
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
            subtitle: "НИШ, БИЛ және РФМШ дайындық жолын жалғастырыңыз.",
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
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <section className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant p-8 md:p-10 soft-shadow">
          <div className="mb-8">
            <div className="w-14 h-14 organic-shape-1 bg-secondary text-on-secondary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">login</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-3">
              {copy.title}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{copy.subtitle}</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 font-label-md text-label-md text-primary">
              {copy.email}
              <input
                className="h-12 border border-outline-variant bg-surface px-4 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>

            <label className="flex flex-col gap-2 font-label-md text-label-md text-primary">
              {copy.password}
              <input
                className="h-12 border border-outline-variant bg-surface px-4 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 text-on-surface-variant">
                <input className="w-4 h-4 accent-secondary" name="remember" type="checkbox" />
                {copy.remember}
              </label>
              <button className="text-secondary hover:underline" type="button">
                {copy.forgot}
              </button>
            </div>

            <button
              className="mt-2 h-13 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary-container hover:text-on-secondary-container transition-colors btn-squish"
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

          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            {copy.noAccount}{" "}
            <Link className="text-secondary font-bold hover:underline" to="/register">
              {copy.register}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
