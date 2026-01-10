import Link from "next/link"
import { ArrowLeft, Car, Truck, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"

export default function Precos() {
  const precosVeiculos = [
    {
      tipo: "CARRO",
      icone: Car,
      precos: [
        { label: "1° Hora", valor: "R$ 8,00" },
        { label: "Demais Horas", valor: "R$ 8,00" },
        { label: "Diária", valor: "R$ 60,00" },
      ],
    },
    {
      tipo: "CAMIONETE",
      icone: Truck,
      precos: [
        { label: "1° Hora", valor: "R$ 10,00" },
        { label: "2° Hora", valor: "R$ 10,00" },
        { label: "Demais Horas", valor: "R$ 8,00" },
        { label: "Diária", valor: "R$ 60,00" },
      ],
    },
    {
      tipo: "MOTO",
      icone: Bike,
      precos: [
        { label: "1° Hora", valor: "R$ 5,00" },
        { label: "Demais Horas", valor: "R$ 5,00" },
        { label: "Diária", valor: "R$ 40,00" },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="pt-6 px-6">
        <Button asChild variant="outline" size="sm" className="mb-4 bg-transparent">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-4xl font-bold text-pretty">Tabela de Preços</h1>
      </header>

      {/* Conteúdo - Tabelas por Tipo de Veículo */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {precosVeiculos.map((veiculo, idx) => {
            const IconComponent = veiculo.icone
            return (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-primary">
                  <IconComponent className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold text-primary">{veiculo.tipo}</h2>
                </div>

                {/* Tabela de preços */}
                <div className="grid gap-3">
                  {veiculo.precos.map((preco, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <span className="font-semibold text-sm md:text-base">{preco.label}</span>
                      <span className="font-bold text-primary text-lg">{preco.valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
