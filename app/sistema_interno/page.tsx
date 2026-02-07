'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  getMesas,
  getProdutos,
  getPedidosAbertos,
  abrirPedido,
  adicionarItem,
  removerItem,
  fecharPedido,
  cancelarPedido,
  logout,
} from './actions'
import {
  LogOut,
  Plus,
  Trash2,
  X,
  Check,
  ShoppingCart,
  ClipboardList,
  Coffee,
  Car,
} from 'lucide-react'

type Mesa = {
  id_mesa: string
  nr_mesa: number
  id_disponivel: boolean
}

type Produto = {
  id_produto: string
  nm_produto: string
  ds_categoria: string
  vl_preco: number
}

type ItemPedido = {
  id_item: string
  id_pedido: string
  id_produto: string
  nr_quantidade: number
  vl_unitario: number
  vl_subtotal: number
  produtos: { nm_produto: string; ds_categoria: string }
}

type Pedido = {
  id_pedido: string
  id_mesa: string | null
  nm_cliente: string | null
  cd_status: string
  vl_total: number
  ds_observacoes: string | null
  dh_abertura: string
  mesas: { nr_mesa: number } | null
  itens_pedido: ItemPedido[]
}

type ActiveTab = 'mesas' | 'pedidos' | 'adicionar'

export default function SistemaInternoPage() {
  const router = useRouter()
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('mesas')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Modal abrir pedido
  const [showNovoPedido, setShowNovoPedido] = useState(false)
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null)
  const [nomeCliente, setNomeCliente] = useState('')

  // Modal adicionar item
  const [pedidoParaAdicionar, setPedidoParaAdicionar] = useState<Pedido | null>(null)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
  const [quantidadeItem, setQuantidadeItem] = useState(1)

  // Pedido detalhado
  const [pedidoDetalhe, setPedidoDetalhe] = useState<Pedido | null>(null)

  const carregarDados = useCallback(async () => {
    try {
      const [mesasData, produtosData, pedidosData] = await Promise.all([
        getMesas(),
        getProdutos(),
        getPedidosAbertos(),
      ])
      setMesas(mesasData)
      setProdutos(produtosData)
      setPedidos(pedidosData as unknown as Pedido[])
    } catch {
      // erro silencioso
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      carregarDados()
    }
    checkAuth()
  }, [router, carregarDados])

  const handleAbrirPedido = async () => {
    if (!mesaSelecionada) return
    setActionLoading(true)
    try {
      await abrirPedido(mesaSelecionada.id_mesa, nomeCliente)
      setShowNovoPedido(false)
      setMesaSelecionada(null)
      setNomeCliente('')
      await carregarDados()
      setActiveTab('pedidos')
    } catch {
      // erro
    } finally {
      setActionLoading(false)
    }
  }

  const handleAdicionarItem = async (produto: Produto) => {
    if (!pedidoParaAdicionar) return
    setActionLoading(true)
    try {
      await adicionarItem(
        pedidoParaAdicionar.id_pedido,
        produto.id_produto,
        quantidadeItem,
        produto.vl_preco
      )
      setQuantidadeItem(1)
      await carregarDados()
      // Atualizar detalhe do pedido
      const pedidoAtualizado = (await getPedidosAbertos()) as unknown as Pedido[]
      const atualizado = pedidoAtualizado.find(
        (p) => p.id_pedido === pedidoParaAdicionar.id_pedido
      )
      if (atualizado) {
        setPedidoParaAdicionar(atualizado)
        setPedidoDetalhe(atualizado)
      }
    } catch {
      // erro
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoverItem = async (idItem: string) => {
    if (!pedidoDetalhe) return
    setActionLoading(true)
    try {
      await removerItem(idItem, pedidoDetalhe.id_pedido)
      await carregarDados()
      const pedidoAtualizado = (await getPedidosAbertos()) as unknown as Pedido[]
      const atualizado = pedidoAtualizado.find(
        (p) => p.id_pedido === pedidoDetalhe.id_pedido
      )
      if (atualizado) {
        setPedidoDetalhe(atualizado)
      } else {
        setPedidoDetalhe(null)
      }
    } catch {
      // erro
    } finally {
      setActionLoading(false)
    }
  }

  const handleFecharPedido = async (pedido: Pedido) => {
    setActionLoading(true)
    try {
      await fecharPedido(pedido.id_pedido, pedido.id_mesa)
      setPedidoDetalhe(null)
      await carregarDados()
    } catch {
      // erro
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelarPedido = async (pedido: Pedido) => {
    setActionLoading(true)
    try {
      await cancelarPedido(pedido.id_pedido, pedido.id_mesa)
      setPedidoDetalhe(null)
      await carregarDados()
    } catch {
      // erro
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const categorias = [...new Set(produtos.map((p) => p.ds_categoria))]

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Car className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Fittipaldi</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </header>

      {/* Tabs */}
      <nav className="flex border-b border-border bg-card">
        {[
          { key: 'mesas' as ActiveTab, label: 'Mesas', icon: Coffee },
          { key: 'pedidos' as ActiveTab, label: 'Pedidos', icon: ClipboardList },
          { key: 'adicionar' as ActiveTab, label: 'Novo', icon: Plus },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-4">
        {/* === MESAS === */}
        {activeTab === 'mesas' && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">Mesas</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {mesas.map((mesa) => {
                const pedidoMesa = pedidos.find(
                  (p) => p.id_mesa === mesa.id_mesa
                )
                return (
                  <button
                    key={mesa.id_mesa}
                    onClick={() => {
                      if (pedidoMesa) {
                        setPedidoDetalhe(pedidoMesa)
                      } else {
                        setMesaSelecionada(mesa)
                        setShowNovoPedido(true)
                      }
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                      mesa.id_disponivel
                        ? 'border-primary/30 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10'
                        : 'border-destructive/30 bg-destructive/5 text-destructive-foreground hover:border-destructive'
                    }`}
                  >
                    <span className="text-2xl font-bold">{mesa.nr_mesa}</span>
                    <span className="mt-1 text-xs">
                      {mesa.id_disponivel ? 'Livre' : 'Ocupada'}
                    </span>
                    {pedidoMesa && (
                      <span className="mt-1 text-xs font-semibold">
                        R$ {Number(pedidoMesa.vl_total).toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* === PEDIDOS ABERTOS === */}
        {activeTab === 'pedidos' && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Pedidos Abertos ({pedidos.length})
            </h2>
            {pedidos.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhum pedido aberto.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {pedidos.map((pedido) => (
                  <button
                    key={pedido.id_pedido}
                    onClick={() => setPedidoDetalhe(pedido)}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary"
                  >
                    <div>
                      <p className="font-bold text-foreground">
                        Mesa {pedido.mesas?.nr_mesa}
                        {pedido.nm_cliente && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            - {pedido.nm_cliente}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pedido.itens_pedido.length} ite{pedido.itens_pedido.length !== 1 ? 'ns' : 'm'}
                        {' | '}
                        {new Date(pedido.dh_abertura).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      R$ {Number(pedido.vl_total).toFixed(2).replace('.', ',')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === NOVO PEDIDO (selecionar mesa) === */}
        {activeTab === 'adicionar' && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Novo Pedido - Selecione a Mesa
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {mesas
                .filter((m) => m.id_disponivel)
                .map((mesa) => (
                  <button
                    key={mesa.id_mesa}
                    onClick={() => {
                      setMesaSelecionada(mesa)
                      setShowNovoPedido(true)
                    }}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-primary transition-all hover:border-primary hover:bg-primary/10"
                  >
                    <span className="text-3xl font-bold">{mesa.nr_mesa}</span>
                    <span className="mt-1 text-xs">Livre</span>
                  </button>
                ))}
            </div>
            {mesas.filter((m) => m.id_disponivel).length === 0 && (
              <p className="mt-4 text-center text-muted-foreground">
                Todas as mesas estao ocupadas.
              </p>
            )}
          </div>
        )}
      </main>

      {/* === MODAL: Abrir Pedido === */}
      {showNovoPedido && mesaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Abrir Pedido - Mesa {mesaSelecionada.nr_mesa}
              </h3>
              <button
                onClick={() => {
                  setShowNovoPedido(false)
                  setMesaSelecionada(null)
                  setNomeCliente('')
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Nome do cliente (opcional)"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="mb-4 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <Button
              onClick={handleAbrirPedido}
              disabled={actionLoading}
              className="h-12 w-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
            >
              {actionLoading ? 'Abrindo...' : 'Abrir Pedido'}
            </Button>
          </div>
        </div>
      )}

      {/* === MODAL: Detalhe do Pedido === */}
      {pedidoDetalhe && !pedidoParaAdicionar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 sm:items-center sm:p-4">
          <div className="flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border bg-card sm:max-w-lg sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Mesa {pedidoDetalhe.mesas?.nr_mesa}
                </h3>
                {pedidoDetalhe.nm_cliente && (
                  <p className="text-sm text-muted-foreground">{pedidoDetalhe.nm_cliente}</p>
                )}
              </div>
              <button
                onClick={() => setPedidoDetalhe(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Itens */}
            <div className="flex-1 overflow-y-auto p-4">
              {pedidoDetalhe.itens_pedido.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  Nenhum item adicionado.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {pedidoDetalhe.itens_pedido.map((item) => (
                    <div
                      key={item.id_item}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {item.nr_quantidade}x {item.produtos.nm_produto}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          R$ {Number(item.vl_unitario).toFixed(2).replace('.', ',')} un.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">
                          R$ {Number(item.vl_subtotal).toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          onClick={() => handleRemoverItem(item.id_item)}
                          disabled={actionLoading}
                          className="text-muted-foreground hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  R$ {Number(pedidoDetalhe.vl_total).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPedidoParaAdicionar(pedidoDetalhe)
                    setCategoriaSelecionada(categorias[0] || '')
                  }}
                  className="flex-1 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
                <Button
                  onClick={() => handleFecharPedido(pedidoDetalhe)}
                  disabled={actionLoading || pedidoDetalhe.itens_pedido.length === 0}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Fechar
                </Button>
                <Button
                  onClick={() => handleCancelarPedido(pedidoDetalhe)}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-destructive text-destructive-foreground hover:bg-destructive hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: Adicionar Item ao Pedido === */}
      {pedidoParaAdicionar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 sm:items-center sm:p-4">
          <div className="flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border bg-card sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-bold text-foreground">
                Adicionar Item - Mesa {pedidoParaAdicionar.mesas?.nr_mesa}
              </h3>
              <button
                onClick={() => {
                  setPedidoParaAdicionar(null)
                  setQuantidadeItem(1)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Categorias */}
            <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSelecionada(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    categoriaSelecionada === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}
                >
                  {cat.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Quantidade */}
            <div className="flex items-center justify-center gap-4 border-b border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Qtd:</span>
              <button
                onClick={() => setQuantidadeItem(Math.max(1, quantidadeItem - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground hover:border-primary"
              >
                -
              </button>
              <span className="w-8 text-center text-lg font-bold text-foreground">
                {quantidadeItem}
              </span>
              <button
                onClick={() => setQuantidadeItem(quantidadeItem + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground hover:border-primary"
              >
                +
              </button>
            </div>

            {/* Produtos */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                {produtos
                  .filter((p) => p.ds_categoria === categoriaSelecionada)
                  .map((produto) => (
                    <button
                      key={produto.id_produto}
                      onClick={() => handleAdicionarItem(produto)}
                      disabled={actionLoading}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {produto.nm_produto}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        R$ {Number(produto.vl_preco).toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
