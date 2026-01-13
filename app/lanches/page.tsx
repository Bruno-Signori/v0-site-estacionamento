"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Minus,
  MessageCircle,
  Coffee,
  Sandwich,
  Pizza,
  Cookie,
  Trash,
  UtensilsCrossed,
} from "lucide-react"
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
  { id: "p1", nome: "Carne", preco: 9.0 },
  { id: "p2", nome: "Frango", preco: 10.0 },
  { id: "p3", nome: "Carne e Queijo", preco: 10.0 },
  { id: "p4", nome: "Queijo", preco: 11.0 },
  { id: "p5", nome: "Queijo e Presunto", preco: 10.0 },
  { id: "p6", nome: "Chocolate Preto", preco: 11.0 },
  { id: "p7", nome: "Chocolate Branco", preco: 11.0 },
  { id: "p8", nome: "Chocolate Misto", preco: 11.0 },
]

const xis: Item[] = [
  { id: "h1", nome: "Hamburguer", preco: 16.0 },
  { id: "h2", nome: "X-Especial", preco: 17.0 },
]

const torradas: Item[] = [{ id: "t1", nome: "Torrada Completa", preco: 10.0 }]

const paesDeQueijo: Item[] = [{ id: "pq1", nome: "Pão de Queijo (unidade)", preco: 5.0 }]

const bebidas: Item[] = [
  { id: "b1", nome: "Café", preco: 5.0 },
  { id: "b2", nome: "Café com Leite", preco: 5.0 },
  { id: "b3", nome: "Coca 220ml", preco: 4.0 },
  { id: "b4", nome: "Coca 350ml", preco: 6.0 },
  { id: "b5", nome: "Coca 600ml", preco: 8.0 },
  { id: "b6", nome: "Coca 2L", preco: 15.0 },
  { id: "b7", nome: "Energetico Monster", preco: 13.0 },
  { id: "b8", nome: "Red Bull", preco: 13.0 },
  { id: "b9", nome: "Gatorade", preco: 9.0 },
]

const diversos: Item[] = [
  { id: "d1", nome: "Espetinho", preco: 12.0 },
  // Chocolates
  { id: "d2", nome: "Snickers", preco: 6.0 },
  { id: "d3", nome: "Sonho De Valsa", preco: 2.0 },
  { id: "d4", nome: "Ouro Branco", preco: 2.0 },
  { id: "d5", nome: "Trento Tradicional", preco: 5.0 },
  { id: "d6", nome: "Trento Branco", preco: 5.0 },
  { id: "d7", nome: "Trento Dark", preco: 5.0 },
  { id: "d8", nome: "Lacta Shot", preco: 12.0 },
  { id: "d9", nome: "Lacta Oreo", preco: 12.0 },
  { id: "d10", nome: "Lacta Ao Leite", preco: 12.0 },
  { id: "d11", nome: "Lacta Tamanho Família", preco: 16.0 },
  { id: "d12", nome: "Kinder Bueno", preco: 10.0 },

  // Salgadinhos
  { id: "d13", nome: "Doritos", preco: 12.0 },
  { id: "d14", nome: "Ruffles", preco: 12.0 },
  { id: "d15", nome: "Fandangos", preco: 12.0 },
  { id: "d16", nome: "Cheetos Assado", preco: 12.0 },
  { id: "d17", nome: "Baconzitos", preco: 12.0 },
  { id: "d18", nome: "Cebolitos", preco: 12.0 },
  { id: "d19", nome: "Stiksy", preco: 12.0 },
  { id: "d20", nome: "Pingo d’Ouro", preco: 12.0 },
  { id: "d21", nome: "Takis", preco: 10.0 },
  { id: "d22", nome: "Crocantíssimo", preco: 8.0 },

  // Doces e gomas
  { id: "d23", nome: "Mentos", preco: 3.5 },
  { id: "d24", nome: "Trident", preco: 3.5 },
  { id: "d25", nome: "Fruit-tella", preco: 4.5 },
  { id: "d26", nome: "Tic Tac", preco: 4.0 },

  // Barras e outros
  { id: "d27", nome: "Barra Nutry", preco: 5.0 },
  { id: "d28", nome: "Amendoim Iracema", preco: 8.0 },
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

  const todosItens = [...pasteis, ...xis, ...torradas, ...paesDeQueijo, ...bebidas, ...diversos]
  const itensSelecionados = todosItens.filter((item) => quantidades[item.id] > 0)
  const valorTotal = itensSelecionados.reduce((acc, item) => acc + item.preco * quantidades[item.id], 0)

  const enviarPedido = () => {
    let mensagem = "🍴 *Pedido - Estacionamento Fittipaldi*\n\n"

    itensSelecionados.forEach((item) => {
      mensagem += `✔ ${item.nome} — ${quantidades[item.id]}x ${item.preco.toFixed(2).replace(".", ",")}\n`
    })

    mensagem += `\n*Total: R$ ${valorTotal.toFixed(2).replace(".", ",")}*`

    if (observacoes.trim()) {
      mensagem += `\n\n📝 Observações:\n${observacoes}`
    }

    const numeroWhatsApp = "555499710222"
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

      <div className="flex-1 py-6 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-3">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 h-auto gap-3 bg-transparent p-0">
            <TabsTrigger
              value="pasteis"
              className={`text-xs sm:text-sm py-4 px-3 rounded-lg border-2 transition-all font-semibold flex flex-col items-center justify-center ${
                activeTab === "pasteis"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Pizza className="h-5 w-5 mb-1" />
              <span className="truncate">Pastéis</span>
            </TabsTrigger>

            <TabsTrigger
              value="xis"
              className={`text-xs sm:text-sm py-4 px-3 rounded-lg border-2 transition-all font-semibold flex flex-col items-center justify-center ${
                activeTab === "xis"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Sandwich className="h-5 w-5 mb-1" />
              <span className="truncate text-xs">Xis e Burgers</span>
            </TabsTrigger>
            <TabsTrigger
              value="torradas"
              className={`text-xs sm:text-sm py-4 px-3 rounded-lg border-2 transition-all font-semibold flex flex-col items-center justify-center ${
                activeTab === "torradas"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Cookie className="h-5 w-5 mb-1" />
              <span className="truncate">Torradas</span>
            </TabsTrigger>
            <TabsTrigger
              value="pao"
              className={`text-xs sm:text-sm py-4 px-3 rounded-lg border-2 transition-all font-semibold flex flex-col items-center justify-center ${
                activeTab === "pao"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Cookie className="h-5 w-5 mb-1" />
              <span className="truncate">Pão Queijo</span>
            </TabsTrigger>
            <TabsTrigger
              value="bebidas"
              className={`text-xs sm:text-sm py-4 px-3 rounded-lg border-2 transition-all font-semibold flex flex-col items-center justify-center ${
                activeTab === "bebidas"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Coffee className="h-5 w-5 mb-1" />
              <span className="truncate">Bebidas</span>
            </TabsTrigger>

            <TabsTrigger
              value="diversos"
              className={`text-xs sm:text-sm py-4 px-3 rounded-lg border-2 transition-all font-semibold flex flex-col items-center justify-center ${
                activeTab === "diversos"
                  ? "border-primary border-4 text-primary bg-transparent"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              <UtensilsCrossed className="h-5 w-5 mb-1" />
              <span className="truncate">Diversos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pasteis" className="mt-8">
            <ItemList
              items={pasteis}
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

          <TabsContent value="diversos" className="mt-6">
            <ItemList
              items={diversos}
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
              placeholder="Ex: sem ovo, bem passado, etc..."
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
                <Trash />
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
