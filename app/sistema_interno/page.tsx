"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  getMesas,
  getProdutos,
  getPedidosAbertos,
  getPedidosFechados,
  abrirPedidoMesa,
  abrirPedidoBalcao,
  adicionarItem,
  removerItem,
  fecharPedido,
  cancelarPedido,
  logout,
} from "./actions";
import {
  LogOut,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  ShoppingCart,
  ClipboardList,
  Coffee,
  Car,
  BarChart3,
  User,
  ChevronLeft,
} from "lucide-react";

type Mesa = {
  id_mesa: string;
  nr_mesa: number;
  id_disponivel: boolean;
};

type Produto = {
  id_produto: string;
  nm_produto: string;
  ds_categoria: string;
  vl_preco: number;
};

type ItemPedido = {
  id_item: string;
  id_pedido: string;
  id_produto: string;
  nr_quantidade: number;
  vl_unitario: number;
  vl_subtotal: number;
  produtos: { nm_produto: string; ds_categoria: string };
};

type Pedido = {
  id_pedido: string;
  id_mesa: string | null;
  nm_cliente: string | null;
  cd_status: string;
  vl_total: number;
  ds_observacoes: string | null;
  dh_abertura: string;
  dh_fechamento: string | null;
  mesas: { nr_mesa: number } | null;
  itens_pedido: ItemPedido[];
};

type ActiveTab = "mesas" | "pedidos" | "novo" | "relatorio";

// Carrinho temporario ao montar pedido
type CarrinhoItem = {
  produto: Produto;
  quantidade: number;
};

export default function SistemaInternoPage() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("mesas");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Novo pedido
  const [tipoPedido, setTipoPedido] = useState<"mesa" | "balcao" | null>(null);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [nomeCliente, setNomeCliente] = useState("");

  // Fluxo de adicionar itens ao pedido (para pedido ja aberto)
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  // Carrinho para novo pedido (montar antes de abrir)
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [montandoPedido, setMontandoPedido] = useState(false);
  const [carrinhoCategoria, setCarrinhoCategoria] = useState("");

  // Detalhe pedido
  const [pedidoDetalhe, setPedidoDetalhe] = useState<Pedido | null>(null);

  // Relatorio
  const [dataRelatorio, setDataRelatorio] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pedidosFechados, setPedidosFechados] = useState<Pedido[]>([]);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const [mesasData, produtosData, pedidosData] = await Promise.all([
        getMesas(),
        getProdutos(),
        getPedidosAbertos(),
      ]);
      setMesas(mesasData);
      setProdutos(produtosData);
      setPedidos(pedidosData as unknown as Pedido[]);
    } catch {
      // erro silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      carregarDados();
    };
    checkAuth();
  }, [router, carregarDados]);

  const categorias = [...new Set(produtos.map((p) => p.ds_categoria))];

  const formatarCategoria = (cat: string) =>
    cat
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  // === NOVO PEDIDO: Montar carrinho e abrir ===
  const iniciarNovoPedido = (tipo: "mesa" | "balcao", mesa?: Mesa) => {
    setTipoPedido(tipo);
    setMesaSelecionada(mesa || null);
    setNomeCliente("");
    setCarrinho([]);
    setMontandoPedido(true);
    setCarrinhoCategoria(categorias[0] || "");
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const existente = prev.find(
        (c) => c.produto.id_produto === produto.id_produto
      );
      if (existente) {
        return prev.map((c) =>
          c.produto.id_produto === produto.id_produto
            ? { ...c, quantidade: c.quantidade + 1 }
            : c
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (idProduto: string) => {
    setCarrinho((prev) => {
      const existente = prev.find(
        (c) => c.produto.id_produto === idProduto
      );
      if (existente && existente.quantidade > 1) {
        return prev.map((c) =>
          c.produto.id_produto === idProduto
            ? { ...c, quantidade: c.quantidade - 1 }
            : c
        );
      }
      return prev.filter((c) => c.produto.id_produto !== idProduto);
    });
  };

  const excluirDoCarrinho = (idProduto: string) => {
    setCarrinho((prev) =>
      prev.filter((c) => c.produto.id_produto !== idProduto)
    );
  };

  const totalCarrinho = carrinho.reduce(
    (acc, c) => acc + c.produto.vl_preco * c.quantidade,
    0
  );

  const qntCarrinho = carrinho.reduce((acc, c) => acc + c.quantidade, 0);

  const quantidadeNoCarrinho = (idProduto: string) => {
    const item = carrinho.find((c) => c.produto.id_produto === idProduto);
    return item?.quantidade || 0;
  };

  const confirmarNovoPedido = async () => {
    if (carrinho.length === 0) return;
    if (tipoPedido === "balcao" && !nomeCliente.trim()) return;
    setActionLoading(true);
    try {
      let pedido;
      if (tipoPedido === "mesa" && mesaSelecionada) {
        pedido = await abrirPedidoMesa(
          mesaSelecionada.id_mesa,
          nomeCliente || undefined
        );
      } else {
        pedido = await abrirPedidoBalcao(nomeCliente);
      }

      // Adicionar todos os itens do carrinho
      for (const item of carrinho) {
        await adicionarItem(
          pedido.id_pedido,
          item.produto.id_produto,
          item.quantidade,
          item.produto.vl_preco
        );
      }

      setMontandoPedido(false);
      setCarrinho([]);
      setTipoPedido(null);
      setMesaSelecionada(null);
      setNomeCliente("");
      await carregarDados();
      setActiveTab("pedidos");
    } catch {
      // erro
    } finally {
      setActionLoading(false);
    }
  };

  // === ADICIONAR ITENS A PEDIDO EXISTENTE ===
  const handleAdicionarItemExistente = async (produto: Produto) => {
    if (!pedidoEditando) return;
    setActionLoading(true);
    try {
      await adicionarItem(
        pedidoEditando.id_pedido,
        produto.id_produto,
        1,
        produto.vl_preco
      );
      await carregarDados();
      const pedidosAtualizados = (await getPedidosAbertos()) as unknown as Pedido[];
      const atualizado = pedidosAtualizados.find(
        (p) => p.id_pedido === pedidoEditando.id_pedido
      );
      if (atualizado) {
        setPedidoEditando(atualizado);
        setPedidoDetalhe(atualizado);
      }
    } catch {
      // erro
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoverItem = async (idItem: string) => {
    if (!pedidoDetalhe) return;
    setActionLoading(true);
    try {
      await removerItem(idItem, pedidoDetalhe.id_pedido);
      await carregarDados();
      const pedidosAtualizados = (await getPedidosAbertos()) as unknown as Pedido[];
      const atualizado = pedidosAtualizados.find(
        (p) => p.id_pedido === pedidoDetalhe.id_pedido
      );
      if (atualizado) {
        setPedidoDetalhe(atualizado);
      } else {
        setPedidoDetalhe(null);
      }
    } catch {
      // erro
    } finally {
      setActionLoading(false);
    }
  };

  const handleFecharPedido = async (pedido: Pedido) => {
    setActionLoading(true);
    try {
      await fecharPedido(pedido.id_pedido, pedido.id_mesa);
      setPedidoDetalhe(null);
      await carregarDados();
    } catch {
      // erro
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelarPedido = async (pedido: Pedido) => {
    setActionLoading(true);
    try {
      await cancelarPedido(pedido.id_pedido, pedido.id_mesa);
      setPedidoDetalhe(null);
      await carregarDados();
    } catch {
      // erro
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  // Relatorio
  const carregarRelatorio = useCallback(async () => {
    setLoadingRelatorio(true);
    try {
      const dataInicio = `${dataRelatorio}T00:00:00.000Z`;
      const dataFim = `${dataRelatorio}T23:59:59.999Z`;
      const dados = (await getPedidosFechados(
        dataInicio,
        dataFim
      )) as unknown as Pedido[];
      setPedidosFechados(dados);
    } catch {
      // erro
    } finally {
      setLoadingRelatorio(false);
    }
  }, [dataRelatorio]);

  useEffect(() => {
    if (activeTab === "relatorio") {
      carregarRelatorio();
    }
  }, [activeTab, carregarRelatorio]);

  const totalFechadosDia = pedidosFechados
    .filter((p) => p.cd_status === "fechado")
    .reduce((acc, p) => acc + Number(p.vl_total), 0);

  const totalCanceladosDia = pedidosFechados.filter(
    (p) => p.cd_status === "cancelado"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // === TELA DE MONTAR PEDIDO (carrinho) ===
  if (montandoPedido) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <button
            onClick={() => {
              setMontandoPedido(false);
              setCarrinho([]);
              setTipoPedido(null);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground">
              {tipoPedido === "mesa"
                ? `Novo Pedido - Mesa ${mesaSelecionada?.nr_mesa}`
                : "Novo Pedido - Balcao"}
            </h1>
          </div>
        </header>

        {/* Nome do cliente */}
        <div className="border-b border-border bg-card px-4 py-3">
          <input
            type="text"
            placeholder={
              tipoPedido === "balcao"
                ? "Nome do cliente (obrigatorio)"
                : "Nome do cliente (opcional)"
            }
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Categorias em scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-3">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCarrinhoCategoria(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                carrinhoCategoria === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {formatarCategoria(cat)}
            </button>
          ))}
        </div>

        {/* Lista de produtos da categoria */}
        <div className="flex-1 overflow-y-auto p-4 pb-40">
          <div className="flex flex-col gap-2">
            {produtos
              .filter((p) => p.ds_categoria === carrinhoCategoria)
              .map((produto) => {
                const qtd = quantidadeNoCarrinho(produto.id_produto);
                return (
                  <div
                    key={produto.id_produto}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                      qtd > 0
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {produto.nm_produto}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        R${" "}
                        {Number(produto.vl_preco).toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {qtd > 0 && (
                        <button
                          onClick={() =>
                            removerDoCarrinho(produto.id_produto)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:border-primary"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                      {qtd > 0 && (
                        <span className="w-6 text-center text-sm font-bold text-primary">
                          {qtd}
                        </span>
                      )}
                      <button
                        onClick={() => adicionarAoCarrinho(produto)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Carrinho fixo embaixo */}
        {carrinho.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4">
            {/* Resumo itens */}
            <div className="mb-3 max-h-32 overflow-y-auto">
              {carrinho.map((item) => (
                <div
                  key={item.produto.id_produto}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="text-foreground">
                    {item.quantidade}x {item.produto.nm_produto}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      R${" "}
                      {(item.produto.vl_preco * item.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    <button
                      onClick={() =>
                        excluirDoCarrinho(item.produto.id_produto)
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between border-t border-border pt-2">
              <span className="text-sm text-muted-foreground">
                {qntCarrinho} {qntCarrinho === 1 ? "item" : "itens"}
              </span>
              <span className="text-lg font-bold text-primary">
                R$ {totalCarrinho.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCarrinho([]);
                }}
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={confirmarNovoPedido}
                disabled={
                  actionLoading ||
                  (tipoPedido === "balcao" && !nomeCliente.trim())
                }
                className="flex-1 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                {actionLoading ? "Enviando..." : "Confirmar Pedido"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === MODAL ADICIONAR ITEM A PEDIDO EXISTENTE ===
  if (pedidoEditando) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <button
            onClick={() => setPedidoEditando(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground">
              Adicionar Itens
              {pedidoEditando.mesas
                ? ` - Mesa ${pedidoEditando.mesas.nr_mesa}`
                : ` - ${pedidoEditando.nm_cliente}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              Total atual: R${" "}
              {Number(pedidoEditando.vl_total).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-3">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                categoriaSelecionada === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {formatarCategoria(cat)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {produtos
              .filter((p) => p.ds_categoria === categoriaSelecionada)
              .map((produto) => (
                <button
                  key={produto.id_produto}
                  onClick={() => handleAdicionarItemExistente(produto)}
                  disabled={actionLoading}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-[0.98]"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {produto.nm_produto}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">
                      R${" "}
                      {Number(produto.vl_preco).toFixed(2).replace(".", ",")}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
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
        {(
          [
            { key: "mesas" as ActiveTab, label: "Mesas", icon: Coffee },
            {
              key: "pedidos" as ActiveTab,
              label: "Pedidos",
              icon: ClipboardList,
            },
            { key: "novo" as ActiveTab, label: "Novo", icon: Plus },
            {
              key: "relatorio" as ActiveTab,
              label: "Relatorio",
              icon: BarChart3,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-4">
        {/* === MESAS === */}
        {activeTab === "mesas" && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">Mesas</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {mesas.map((mesa) => {
                const pedidoMesa = pedidos.find(
                  (p) => p.id_mesa === mesa.id_mesa
                );
                return (
                  <button
                    key={mesa.id_mesa}
                    onClick={() => {
                      if (pedidoMesa) {
                        setPedidoDetalhe(pedidoMesa);
                      } else {
                        iniciarNovoPedido("mesa", mesa);
                      }
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                      mesa.id_disponivel
                        ? "border-primary/30 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10"
                        : "border-destructive/30 bg-destructive/10 text-destructive hover:border-destructive"
                    }`}
                  >
                    <span className="text-2xl font-bold">{mesa.nr_mesa}</span>
                    <span className="mt-1 text-xs">
                      {mesa.id_disponivel ? "Livre" : "Ocupada"}
                    </span>
                    {pedidoMesa && (
                      <span className="mt-1 text-xs font-bold">
                        R${" "}
                        {Number(pedidoMesa.vl_total)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* === PEDIDOS ABERTOS === */}
        {activeTab === "pedidos" && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Pedidos Abertos ({pedidos.length})
            </h2>
            {pedidos.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
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
                        {pedido.mesas ? (
                          <>
                            Mesa {pedido.mesas.nr_mesa}
                            {pedido.nm_cliente && (
                              <span className="ml-2 text-sm font-normal text-muted-foreground">
                                - {pedido.nm_cliente}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {pedido.nm_cliente || "Balcao"}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {pedido.itens_pedido.length}{" "}
                        {pedido.itens_pedido.length !== 1 ? "itens" : "item"}
                        {" | "}
                        {new Date(pedido.dh_abertura).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      R${" "}
                      {Number(pedido.vl_total).toFixed(2).replace(".", ",")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === NOVO PEDIDO === */}
        {activeTab === "novo" && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Novo Pedido
            </h2>

            {/* Opcao: Mesa ou Balcao */}
            <div className="mb-6 flex flex-col gap-3">
              <button
                onClick={() => iniciarNovoPedido("balcao")}
                className="flex items-center gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-left transition-all hover:border-primary"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Pedido Balcao</p>
                  <p className="text-sm text-muted-foreground">
                    Sem mesa, apenas nome do cliente
                  </p>
                </div>
              </button>
            </div>

            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Ou selecione uma mesa livre:
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {mesas
                .filter((m) => m.id_disponivel)
                .map((mesa) => (
                  <button
                    key={mesa.id_mesa}
                    onClick={() => iniciarNovoPedido("mesa", mesa)}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-primary transition-all hover:border-primary hover:bg-primary/10"
                  >
                    <span className="text-2xl font-bold">{mesa.nr_mesa}</span>
                    <span className="mt-1 text-xs">Livre</span>
                  </button>
                ))}
            </div>
            {mesas.filter((m) => m.id_disponivel).length === 0 && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Todas as mesas estao ocupadas.
              </p>
            )}
          </div>
        )}

        {/* === RELATORIO === */}
        {activeTab === "relatorio" && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Relatorio do Dia
            </h2>

            {/* Seletor de data */}
            <div className="mb-4">
              <input
                type="date"
                value={dataRelatorio}
                onChange={(e) => setDataRelatorio(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {loadingRelatorio ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Resumo */}
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {pedidosFechados.filter((p) => p.cd_status === "fechado").length}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fechados
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-destructive">
                      {totalCanceladosDia}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cancelados
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                    <p className="text-xl font-bold text-primary">
                      R$ {totalFechadosDia.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Total
                    </p>
                  </div>
                </div>

                {/* Lista de pedidos do dia */}
                {pedidosFechados.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum pedido nesta data.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {pedidosFechados.map((pedido) => (
                      <div
                        key={pedido.id_pedido}
                        className="rounded-xl border border-border bg-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {pedido.mesas
                                ? `Mesa ${pedido.mesas.nr_mesa}`
                                : pedido.nm_cliente || "Balcao"}
                              {pedido.mesas && pedido.nm_cliente && (
                                <span className="ml-1 font-normal text-muted-foreground">
                                  - {pedido.nm_cliente}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                pedido.dh_abertura
                              ).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {pedido.dh_fechamento &&
                                ` - ${new Date(
                                  pedido.dh_fechamento
                                ).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`}
                              {" | "}
                              {pedido.itens_pedido.length}{" "}
                              {pedido.itens_pedido.length !== 1
                                ? "itens"
                                : "item"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${
                                pedido.cd_status === "fechado"
                                  ? "text-primary"
                                  : "text-destructive"
                              }`}
                            >
                              R${" "}
                              {Number(pedido.vl_total)
                                .toFixed(2)
                                .replace(".", ",")}
                            </p>
                            <span
                              className={`text-xs ${
                                pedido.cd_status === "fechado"
                                  ? "text-primary/70"
                                  : "text-destructive/70"
                              }`}
                            >
                              {pedido.cd_status === "fechado"
                                ? "Fechado"
                                : "Cancelado"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* === MODAL: Detalhe do Pedido === */}
      {pedidoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 sm:items-center sm:p-4">
          <div className="flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border bg-card sm:max-w-lg sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {pedidoDetalhe.mesas
                    ? `Mesa ${pedidoDetalhe.mesas.nr_mesa}`
                    : pedidoDetalhe.nm_cliente || "Balcao"}
                </h3>
                {pedidoDetalhe.mesas && pedidoDetalhe.nm_cliente && (
                  <p className="text-sm text-muted-foreground">
                    {pedidoDetalhe.nm_cliente}
                  </p>
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
                <p className="py-8 text-center text-sm text-muted-foreground">
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
                          R${" "}
                          {Number(item.vl_unitario)
                            .toFixed(2)
                            .replace(".", ",")}{" "}
                          un.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">
                          R${" "}
                          {Number(item.vl_subtotal)
                            .toFixed(2)
                            .replace(".", ",")}
                        </span>
                        <button
                          onClick={() => handleRemoverItem(item.id_item)}
                          disabled={actionLoading}
                          className="text-muted-foreground hover:text-destructive"
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
                  R${" "}
                  {Number(pedidoDetalhe.vl_total).toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPedidoEditando(pedidoDetalhe);
                    setCategoriaSelecionada(categorias[0] || "");
                    setPedidoDetalhe(null);
                  }}
                  className="flex-1 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
                <Button
                  onClick={() => handleFecharPedido(pedidoDetalhe)}
                  disabled={
                    actionLoading ||
                    pedidoDetalhe.itens_pedido.length === 0
                  }
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
                  className="border-destructive text-destructive hover:bg-destructive hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
