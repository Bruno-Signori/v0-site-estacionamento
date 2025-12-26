"use client"

import Link from "next/link"
import { ArrowLeft, Plus, Minus, MessageCircle, Coffee, Sandwich, Pizza, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Footer from "@/components/footer"
import { useState } from "react"

interface Item {
  id: string
  nome: string
  preco: number
}

const pasteis: Item[] = [
  { id: "p1", nome: "Carne", preco: 8.0 },
  { id: "p3", nome: "Queijo", preco: 10.0 },
  { id: "p4", nome: "Carne e Queijo", preco: 10.0 },
  { id: "p5", nome: "Queijo e Presunto", preco: 10.0},
  { id: "p6", nome: "Chocolate Preto", preco: 10.0 },
  { id: "p7", nome: "Chocolate Branco", preco: 10.0 },
  { id: "p8", nome: "Chocolate Misto", preco: 10.0 },
]

const hamburgueres: Item[] = [
  { id: "h1", nome: "X-Burger", preco: 16.0 },
  { id: "h2", nome: "X-Especial", preco: 16.0 },

]

const xis: Item[] = [
  { id: "h1", nome: "X-Burger", preco: 16.0 },
  { id: "h2", nome: "X-Especial", preco: 16.0 },
]

const torradas: Item[] = [
  { id: "t1", nome: "Torrada Simples", preco: 5.0 },
  { id: "t2", nome: "Torrada com Queijo", preco: 7.0 },
  { id: "t3", nome: "Torrada com Presunto e Queijo", preco: 9.0 },
  { id: "t4", nome: "Torrada Mista Completa", preco: 12.0 },
]

const paesDeQueijo: Item[] = [
  { id: "pq1", nome: "Pão de Queijo (unidade)", preco: 5.0 },
]

const bebidas: Item[] = [
  { id: "b1", nome: "Café", preco: 5.0 },
  { id: "b2", nome: "Café com Leite", preco: 5.0 },
]

function ItemList({
  items,
  quantidades,
  aumentar,
  diminuir,
}: {
  items: Item[]
  quantidades: Record<string, number>
  aumentar: (id: string) => void
  diminuir: (id: string) => void
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {items.map((item) => {
        const qtd = quantidades[item.id] || 0
        const selecionado = qtd > 0

        return (
          <div
            key={item.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              selecionado ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{item.nome}</h3>
                <p className="text-primary font-bold text-xl">R$ {item.preco.toFixed(2).replace(".", ",")}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => diminuir(item.id)}
                  disabled={qtd === 0}
                  className="h-10 w-10 rounded-full"
                >
                  <Minus className="h-5 w-5" />
                </Button>

                <span className="font-bold text-2xl min-w-[2rem] text-center">{qtd}</span>

                <Button
                  variant="default"
                  size="icon"
                  onClick={() => aumentar(item.id)}
                  className="h-10 w-10 rounded-full"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Lanches() {
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [observacoes, setObservacoes] = useState("")
  const [activeTab, setActiveTab] = useState("pasteis")

  const aumentarQuantidade = (id: string) => {
    setQuantidades((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }))
  }

  const diminuirQuantidade = (id: string) => {
    setQuantidades((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }))
  }

  const limparCarrinho = () => {
    setQuantidades({})
    setObservacoes("")
  }

  const todosItens = [...pasteis, ...hamburgueres, ...xis, ...torradas, ...paesDeQueijo, ...bebidas]
  const itensSelecionados = todosItens.filter((item) => quantidades[item.id] > 0)
  const valorTotal = itensSelecionados.reduce((acc, item) => acc + item.preco * quantidades[item.id], 0)

  const enviarPedido = () => {
    let mensagem = "🍴 *Pedido - Estacionamento Fittipaldi*\n\n"

    itensSelecionados.forEach((item) => {
      mensagem += `✔ ${item.nome} — ${quantidades[item.id]}x\n`
    })

    mensagem += `\n*Total: R$ ${valorTotal.toFixed(2).replace(".", ",")}*`

    if (observacoes.trim()) {
      mensagem += `\n\n📝 Observações:\n${observacoes}`
    }

    const numeroWhatsApp = "5554996127617" // Substitua pelo número real
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`
    window.open(url, "_blank")
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col pb-32">
      <header className="pt-6 px-6">
        <Button asChild variant="outline" size="sm" className="mb-4 bg-transparent">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-pretty">Cardápio</h1>
        <p className="text-muted-foreground mt-2">Confira nossas opções de lanches e bebidas</p>
      </header>

      <div className="flex-1 py-6 px-[16x]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="pasteis"
              className={`text-xs sm:text-sm py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
                activeTab === "pasteis"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Pizza className="mr-2 h-4 w-4" />
              Pastéis
            </TabsTrigger>
            
            <TabsTrigger
              value="xis"
              className={`text-xs sm:text-sm py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
                activeTab === "xis"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Sandwich className="mr-2 h-4 w-4" />
              Xis
            </TabsTrigger>
            <TabsTrigger
              value="torradas"
              className={`text-xs sm:text-sm py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
                activeTab === "torradas"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Cookie className="mr-2 h-4 w-4" />
              Torradas
            </TabsTrigger>
            <TabsTrigger
              value="pao"
              className={`text-xs sm:text-sm py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
                activeTab === "pao"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Cookie className="mr-2 h-4 w-4" />
              Pão Queijo
            </TabsTrigger>
            <TabsTrigger
              value="bebidas"
              className={`text-xs sm:text-sm py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
                activeTab === "bebidas"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Bebidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pasteis" className="mt-6">
            <ItemList
              items={pasteis}
              quantidades={quantidades}
              aumentar={aumentarQuantidade}
              diminuir={diminuirQuantidade}
            />
          </TabsContent>

          <TabsContent value="hamburgueres" className="mt-6">
            <ItemList
              items={hamburgueres}
              quantidades={quantidades}
              aumentar={aumentarQuantidade}
              diminuir={diminuirQuantidade}
            />
          </TabsContent>

          <TabsContent value="xis" className="mt-6">
            <ItemList
              items={xis}
              quantidades={quantidades}
              aumentar={aumentarQuantidade}
              diminuir={diminuirQuantidade}
            />
          </TabsContent>

          <TabsContent value="torradas" className="mt-6">
            <ItemList
              items={torradas}
              quantidades={quantidades}
              aumentar={aumentarQuantidade}
              diminuir={diminuirQuantidade}
            />
          </TabsContent>

          <TabsContent value="pao" className="mt-6">
            <ItemList
              items={paesDeQueijo}
              quantidades={quantidades}
              aumentar={aumentarQuantidade}
              diminuir={diminuirQuantidade}
            />
          </TabsContent>

          <TabsContent value="bebidas" className="mt-6">
            <ItemList
              items={bebidas}
              quantidades={quantidades}
              aumentar={aumentarQuantidade}
              diminuir={diminuirQuantidade}
            />
          </TabsContent>
        </Tabs>

        {itensSelecionados.length > 0 && (
          <div className="max-w-2xl mx-auto mt-6">
            <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
            <Textarea
              placeholder="Ex: sem cebola, bem passado..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="resize-none bg-card"
              rows={3}
            />
          </div>
        )}
      </div>

      {itensSelecionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-primary p-6 shadow-2xl z-50">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Seu Pedido:</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {itensSelecionados.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.nome} × {quantidades[item.id]}
                    </span>
                    <span className="font-semibold">
                      R$ {(item.preco * quantidades[item.id]).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-border">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-2xl text-primary">R$ {valorTotal.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={limparCarrinho}
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full flex-shrink-0 bg-transparent"
                title="Limpar carrinho"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </Button>
              <Button onClick={enviarPedido} className="flex-1 h-12 text-base font-bold" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Enviar pedido
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
