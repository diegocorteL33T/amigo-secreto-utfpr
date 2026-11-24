import { FundoFlocos } from "@/components/FundoFlocos";
import { BotaoAnimacoes } from "@/components/BotaoAnimacoes";
import { Marca } from "@/components/Marca";
import { TelaCriar } from "@/components/TelaCriar";

export default function Home() {
  return (
    <>
      <FundoFlocos tema="claro" />
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 md:px-8 lg:px-12">
        <header className="flex h-16 items-center justify-between">
          <Marca />
          <BotaoAnimacoes className="-mr-2.5" />
        </header>
        <main className="flex-1 pb-16 pt-2 lg:pt-8">
          <TelaCriar />
        </main>
      </div>
    </>
  );
}
