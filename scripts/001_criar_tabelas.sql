-- =============================================
-- Estacionamento Fittipaldi - Sistema Interno
-- Banco de dados para conveniencia
-- =============================================

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id_produto UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nm_produto TEXT NOT NULL,
  ds_categoria TEXT NOT NULL,
  vl_preco NUMERIC(10, 2) NOT NULL,
  id_ativo BOOLEAN NOT NULL DEFAULT true,
  dh_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de mesas (10 mesas padrão)
CREATE TABLE IF NOT EXISTS public.mesas (
  id_mesa UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nr_mesa INTEGER NOT NULL UNIQUE,
  id_disponivel BOOLEAN NOT NULL DEFAULT true
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id_pedido UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_mesa UUID REFERENCES public.mesas(id_mesa) ON DELETE SET NULL,
  nm_cliente TEXT,
  cd_status TEXT NOT NULL DEFAULT 'aberto' CHECK (cd_status IN ('aberto', 'fechado', 'cancelado')),
  vl_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ds_observacoes TEXT,
  dh_abertura TIMESTAMPTZ NOT NULL DEFAULT now(),
  dh_fechamento TIMESTAMPTZ
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS public.itens_pedido (
  id_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pedido UUID NOT NULL REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE,
  id_produto UUID NOT NULL REFERENCES public.produtos(id_produto) ON DELETE RESTRICT,
  nr_quantidade INTEGER NOT NULL DEFAULT 1,
  vl_unitario NUMERIC(10, 2) NOT NULL,
  vl_subtotal NUMERIC(10, 2) NOT NULL,
  dh_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir 10 mesas padrão
INSERT INTO public.mesas (nr_mesa, id_disponivel)
VALUES
  (1, true), (2, true), (3, true), (4, true), (5, true),
  (6, true), (7, true), (8, true), (9, true), (10, true)
ON CONFLICT (nr_mesa) DO NOTHING;

-- Inserir produtos (mesmos do cardápio /lanches)
INSERT INTO public.produtos (nm_produto, ds_categoria, vl_preco) VALUES
  -- Pastéis
  ('Carne', 'Pastéis', 9.00),
  ('Frango', 'Pastéis', 10.00),
  ('Carne e Queijo', 'Pastéis', 10.00),
  ('Queijo', 'Pastéis', 11.00),
  ('Queijo e Presunto', 'Pastéis', 10.00),
  ('Chocolate Preto', 'Pastéis', 11.00),
  ('Chocolate Branco', 'Pastéis', 11.00),
  ('Chocolate Misto', 'Pastéis', 11.00),
  -- Xis e Burgers
  ('Hamburguer', 'Xis e Burgers', 16.00),
  ('X-Especial', 'Xis e Burgers', 17.00),
  -- Torradas
  ('Torrada Completa', 'Torradas', 10.00),
  -- Pão de Queijo
  ('Pão de Queijo (unidade)', 'Pão de Queijo', 5.00),
  -- Bebidas
  ('Café', 'Bebidas', 5.00),
  ('Café com Leite', 'Bebidas', 5.00),
  ('Coca 220ml', 'Bebidas', 4.00),
  ('Coca 350ml', 'Bebidas', 6.00),
  ('Coca 600ml', 'Bebidas', 8.00),
  ('Coca 2L', 'Bebidas', 15.00),
  ('Energetico Monster', 'Bebidas', 13.00),
  ('Red Bull', 'Bebidas', 13.00),
  ('Gatorade', 'Bebidas', 9.00),
  -- Diversos
  ('Espetinho', 'Diversos', 12.00),
  ('Snickers', 'Diversos', 6.00),
  ('Sonho De Valsa', 'Diversos', 2.00),
  ('Ouro Branco', 'Diversos', 2.00),
  ('Trento Tradicional', 'Diversos', 5.00),
  ('Trento Branco', 'Diversos', 5.00),
  ('Trento Dark', 'Diversos', 5.00),
  ('Lacta Shot', 'Diversos', 12.00),
  ('Lacta Oreo', 'Diversos', 12.00),
  ('Lacta Ao Leite', 'Diversos', 12.00),
  ('Lacta Tamanho Família', 'Diversos', 16.00),
  ('Kinder Bueno', 'Diversos', 10.00),
  ('Doritos', 'Diversos', 12.00),
  ('Ruffles', 'Diversos', 12.00),
  ('Fandangos', 'Diversos', 12.00),
  ('Cheetos Assado', 'Diversos', 12.00),
  ('Baconzitos', 'Diversos', 12.00),
  ('Cebolitos', 'Diversos', 12.00),
  ('Stiksy', 'Diversos', 12.00),
  ('Pingo d''Ouro', 'Diversos', 12.00),
  ('Takis', 'Diversos', 10.00),
  ('Crocantíssimo', 'Diversos', 8.00),
  ('Mentos', 'Diversos', 3.50),
  ('Trident', 'Diversos', 3.50),
  ('Fruit-tella', 'Diversos', 4.50),
  ('Tic Tac', 'Diversos', 4.00),
  ('Barra Nutry', 'Diversos', 5.00),
  ('Amendoim Iracema', 'Diversos', 8.00)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Apenas autenticados podem ler e manipular
CREATE POLICY "produtos_select" ON public.produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "produtos_insert" ON public.produtos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "produtos_update" ON public.produtos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "produtos_delete" ON public.produtos FOR DELETE TO authenticated USING (true);

CREATE POLICY "mesas_select" ON public.mesas FOR SELECT TO authenticated USING (true);
CREATE POLICY "mesas_update" ON public.mesas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "pedidos_select" ON public.pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "pedidos_insert" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pedidos_update" ON public.pedidos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "pedidos_delete" ON public.pedidos FOR DELETE TO authenticated USING (true);

CREATE POLICY "itens_pedido_select" ON public.itens_pedido FOR SELECT TO authenticated USING (true);
CREATE POLICY "itens_pedido_insert" ON public.itens_pedido FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "itens_pedido_update" ON public.itens_pedido FOR UPDATE TO authenticated USING (true);
CREATE POLICY "itens_pedido_delete" ON public.itens_pedido FOR DELETE TO authenticated USING (true);
