
import { OrdemServico } from '@/contexts/CRMContext';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ImpressaoOSProps {
  ordem: OrdemServico;
}

const ImpressaoOS: React.FC<ImpressaoOSProps> = ({ ordem }) => {
  const imprimirOS = () => {
    const conteudoImpressao = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>OS #${ordem.id.slice(-4)}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 10px;
              width: 80mm;
              max-width: 80mm;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 10px;
              margin-bottom: 5px;
            }
            .section {
              margin-bottom: 15px;
            }
            .section-title {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 5px;
              border-bottom: 1px solid #000;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 10px;
            }
            .total {
              border-top: 1px dashed #000;
              padding-top: 5px;
              font-weight: bold;
              text-align: right;
            }
            .footer {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 15px;
              text-align: center;
              font-size: 10px;
            }
            .status {
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ATELIER DE COSTURA</div>
            <div class="subtitle">Sistema de Ordem de Serviço</div>
            <div class="subtitle">Tel: (00) 00000-0000</div>
          </div>

          <div class="section">
            <div class="section-title">ORDEM DE SERVIÇO</div>
            <div>Número: #${ordem.id.slice(-4)}</div>
            <div>Data: ${new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}</div>
            ${ordem.dataPrevista ? `<div>Previsão: ${new Date(ordem.dataPrevista).toLocaleDateString('pt-BR')}</div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">CLIENTE</div>
            <div><strong>${ordem.cliente.nome}</strong></div>
            <div>Tel: ${ordem.cliente.telefone}</div>
            ${ordem.cliente.email ? `<div>Email: ${ordem.cliente.email}</div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">SERVIÇOS</div>
            ${ordem.servicos.map(item => `
              <div class="item">
                <div style="flex: 1;">
                  ${item.servico.nome}
                  ${item.quantidade > 1 ? ` (${item.quantidade}x)` : ''}
                </div>
                <div>R$ ${item.valorTotal.toFixed(2)}</div>
              </div>
            `).join('')}
            
            <div class="total">
              <div>TOTAL: R$ ${ordem.valorTotal.toFixed(2)}</div>
            </div>
          </div>

          ${ordem.observacoes ? `
            <div class="section">
              <div class="section-title">OBSERVAÇÕES</div>
              <div>${ordem.observacoes}</div>
            </div>
          ` : ''}

          <div class="status">
            STATUS: ${ordem.status.toUpperCase().replace('_', ' ')}
          </div>

          <div class="footer">
            <div>Obrigada pela preferência!</div>
            <div>Data de impressão: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
        </body>
      </html>
    `;

    const janela = window.open('', '_blank');
    if (janela) {
      janela.document.write(conteudoImpressao);
      janela.document.close();
      janela.focus();
      
      setTimeout(() => {
        janela.print();
        janela.close();
      }, 250);
    }
  };

  return (
    <Button 
      onClick={imprimirOS}
      variant="outline" 
      size="sm"
      className="flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Imprimir OS
    </Button>
  );
};

export default ImpressaoOS;
