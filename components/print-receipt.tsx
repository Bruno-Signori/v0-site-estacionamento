"use client";

import { useEffect } from "react";

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
  const titulo = pedido.mesas
    ? `Mesa ${pedido.mesas.nr_mesa}`
    : pedido.nm_cliente || "Balcao";

  const dataFormatada = new Date(pedido.dh_abertura).toLocaleDateString(
    "pt-BR"
  );
  const horaFormatada = new Date(pedido.dh_abertura).toLocaleTimeString(
    "pt-BR",
    { hour: "2-digit", minute: "2-digit" }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 200);
    const handleAfterPrint = () => {
      onClose();
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onClose]);

  return (
    <>
      {/* Estilos de impressao injetados dinamicamente */}
      <style>{`
        @page {
          size: 58mm auto;
          margin: 0;
        }
        @media print {
          html, body {
            width: 58mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          body > *:not(#print-receipt) {
            display: none !important;
            visibility: hidden !important;
          }
          #print-receipt {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 58mm !important;
            background: white !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          #print-receipt * {
            visibility: visible !important;
          }
        }
        @media screen {
          #print-receipt {
            display: none;
          }
        }
      `}</style>

      <div id="print-receipt">
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            width: "58mm",
            margin: "0 auto",
            padding: "4mm 2mm",
            color: "#000",
            background: "#fff",
          }}
        >
          {/* Cabecalho */}
          <div style={{ textAlign: "center", marginBottom: "4mm" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              FITTIPALDI
            </div>
            <div style={{ fontSize: "11px" }}>Estacionamento</div>
            <div
              style={{
                borderTop: "1px dashed #000",
                marginTop: "3mm",
                paddingTop: "2mm",
                fontSize: "11px",
              }}
            >
              {dataFormatada} {horaFormatada}
            </div>
          </div>

          {/* Identificacao */}
          <div
            style={{
              borderTop: "1px dashed #000",
              borderBottom: "1px dashed #000",
              padding: "2mm 0",
              marginBottom: "3mm",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            {titulo}
            {pedido.mesas && pedido.nm_cliente && (
              <div style={{ fontSize: "11px", fontWeight: "normal" }}>
                {pedido.nm_cliente}
              </div>
            )}
          </div>

          {/* Itens */}
          <div style={{ marginBottom: "3mm" }}>
            {pedido.itens_pedido.map((item) => (
              <div
                key={item.id_item}
                style={{ marginBottom: "2mm" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {item.nr_quantidade}x{" "}
                    {item.produtos?.nm_produto ?? item.nm_produto_avulso ?? "Item"}
                  </span>
                  <span>
                    R${" "}
                    {Number(item.vl_subtotal).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div style={{ fontSize: "10px", color: "#555", paddingLeft: "4mm" }}>
                  un. R$ {Number(item.vl_unitario).toFixed(2).replace(".", ",")}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            style={{
              borderTop: "1px dashed #000",
              paddingTop: "2mm",
              marginBottom: "4mm",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              <span>TOTAL</span>
              <span>R$ {Number(pedido.vl_total).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {/* Observacoes */}
          {pedido.ds_observacoes && (
            <div
              style={{
                borderTop: "1px dashed #000",
                paddingTop: "2mm",
                marginBottom: "4mm",
                fontSize: "11px",
              }}
            >
              <div style={{ fontWeight: "bold" }}>Obs:</div>
              <div>{pedido.ds_observacoes}</div>
            </div>
          )}

          {/* Rodape */}
          <div
            style={{
              borderTop: "1px dashed #000",
              paddingTop: "2mm",
              textAlign: "center",
              fontSize: "10px",
            }}
          >
            Obrigado pela preferencia!
          </div>
        </div>
      </div>
    </>
  );
}
