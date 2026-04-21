"use client";

import { useEffect, useRef } from "react";

type ItemPedido = {
  id_item: string;
  id_pedido: string;
  id_produto: string | null;
  nm_produto_avulso: string | null;
  nr_quantidade: number;
  vl_unitario: number;
  vl_subtotal: number;
  produtos: { nm_produto: string; ds_categoria: string } | null;
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

type PrintReceiptProps = {
  pedido: Pedido;
  onClose: () => void;
};

export function PrintReceipt({ pedido, onClose }: PrintReceiptProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const titulo = pedido.mesas
    ? `Mesa ${pedido.mesas.nr_mesa}`
    : pedido.nm_cliente || "Balcao";

  const dataFormatada = new Date(pedido.dh_abertura).toLocaleDateString("pt-BR");
  const horaFormatada = new Date(pedido.dh_abertura).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const itensHtml = pedido.itens_pedido
    .map((item) => {
      const nome = item.produtos?.nm_produto ?? item.nm_produto_avulso ?? "Item";
      const subtotal = Number(item.vl_subtotal).toFixed(2).replace(".", ",");
      const unitario = Number(item.vl_unitario).toFixed(2).replace(".", ",");
      return `
        <div style="margin-bottom:3mm;">
          <div style="display:flex;justify-content:space-between;">
            <span>${item.nr_quantidade}x ${nome}</span>
            <span>R$ ${subtotal}</span>
          </div>
          <div style="font-size:10px;color:#555;padding-left:4mm;">un. R$ ${unitario}</div>
        </div>`;
    })
    .join("");

  const obsHtml = pedido.ds_observacoes
    ? `<div style="border-top:1px dashed #000;padding-top:2mm;margin-bottom:4mm;font-size:11px;">
         <div style="font-weight:bold;">Obs:</div>
         <div>${pedido.ds_observacoes}</div>
       </div>`
    : "";

  const clienteHtml =
    pedido.mesas && pedido.nm_cliente
      ? `<div style="font-size:11px;font-weight:normal;">${pedido.nm_cliente}</div>`
      : "";

  const total = Number(pedido.vl_total).toFixed(2).replace(".", ",");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Cupom</title>
  <style>
    @page { size: 58mm auto; margin: 2mm; }
    * { box-sizing: border-box; }
    body {
      font-family: monospace;
      font-size: 12px;
      width: 54mm;
      margin: 0;
      padding: 2mm;
      color: #000;
      background: #fff;
    }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:4mm;">
    <div style="font-size:16px;font-weight:bold;letter-spacing:1px;">FITTIPALDI</div>
    <div style="font-size:11px;">Estacionamento</div>
    <div style="border-top:1px dashed #000;margin-top:3mm;padding-top:2mm;font-size:11px;">
      ${dataFormatada} ${horaFormatada}
    </div>
  </div>
  <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:2mm 0;margin-bottom:3mm;text-align:center;font-weight:bold;font-size:13px;">
    ${titulo}${clienteHtml}
  </div>
  <div style="margin-bottom:3mm;">${itensHtml}</div>
  <div style="border-top:1px dashed #000;padding-top:2mm;margin-bottom:4mm;">
    <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;">
      <span>TOTAL</span><span>R$ ${total}</span>
    </div>
  </div>
  ${obsHtml}
  <div style="border-top:1px dashed #000;padding-top:2mm;text-align:center;font-size:10px;">
    Obrigado pela preferencia!
  </div>
</body>
</html>`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    // Aguarda o iframe carregar completamente antes de imprimir
    const doPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // fallback silencioso
      }
      // Fecha o modal após a impressao
      const afterPrint = () => {
        onClose();
      };
      iframe.contentWindow?.addEventListener("afterprint", afterPrint, { once: true });
      // Fallback: se afterprint nao disparar em 3s, fecha mesmo assim
      setTimeout(onClose, 3000);
    };

    iframe.onload = () => {
      setTimeout(doPrint, 300);
    };

    // Seguranca: se onload nao disparar (ja estava carregado), dispara manualmente
    setTimeout(doPrint, 500);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <iframe
      ref={iframeRef}
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: "58mm",
        height: "0",
        border: "none",
        visibility: "hidden",
      }}
      title="cupom-impressao"
    />
  );
}
