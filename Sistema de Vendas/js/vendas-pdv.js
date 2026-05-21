// js/vendas-pdv.js - Lógica Principal do Ponto de Venda (CORRIGIDO PARA CPF_CNPJ)

import { supabase, empresaLogada, formatarMoeda } from './core.js';

// Variáveis de Estado Local
let carrinho = [];
let clienteSelecionado = { id: null, nome: null, telefone: null };

// ====================================================================
// 1. LÓGICA DE CLIENTE (Busca, Seleção, Modal) - CORRIGIDA
// ====================================================================

async function buscarClientes(termo) {
    if (!supabase || termo.length < 3) return [];

    const { data, error } = await supabase
        .from('clientes')
        // CORREÇÃO AQUI: Selecionando 'cpf_cnpj' (e não 'cnpj')
        .select('id, razao_social, cpf_cnpj, telefone') 
        // CORREÇÃO AQUI: Filtrando por 'cpf_cnpj' (e não 'cnpj')
        .or(`razao_social.ilike.%${termo}%,cpf_cnpj.ilike.%${termo}%`)
        .limit(10);

    if (error) { console.error('Erro ao buscar clientes:', error); return []; }
    return data;
}

/**
 * Lida com a entrada de texto no campo de cliente, gerencia o autocomplete e o botão de cadastro.
 */
async function handleClienteInput() {
    const inputCliente = document.getElementById('inputCliente');
    const sugestoesDiv = document.getElementById('clienteSugestoes');
    const statusDiv = document.getElementById('statusClienteSelecionado');
    const termo = inputCliente.value.trim();
    
    // 1. Resetar o estado
    sugestoesDiv.innerHTML = '';
    sugestoesDiv.style.display = 'none';
    clienteSelecionado = { id: null, nome: null, telefone: null };
    document.getElementById('inputClienteId').value = '';
    desabilitarControlesVendas(true);

    if (termo.length < 3) {
        statusDiv.innerHTML = 'Digite no mínimo 3 caracteres para buscar ou cadastre novo.';
        return;
    }

    statusDiv.innerHTML = `Buscando clientes...`;
    
    const resultados = await buscarClientes(termo);

    if (resultados.length > 0) {
        statusDiv.innerHTML = `Selecione um cliente:`;
        
        resultados.forEach(cliente => {
            const li = document.createElement('li');
            // Exibindo o CPF/CNPJ (corrigido para 'cpf_cnpj')
            li.textContent = `${cliente.razao_social} (${cliente.cpf_cnpj || 'Sem CPF/CNPJ'})`; 
            li.onclick = () => selecionarClientePDV(cliente);
            sugestoesDiv.appendChild(li);
        });
        sugestoesDiv.style.display = 'block';

    } else {
        sugestoesDiv.style.display = 'none';
        statusDiv.innerHTML = `Cliente "${termo}" não encontrado. 
            <button type="button" id="btnCadastroRapido" class="btn-secondary" style="margin-left: 10px;">
                + Cadastrar Rápido
            </button>`;
        
        document.getElementById('btnCadastroRapido').onclick = abrirModalCadastro;
    }
}

function selecionarClientePDV(cliente) {
    clienteSelecionado = cliente;
    document.getElementById('inputClienteId').value = cliente.id;
    document.getElementById('inputCliente').value = cliente.razao_social;
    document.getElementById('clienteSugestoes').style.display = 'none';
    
    const statusDiv = document.getElementById('statusClienteSelecionado');
    statusDiv.innerHTML = `Cliente Selecionado: <b>${cliente.razao_social}</b>`;

    desabilitarControlesVendas(false);
    document.getElementById('inputProduto').focus();
}

function desabilitarControlesVendas(desabilitar) {
    document.getElementById('inputProduto').disabled = desabilitar;
    document.getElementById('inputQuantidade').disabled = desabilitar;
    document.getElementById('inputDesconto').disabled = desabilitar;
    document.getElementById('btnAdicionarProduto').disabled = desabilitar;
    document.getElementById('inputFrete').disabled = desabilitar;
    
    const btnFinalizar = document.querySelector('.secao-carrinho button[type="submit"]');
    if (btnFinalizar) btnFinalizar.disabled = desabilitar;
}

function abrirModalCadastro() {
    const termoDigitado = document.getElementById('inputCliente').value.trim();
    document.getElementById('inputClienteModalRazaoSocial').value = termoDigitado;
    document.getElementById('clienteSugestoes').style.display = 'none'; 
    document.getElementById('modalCadastroCliente').style.display = 'flex';
}
window.fecharModalCadastro = () => { 
    document.getElementById('modalCadastroCliente').style.display = 'none';
    document.getElementById('formCadastroRapidoCliente').reset();
};

async function salvarClienteRapido(e) {
    e.preventDefault();
    const razao_social = document.getElementById('inputClienteModalRazaoSocial').value;
    // O valor do input CPF/CNPJ
    const valorCpfCnpj = document.getElementById('inputClienteModalCnpj').value; 
    const email = document.getElementById('inputClienteModalEmail').value;
    const telefone = document.getElementById('inputClienteModalTelefone').value;
    
    // CORREÇÃO AQUI: Usando 'cpf_cnpj' como chave do objeto para bater com a coluna
    const dadosCliente = { 
        razao_social, 
        cpf_cnpj: valorCpfCnpj, // Chave correta
        email, 
        telefone 
    };

    const { data, error } = await supabase.from('clientes').insert([dadosCliente]).select().single();
    
    if (error) { 
        // A mensagem de erro agora será mais precisa se houver outro problema.
        console.error('Erro ao salvar cliente rápido:', error); 
        alert('Erro ao salvar cliente: ' + error.message);
        return;
    } 
    
    fecharModalCadastro();
    alert(`Cliente "${data.razao_social}" cadastrado e selecionado com sucesso!`);
    selecionarClientePDV(data);
}


// ====================================================================
// 2. LÓGICA DE PRODUTO
// ====================================================================

async function buscarProdutos(termo) {
    const sugestoes = document.getElementById('produtoSugestoes');
    if (!empresaLogada || termo.length < 3) { sugestoes.innerHTML = ''; return; }

    const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, valor_unitario')
        .eq('empresa_id', empresaLogada) 
        .ilike('nome', `%${termo}%`) 
        .limit(10);

    if (error) { console.error('Erro ao buscar produtos:', error); return; }

    sugestoes.innerHTML = '';
    data.forEach(produto => {
        const li = document.createElement('li');
        li.textContent = `${produto.nome} (${formatarMoeda(produto.valor_unitario)})`;
        li.addEventListener('click', () => {
            document.getElementById('inputProduto').value = produto.nome;
            document.getElementById('inputProdutoId').value = produto.id;
            document.getElementById('inputValorUnitarioBase').value = produto.valor_unitario;
            sugestoes.innerHTML = '';
            document.getElementById('inputQuantidade').focus();
        });
        sugestoes.appendChild(li);
    });
}

// ====================================================================
// 3. LÓGICA DO CARRINHO E TOTAIS (MANTIDA)
// ====================================================================

function adicionarProdutoAoCarrinho() {
    const produtoId = document.getElementById('inputProdutoId').value;
    const produtoNome = document.getElementById('inputProduto').value;
    let valorBase = parseFloat(document.getElementById('inputValorUnitarioBase').value);
    const quantidade = parseInt(document.getElementById('inputQuantidade').value);
    const descontoPercentual = parseFloat(document.getElementById('inputDesconto').value) || 0;

    if (!produtoId || quantidade <= 0 || isNaN(valorBase)) { alert('Selecione um produto e quantidade.'); return; }

    const descontoFator = 1 - (descontoPercentual / 100);
    const valorUnitarioFinal = valorBase * descontoFator;
    const totalItem = valorUnitarioFinal * quantidade;

    carrinho.push({
        produto_id: produtoId, nome: produtoNome, quantidade: quantidade, valor_base: valorBase,
        desconto_percentual: descontoPercentual, valor_unitario_final: valorUnitarioFinal, total: totalItem
    });
    
    document.getElementById('inputProduto').value = '';
    document.getElementById('inputProdutoId').value = '';
    document.getElementById('inputValorUnitarioBase').value = '';
    document.getElementById('inputQuantidade').value = 1;
    document.getElementById('inputDesconto').value = 0.00;
    
    renderizarCarrinho();
}

function calcularTotais() {
    let subtotal = carrinho.reduce((acc, item) => acc + item.total, 0);
    const frete = parseFloat(document.getElementById('inputFrete').value) || 0;
    const totalGeral = subtotal + frete;

    document.getElementById('subtotalValor').textContent = formatarMoeda(subtotal);
    document.getElementById('freteValorDisplay').textContent = frete.toFixed(2).replace('.', ',');
    document.getElementById('totalGeralValor').textContent = formatarMoeda(totalGeral);
    return { subtotal, frete, totalGeral };
}

function renderizarCarrinho() {
    const lista = document.getElementById('listaCarrinho');
    lista.innerHTML = '';
    
    if (carrinho.length === 0) {
        lista.innerHTML = '<li>Carrinho vazio. Adicione um produto.</li>';
    }

    carrinho.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.nome} (x${item.quantidade})</span>
            <span>
                ${formatarMoeda(item.total)} 
                <button class="btn-danger" style="padding: 5px;" onclick="removerItemCarrinho(${index})">X</button>
            </span>
        `;
        lista.appendChild(li);
    });
    calcularTotais();
}

function limparFormularioVenda() {
    carrinho = [];
    clienteSelecionado = { id: null, nome: null, telefone: null };
    document.getElementById('formVenda').reset();
    document.getElementById('inputClienteId').value = '';
    document.getElementById('statusClienteSelecionado').innerHTML = 'Aguardando seleção do cliente...';
    renderizarCarrinho();
    desabilitarControlesVendas(true);
}


// ====================================================================
// 4. FINALIZAÇÃO E WHATSAPP (MANTIDA)
// ====================================================================

function formatarPedidoWhatsApp(totais) {
    const telefoneCliente = clienteSelecionado.telefone; 
    
    if (!telefoneCliente) {
        return { error: true, msg: "Telefone do cliente não cadastrado. Não é possível enviar o WhatsApp." };
    }
    
    let mensagem = `*📝 PEDIDO DE VENDA - ${clienteSelecionado.nome.toUpperCase()}*\n\n*--- ITENS ---*\n`;
    
    carrinho.forEach((item, index) => {
        mensagem += `${index + 1}. ${item.nome} (x${item.quantidade})\n`;
        if (item.desconto_percentual > 0) {
            mensagem += `   -> Desconto: ${item.desconto_percentual.toFixed(2)}%\n`;
        }
    });

    mensagem += `\n*--- TOTAIS ---*\n`;
    mensagem += `Subtotal: ${formatarMoeda(totais.subtotal)}\n`;
    if (totais.frete > 0) {
        mensagem += `Frete: ${formatarMoeda(totais.frete)}\n`;
    }
    mensagem += `*TOTAL GERAL: ${formatarMoeda(totais.totalGeral)}*\n\n`;
    mensagem += `Agradecemos a sua preferência!`;

    const url = `https://api.whatsapp.com/send?phone=55${telefoneCliente.replace(/\D/g, '')}&text=${encodeURIComponent(mensagem)}`;
    return { error: false, url };
}

async function finalizarVenda(event) {
    event.preventDefault();

    if (!clienteSelecionado.id || carrinho.length === 0 || !empresaLogada) {
        alert('Selecione cliente, adicione itens e verifique se a empresa está logada.');
        return;
    }

    const totais = calcularTotais();

    const vendaData = { 
        cliente_id: clienteSelecionado.id, 
        empresa_id: empresaLogada, 
        valor_total: totais.totalGeral, 
        data_venda: new Date().toISOString() 
    };
    
    const { data: vendaInserida, error: vendaError } = await supabase.from('vendas').insert([vendaData]).select('id').single();
    
    if (vendaError) { console.error('Erro ao salvar venda:', vendaError); alert('Erro ao finalizar venda.'); return; }
    
    const novaVendaId = vendaInserida.id;

    const itensVenda = carrinho.map(item => ({
        venda_id: novaVendaId,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario_final,
        desconto_percentual: item.desconto_percentual
    }));
    
    const { error: itensError } = await supabase.from('itens_venda').insert(itensVenda);
    
    if (itensError) { console.error('Erro ao salvar itens:', itensError); alert('Venda salva, mas itens falharam. Contate suporte.'); return; }
    
    alert(`Venda nº ${novaVendaId.substring(0, 8)} finalizada e salva!`);
    
    const whatsappInfo = formatarPedidoWhatsApp(totais);
    if (!whatsappInfo.error) {
        window.open(whatsappInfo.url, '_blank');
    } else {
        alert(whatsappInfo.msg);
    }
    
    limparFormularioVenda();
}


// ====================================================================
// 5. INICIALIZAÇÃO DO MÓDULO (Exportado)
// ====================================================================

export function initVendasPDV() {
    console.log('Módulo PDV inicializado.');
    
    document.getElementById('inputCliente').addEventListener('input', handleClienteInput);
    document.getElementById('inputProduto').addEventListener('input', (e) => buscarProdutos(e.target.value));
    
    document.getElementById('btnAdicionarProduto').addEventListener('click', adicionarProdutoAoCarrinho);
    document.getElementById('formVenda').addEventListener('submit', finalizarVenda);
    document.getElementById('formCadastroRapidoCliente').addEventListener('submit', salvarClienteRapido);
    
    document.getElementById('inputFrete').addEventListener('input', calcularTotais);

    window.removerItemCarrinho = (index) => { carrinho.splice(index, 1); renderizarCarrinho(); };
    window.fecharModalCadastro = fecharModalCadastro;

    limparFormularioVenda();
}