'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ---- MESAS ----
export async function getMesas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .order('nr_mesa')
  if (error) throw error
  return data
}

// ---- PRODUTOS ----
export async function getProdutos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id_ativo', true)
    .order('ds_categoria')
    .order('nm_produto')
  if (error) throw error
  return data
}

// ---- PEDIDOS ----
export async function getPedidosAbertos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      mesas ( nr_mesa ),
      itens_pedido (
        *,
        produtos ( nm_produto, ds_categoria )
      )
    `)
    .eq('cd_status', 'aberto')
    .order('dh_abertura', { ascending: false })
  if (error) throw error
  return data
}

export async function getPedidosFechados(dataInicio: string, dataFim: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      mesas ( nr_mesa ),
      itens_pedido (
        *,
        produtos ( nm_produto, ds_categoria )
      )
    `)
    .in('cd_status', ['fechado', 'cancelado'])
    .gte('dh_abertura', dataInicio)
    .lte('dh_abertura', dataFim)
    .order('dh_fechamento', { ascending: false })
  if (error) throw error
  return data
}

// Abrir pedido COM mesa
export async function abrirPedidoMesa(idMesa: string, nmCliente?: string) {
  const supabase = await createClient()

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      id_mesa: idMesa,
      nm_cliente: nmCliente || null,
      cd_status: 'aberto',
    })
    .select()
    .single()
  if (pedidoError) throw pedidoError

  const { error: mesaError } = await supabase
    .from('mesas')
    .update({ id_disponivel: false })
    .eq('id_mesa', idMesa)
  if (mesaError) throw mesaError

  revalidatePath('/sistema_interno')
  return pedido
}

// Abrir pedido SEM mesa (apenas nome)
export async function abrirPedidoBalcao(nmCliente: string) {
  const supabase = await createClient()

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      id_mesa: null,
      nm_cliente: nmCliente,
      cd_status: 'aberto',
    })
    .select()
    .single()
  if (pedidoError) throw pedidoError

  revalidatePath('/sistema_interno')
  return pedido
}

export async function adicionarItem(
  idPedido: string,
  idProduto: string,
  quantidade: number,
  vlUnitario: number
) {
  const supabase = await createClient()
  const vlSubtotal = quantidade * vlUnitario

  const { error: itemError } = await supabase.from('itens_pedido').insert({
    id_pedido: idPedido,
    id_produto: idProduto,
    nr_quantidade: quantidade,
    vl_unitario: vlUnitario,
    vl_subtotal: vlSubtotal,
  })
  if (itemError) throw itemError

  // Atualizar total do pedido
  const { data: itens } = await supabase
    .from('itens_pedido')
    .select('vl_subtotal')
    .eq('id_pedido', idPedido)

  const novoTotal = itens?.reduce((acc, item) => acc + Number(item.vl_subtotal), 0) || 0

  const { error: pedidoError } = await supabase
    .from('pedidos')
    .update({ vl_total: novoTotal })
    .eq('id_pedido', idPedido)
  if (pedidoError) throw pedidoError

  revalidatePath('/sistema_interno')
}

export async function removerItem(idItem: string, idPedido: string) {
  const supabase = await createClient()

  const { error: itemError } = await supabase
    .from('itens_pedido')
    .delete()
    .eq('id_item', idItem)
  if (itemError) throw itemError

  const { data: itens } = await supabase
    .from('itens_pedido')
    .select('vl_subtotal')
    .eq('id_pedido', idPedido)

  const novoTotal = itens?.reduce((acc, item) => acc + Number(item.vl_subtotal), 0) || 0

  const { error: pedidoError } = await supabase
    .from('pedidos')
    .update({ vl_total: novoTotal })
    .eq('id_pedido', idPedido)
  if (pedidoError) throw pedidoError

  revalidatePath('/sistema_interno')
}

export async function fecharPedido(idPedido: string, idMesa: string | null) {
  const supabase = await createClient()

  const { error: pedidoError } = await supabase
    .from('pedidos')
    .update({
      cd_status: 'fechado',
      dh_fechamento: new Date().toISOString(),
    })
    .eq('id_pedido', idPedido)
  if (pedidoError) throw pedidoError

  if (idMesa) {
    const { error: mesaError } = await supabase
      .from('mesas')
      .update({ id_disponivel: true })
      .eq('id_mesa', idMesa)
    if (mesaError) throw mesaError
  }

  revalidatePath('/sistema_interno')
}

export async function cancelarPedido(idPedido: string, idMesa: string | null) {
  const supabase = await createClient()

  const { error: pedidoError } = await supabase
    .from('pedidos')
    .update({
      cd_status: 'cancelado',
      dh_fechamento: new Date().toISOString(),
    })
    .eq('id_pedido', idPedido)
  if (pedidoError) throw pedidoError

  if (idMesa) {
    const { error: mesaError } = await supabase
      .from('mesas')
      .update({ id_disponivel: true })
      .eq('id_mesa', idMesa)
    if (mesaError) throw mesaError
  }

  revalidatePath('/sistema_interno')
}

// ---- AUTH ----
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}
