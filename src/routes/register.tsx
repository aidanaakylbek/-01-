import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent } from "react";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";
import { registerAccount } from "@/lib/api/account.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register - Aibi" },
      { name: "description", content: "Create your Aibi student account." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const copy =
    language === "RU"
      ? {
          title: "Регистрация",
          subtitle: "Создайте аккаунт и начните персональную подготовку.",
          name: "Имя ученика",
          email: "Электронная почта",
          grade: "Класс",
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
            password: "Password",
            submit: "Create Account",
            haveAccount: "Already have an account?",
            signIn: "Sign In",
          };

  const submitAccount = async (form: HTMLFormElement) => {
    const formData = new FormData(form);

    await registerAccount({
      data: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        grade: String(formData.get("grade") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
    });

    void navigate({ to: "/diagnostic" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitAccount(event.currentTarget);
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <section className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant p-8 md:p-10 soft-shadow">
          <div className="mb-8">
            <div className="w-14 h-14 organic-shape-2 bg-secondary text-on-secondary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">person_add</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-3">
              {copy.title}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{copy.subtitle}</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 font-label-md text-label-md text-primary">
              {copy.name}
              <input
                className="h-12 border border-outline-variant bg-surface px-4 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </label>

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
              {copy.grade}
              <select
                className="h-12 border border-outline-variant bg-surface px-4 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
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

            <label className="flex flex-col gap-2 font-label-md text-label-md text-primary">
              {copy.password}
              <input
                className="h-12 border border-outline-variant bg-surface px-4 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <button
              className="mt-2 h-13 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary-container hover:text-on-secondary-container transition-colors btn-squish"
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

          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            {copy.haveAccount}{" "}
            <Link className="text-secondary font-bold hover:underline" to="/login">
              {copy.signIn}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
