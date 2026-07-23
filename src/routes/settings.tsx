import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { AibiMark } from "@/components/aibi-mark";
import { getAccountDashboard } from "@/lib/api/account.functions";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/settings")({
  loader: async () => getAccountDashboard(),
  head: () => ({ meta: [{ title: "Profile — AI-Sana" }] }),
  component: ProfilePage,
});

type DashboardData = Awaited<ReturnType<typeof getAccountDashboard>>;

export function ProfilePage() {
  const dashboard = Route.useLoaderData();
  return <ProfileContent dashboard={dashboard} />;
}

export function ProfileContent({ dashboard }: { dashboard: DashboardData }) {
  const { language } = useLanguage();
  const title = language === "RU" ? "Профиль ученика" : language === "EN" ? "Student Profile" : "Оқушы профилі";

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <AibiMark size="lg" className="h-24 w-24 bg-white" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
                  Level 1 · Purple League
                </p>
                <h1 className="mt-2 text-4xl font-black">{title}</h1>
                <p className="mt-1 text-[#EDE9FE]">{dashboard.account.name}</p>
              </div>
            </div>
            <div className="rounded-[24px] bg-white/15 p-5 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-[#FACC15]">
                Sana Coins
              </p>
              <p className="text-4xl font-black">💎 0</p>
            </div>
          </div>
        </GameCard>

        <section className="grid gap-4 md:grid-cols-4">
          <GameCard><p className="font-black text-[#6B5E8F]">XP</p><p className="text-3xl font-black">0</p></GameCard>
          <GameCard><p className="font-black text-[#6B5E8F]">Streak</p><p className="text-3xl font-black">🔥 0</p></GameCard>
          <GameCard><p className="font-black text-[#6B5E8F]">Badges</p><p className="text-3xl font-black">🏅 0</p></GameCard>
          <GameCard><p className="font-black text-[#6B5E8F]">Accuracy</p><p className="text-3xl font-black">0%</p></GameCard>
        </section>

        <GameCard>
          <h2 className="text-2xl font-black">Study history</h2>
          <ProgressBar value={0} />
          <p className="mt-5 rounded-2xl bg-[#F5F3FF] p-4 font-black text-[#6B5E8F]">
            Оқу тарихы бірінші диагностикадан кейін пайда болады.
          </p>
        </GameCard>

      </div>
    </GameLayout>
  );
}
