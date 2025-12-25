import { MapPin, UtensilsCrossed, DollarSign, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="pt-12 px-6 text-center">
        <div className="mb-4">
          <h1 className="md:text-6xl font-black tracking-tighter text-pretty leading-7 text-3xl text-center">ESTACIONAMENTO</h1>
          <h2 className="md:text-7xl font-black bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent mt-2 tracking-tight text-5xl">
            FITTIPALDI
          </h2>
        </div>
        <p className="text-muted-foreground mt-6 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
          Seu estacionamento seguro e confiável no coração da cidade
        </p>
      </header>

      {/* CTA Buttons */}
      <div className="flex-1 px-6 py-16 flex flex-col justify-center gap-6 max-w-md mx-auto w-full">
        <Button
          asChild
          size="lg"
          className="h-24 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl transition-all duration-300 hover:shadow-primary/50 active:scale-95"
        >
          <Link href="/localizacao">
            <MapPin className="mr-3 h-10 w-10" />
            <span>Localização</span>
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          className="h-24 text-lg font-bold rounded-2xl border-2 border-primary text-primary hover:bg-primary/20 bg-transparent transition-all duration-300 active:scale-95"
        >
          <Link href="/precos">
            <DollarSign className="mr-3 h-10 w-10" />
            <span>Tabela de Preços</span>
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          className="h-24 text-lg font-bold rounded-2xl border-2 border-primary text-primary hover:bg-primary/20 bg-transparent transition-all duration-300 active:scale-95"
        >
          <Link href="/lanches">
            <UtensilsCrossed className="mr-3 h-10 w-10" />
            <span>Lanches</span>
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          className="h-24 text-lg font-bold rounded-2xl border-2 border-muted text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/20 bg-transparent transition-all duration-300 active:scale-95"
        >
          <Link href="/contato">
            <Phone className="mr-3 h-10 w-10" />
            <span>Contato</span>
          </Link>
        </Button>
      </div>

      {/* Info Section */}
      <section id="horario" className="px-6 py-12 bg-secondary/80 backdrop-blur-sm text-center border-t border-border">
        <h3 className="text-2xl font-bold mb-6 tracking-tight">Horário de Funcionamento</h3>
        <div className="space-y-3 text-sm max-w-sm mx-auto">
          <p className="flex justify-between items-center">
            <span className="text-muted-foreground">Segunda - Sexta:</span>
            <span className="font-bold text-primary">6:30h - 20h</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="text-muted-foreground">Sábado:</span>
            <span className="font-bold text-primary">7h - 17h</span>
          </p>
        </div>
      </section>
    </main>
  )
}
