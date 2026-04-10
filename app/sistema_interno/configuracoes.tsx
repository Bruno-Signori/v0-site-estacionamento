"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Tag, Package } from "lucide-react";
import {
  getCategorias,
  criarCategoria,
  atualizarCategoria,
  desativarCategoria,
  getProdutos,
  criarProduto,
  atualizarProduto,
  desativarProduto,
} from "./actions";

type Categoria = {
  id_categoria: string;
  nm_categoria: string;
  ds_descricao: string | null;
  id_ativo: boolean;
};

type Produto = {
  id_produto: string;
  nm_produto: string;
  ds_categoria: string;
  vl_preco: number;
  id_ativo: boolean;
};

type ConfigTab = "categorias" | "produtos";

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("categorias");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Categoria
  const [modalCategoria, setModalCategoria] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaNome, setCategoriaNome] = useState("");
  const [categoriaDesc, setCategoriaDesc] = useState("");

  // Modal Produto
  const [modalProduto, setModalProduto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtoNome, setProdutoNome] = useState("");
  const [produtoCategoria, setProdutoCategoria] = useState("");
  const [produtoPreco, setProdutoPreco] = useState("");
  
  // Filtro de produtos
  const [filtroProduto, setFiltroProduto] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [cats, prods] = await Promise.all([getCategorias(), getProdutos()]);
      setCategorias(cats as Categoria[]);
      setProdutos(prods as Produto[]);
    } catch (error) {
      console.error("[v0] Erro ao carregar dados:", error);
    }
  };

  // === CATEGORIAS ===
  const abrirModalCategoria = (categoria?: Categoria) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setCategoriaNome(categoria.nm_categoria);
      setCategoriaDesc(categoria.ds_descricao || "");
    } else {
      setCategoriaEditando(null);
      setCategoriaNome("");
      setCategoriaDesc("");
    }
    setModalCategoria(true);
  };

  const salvarCategoria = async () => {
    if (!categoriaNome.trim()) return;
    setLoading(true);
    try {
      if (categoriaEditando) {
        await atualizarCategoria(
          categoriaEditando.id_categoria,
          categoriaNome.trim(),
          categoriaDesc.trim() || undefined
        );
      } else {
        await criarCategoria(categoriaNome.trim(), categoriaDesc.trim() || undefined);
      }
      await carregarDados();
      setModalCategoria(false);
    } catch (error) {
      console.error("[v0] Erro ao salvar categoria:", error);
    } finally {
      setLoading(false);
    }
  };

  const excluirCategoria = async (id: string) => {
    if (!confirm("Desativar esta categoria?")) return;
    setLoading(true);
    try {
      await desativarCategoria(id);
      await carregarDados();
    } catch (error) {
      console.error("[v0] Erro ao excluir categoria:", error);
    } finally {
      setLoading(false);
    }
  };

  // === PRODUTOS ===
  const abrirModalProduto = (produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto);
      setProdutoNome(produto.nm_produto);
      setProdutoCategoria(produto.ds_categoria);
      setProdutoPreco(produto.vl_preco.toFixed(2));
    } else {
      setProdutoEditando(null);
      setProdutoNome("");
      setProdutoCategoria(categorias[0]?.nm_categoria || "");
      setProdutoPreco("");
    }
    setModalProduto(true);
  };

  const salvarProduto = async () => {
    if (!produtoNome.trim() || !produtoCategoria || !produtoPreco) return;
    const preco = parseFloat(produtoPreco.replace(",", "."));
    if (isNaN(preco) || preco <= 0) return;

    setLoading(true);
    try {
      if (produtoEditando) {
        await atualizarProduto(
          produtoEditando.id_produto,
          produtoNome.trim(),
          produtoCategoria,
          preco
        );
      } else {
        await criarProduto(produtoNome.trim(), produtoCategoria, preco);
      }
      await carregarDados();
      setModalProduto(false);
    } catch (error) {
      console.error("[v0] Erro ao salvar produto:", error);
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async (id: string) => {
    if (!confirm("Desativar este produto?")) return;
    setLoading(true);
    try {
      await desativarProduto(id);
      await carregarDados();
    } catch (error) {
      console.error("[v0] Erro ao excluir produto:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Tabs Config */}
      <div className="flex border-b border-border bg-card">
        <button
          onClick={() => setActiveTab("categorias")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "categorias"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="h-4 w-4" />
          Categorias
        </button>
        <button
          onClick={() => setActiveTab("produtos")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "produtos"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="h-4 w-4" />
          Produtos
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "categorias" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Categorias</h2>
              <Button
                onClick={() => abrirModalCategoria()}
                size="sm"
                className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {categorias.map((cat) => (
                <div
                  key={cat.id_categoria}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">{cat.nm_categoria}</p>
                    {cat.ds_descricao && (
                      <p className="text-xs text-muted-foreground">{cat.ds_descricao}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModalCategoria(cat)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => excluirCategoria(cat.id_categoria)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "produtos" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Produtos</h2>
              <Button
                onClick={() => abrirModalProduto()}
                size="sm"
                className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </div>
            
            {/* Filtro por nome */}
            <div className="mb-4">
              <Input
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
                placeholder="Filtrar por nome do produto..."
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              {produtos
                .filter((prod) =>
                  prod.nm_produto.toLowerCase().includes(filtroProduto.toLowerCase())
                )
                .map((prod) => (
                <div
                  key={prod.id_produto}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{prod.nm_produto}</p>
                    <p className="text-xs text-muted-foreground">{prod.ds_categoria}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary">
                      R$ {prod.vl_preco.toFixed(2).replace(".", ",")}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalProduto(prod)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => excluirProduto(prod.id_produto)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Categoria */}
      {modalCategoria && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 sm:items-center sm:p-4">
          <div className="w-full rounded-t-2xl border border-border bg-card p-5 sm:max-w-md sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <button
                onClick={() => setModalCategoria(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="cat-nome">Nome</Label>
                <Input
                  id="cat-nome"
                  value={categoriaNome}
                  onChange={(e) => setCategoriaNome(e.target.value)}
                  placeholder="Ex: bebidas, pasteis..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cat-desc">Descrição (opcional)</Label>
                <Textarea
                  id="cat-desc"
                  value={categoriaDesc}
                  onChange={(e) => setCategoriaDesc(e.target.value)}
                  placeholder="Descrição da categoria"
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <Button
                onClick={salvarCategoria}
                disabled={loading || !categoriaNome.trim()}
                className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {modalProduto && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 sm:items-center sm:p-4">
          <div className="w-full rounded-t-2xl border border-border bg-card p-5 sm:max-w-md sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {produtoEditando ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button
                onClick={() => setModalProduto(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="prod-nome">Nome do Produto</Label>
                <Input
                  id="prod-nome"
                  value={produtoNome}
                  onChange={(e) => setProdutoNome(e.target.value)}
                  placeholder="Ex: Pastel de Carne"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="prod-categoria">Categoria</Label>
                <select
                  id="prod-categoria"
                  value={produtoCategoria}
                  onChange={(e) => setProdutoCategoria(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.nm_categoria}>
                      {cat.nm_categoria}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="prod-preco">Preço (R$)</Label>
                <Input
                  id="prod-preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={produtoPreco}
                  onChange={(e) => setProdutoPreco(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>
              <Button
                onClick={salvarProduto}
                disabled={
                  loading ||
                  !produtoNome.trim() ||
                  !produtoCategoria ||
                  !produtoPreco ||
                  parseFloat(produtoPreco) <= 0
                }
                className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
