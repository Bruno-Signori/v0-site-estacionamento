import Link from "next/link"
import { ArrowLeft, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"

export default function Contato() {
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
        <h1 className="text-3xl font-bold text-pretty">Contato</h1>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-md mx-auto space-y-4">
          {/* WhatsApp */}
          <Button
            asChild
            size="lg"
            className="w-full h-16 text-base font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a href="https://wa.me/54999710222">
              <Phone className="mr-2 h-5 w-5" />
              Enviar mensagem no WhatsApp
            </a>
          </Button>

          {/* Telefone */}
          <div className="bg-secondary/50 p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-bold">Telefone</span>
            </div>
            <a href="tel:999710182" className="text-lg font-semibold text-primary hover:underline">
              (54) 999710182
            </a>
          </div>

          {/* Telefone */}
          <div className="bg-secondary/50 p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-bold">Telefone</span>
            </div>
            <a href="tel:999710222" className="text-lg font-semibold text-primary hover:underline">
              (54) 999710222
            </a>
          </div>

          {/* Email */}
          <div className="bg-secondary/50 p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-bold">Email</span>
            </div>
            <a
              href="mailto:brunowsignori@gmail.com"
              className="text-base font-semibold text-primary hover:underline break-all"
            >
              brunowsignori@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
