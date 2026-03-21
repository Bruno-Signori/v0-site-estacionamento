'use client';

import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModalItemAvulsoProps {
  isOpen: boolean;
  nmProduto: string;
  valor: string;
  quantidade: number;
  isLoading: boolean;
  onNomeChange: (nome: string) => void;
  onValorChange: (valor: string) => void;
  onQuantidadeChange: (qtd: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function ModalItemAvulso({
  isOpen,
  nmProduto,
  valor,
  quantidade,
  isLoading,
  onNomeChange,
  onValorChange,
  onQuantidadeChange,
  onConfirm,
  onClose,
}: ModalItemAvulsoProps) {
  if (!isOpen) return null;

  const totalItem = quantidade * parseFloat(valor.replace(',', '.') || '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 sm:items-center sm:p-4">
      <div className="w-full rounded-t-2xl border border-border bg-card p-5 sm:max-w-sm sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Item Avulso</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Nome do produto
            </label>
            <input
              type="text"
              placeholder="Ex: Sorvete, Caldo de cana..."
              value={nmProduto}
              onChange={(e) => onNomeChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Valor unitário (R$)
              </label>
              <input
                type="number"
                placeholder="0,00"
                min="0"
                step="0.01"
                value={valor}
                onChange={(e) => onValorChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Quantidade
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantidadeChange(Math.max(1, quantidade - 1))}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:border-primary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center text-sm font-bold text-foreground">
                  {quantidade}
                </span>
                <button
                  onClick={() => onQuantidadeChange(quantidade + 1)}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {nmProduto && valor && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total do item</p>
              <p className="text-lg font-bold text-primary">
                R$ {totalItem.toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

          <Button
            onClick={onConfirm}
            disabled={isLoading || !nmProduto.trim() || !valor || parseFloat(valor) <= 0}
            className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? 'Adicionando...' : 'Adicionar ao Pedido'}
          </Button>
        </div>
      </div>
    </div>
  );
}
