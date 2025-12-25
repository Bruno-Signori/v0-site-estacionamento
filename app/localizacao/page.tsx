import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"

export default function Localizacao() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header com botão voltar */}
      <header className="pt-6 px-6">
        <Button asChild variant="outline" size="sm" className="mb-4 bg-transparent">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-pretty">Localização</h1>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-secondary/50 p-6 rounded-lg border border-border">
            <h2 className="font-bold text-lg mb-3">Estacionamento Fittipaldi</h2>
            <p className="text-sm mb-4">Rua Teixeira Soares, 768 - Centro</p>
            <p className="text-sm text-muted-foreground mb-4">
              Localizado ao lado do Hospital São Vicente de Paulo
            </p>
            <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="https://maps.google.com/?q=estacionamento+fittipaldi" target="_blank" rel="noopener noreferrer">
                Abrir no Google Maps
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
