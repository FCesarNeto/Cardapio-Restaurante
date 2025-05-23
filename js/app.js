$(document).ready(function () {
    cardapio.eventos.init();
});

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;    

var VALOR_CARRINHO = 0;

var CELULAR_EMPRESA = '5514997055683';

cardapio.eventos = {
   
    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoReserva();
        cardapio.metodos.carregarBotaoLigar();
        cardapio.metodos.carregarBotaoWhatsApp();

        // Evento para habilitar/desabilitar os campos de endereço ao marcar "Retirar no local"
    $("#retirada").change(function () {
        const desabilitar = $(this).is(":checked");

        $("#txtCEP").prop("disabled", desabilitar);
        $("#txtEndereco").prop("disabled", desabilitar);
        $("#txtBairro").prop("disabled", desabilitar);
        $("#txtCidade").prop("disabled", desabilitar);
        $("#ddlUf").prop("disabled", desabilitar);
        $("#txtNumero").prop("disabled", desabilitar);
        $("#txtComplemento").prop("disabled", desabilitar);

        if (desabilitar) {
            // Se marcado para retirada, limpa os campos
            $("#txtCEP, #txtEndereco, #txtBairro, #txtCidade, #ddlUf, #txtNumero, #txtComplemento").val('');
        }
    });

    }
}

cardapio.metodos = {
    
    // Obtem a lista de intens do cardapio
     obterItensCardapio: (categoria = 'burgers', vermais = false) => {
       
        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('hidden');
        }

        $.each(filtro, (i, e) => {

            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${dsc}/g, e.dsc)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)
            
            //botão ver mais foi clicado (12 itens)
            if (vermais && i >= 8 && i < 12) {
                $("#itensCardapio").append(temp)
            }

            // paginação inicial (8 Itens)
            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }

        })

        //remove o ativo
        $(".container-menu a").removeClass('active');

        // seta o menu para ativo
        $("#menu-" + categoria).addClass('active')

    },

    // clique no botao de ver mais
    verMais: () => {
        var categoriaAtiva = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(categoriaAtiva, true);
    
        // Esconde o botão "Ver Mais" após carregar mais itens
        $("#btnVerMais").addClass('hidden');
    },
    
    
    //diminuir a quantidade do item no cardapio
    diminuirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }

    },
    
    //aumentar a quantidade do item no cardapio
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1)

    },

    //adicionar ao carrinho o item do cardápio
    adicionarAoCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());
    
        if (qntdAtual > 0) {
            // Obtém a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];
    
            // Obtém o item correspondente na categoria ativa
            let item = MENU[categoria].find(e => e.id == id);
    
            if (item) {
                // Verifica se o item já está no carrinho
                let carrinhoItem = MEU_CARRINHO.find(elem => elem.id == id);
    
                if (carrinhoItem) {
                    carrinhoItem.qntd += qntdAtual; // Atualiza a quantidade
                } else {
                    item.qntd = qntdAtual; // Adiciona novo item
                    MEU_CARRINHO.push(item);
                }
    
                cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green');
                $("#qntd-" + id).text(0);
    
                cardapio.metodos.atualizarBadgeTotal();
            }
        }
    },    
    //atualiza o badge de totais dos botoes Meu carrinho
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })
        
        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else {
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);

    },

    //abrir modal de carrinho

    abrirCarrinho: (abrir) => {

        if (abrir) {
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        }
        else {
            $("#modalCarrinho").addClass('hidden');
        }

    },

    // altera os texto e exibe os botoes das etapas
    carregarEtapa: (etapa) => {

        if(etapa ==1) {
            $("#lblTituloEtapa").text('Seu carrinho:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }
        
        if(etapa ==2) {
            $("#lblTituloEtapa").text('Endereco de Entrega:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
        
        if(etapa ==3) {
            $("#lblTituloEtapa").text('Resumo do Pedido:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
    },

        // botao de voltar etapa
        voltarEtapa: () => {

            let etapa = $(".etapa.active").length;
            cardapio.metodos.carregarEtapa(etapa - 1)
        },
        
        // carrega a lista de intens do carrinho
        carregarCarrinho: () => {
            
            cardapio.metodos.carregarEtapa(1);
            
            if (MEU_CARRINHO.length > 0) {

                $("#itensCarrinho").html('');

                $.each(MEU_CARRINHO, (i, e) => {

                    let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${dsc}/g, e.dsc)  /* Adiciona descrição */
                    .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                    .replace(/\${id}/g, e.id)
                    .replace(/\${qntd}/g, e.qntd)

                    $("#itensCarrinho").append(temp);

                    //ultimo item
                    if ((i + 1) == MEU_CARRINHO.length) {
                        cardapio.metodos.carregarValores();
                    }

                })
            
            }
            else {
                $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
                cardapio.metodos.carregarValores();
            }
        },
        
        // Diminuir quantidade do item do carrinho
        diminuirQuantidadeCarrinho: (id) => {

            let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

            if (qntdAtual > 1) {
                $("#qntd-carrinho-" + id).text(qntdAtual - 1);
                cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
            }
            else {
                cardapio.metodos.removerItemCarrinho(id)
            }
        },

        // aumentar quantidade do item do carrinho
        aumentarQuantidadeCarrinho: (id) => {

            let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
            $("#qntd-carrinho-" + id).text(qntdAtual + 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
        },

        // botao remover item do carrinho
        removerItemCarrinho: (id) => {
            
            MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id})
            cardapio.metodos.carregarCarrinho();

            // Atualiza o botao carrinho com a quantidade atualizada
            cardapio.metodos.atualizarBadgeTotal();
        },

    // atualiza o carrinho com a quantidade atual    
        atualizarCarrinho: (id, qntd) => {
            
            let objIndex = MEU_CARRINHO.findIndex((obj => obj.id ==id));
            MEU_CARRINHO[objIndex].qntd = qntd;

            // Atualiza o botao carrinho com a quantidade atualizada
            cardapio.metodos.atualizarBadgeTotal();

            // atualiza os valores ( R$) totais do carrinho
            cardapio.metodos.carregarValores();
        },

        //carrega os valores de subtotal, entrega e total
        carregarValores: () => {

            VALOR_CARRINHO = 0;
            VALOR_ENTREGA = 0;

            $("#lblSubTotal").text('R$ 0,00');
            $("#lblValorEntrega").text('Consultar valores');
            $("#lblValorTotal").text('R$ 0,00');

            $.each(MEU_CARRINHO, (i, e) => {

                VALOR_CARRINHO += parseFloat(e.price * e.qntd);

                if ((i + 1) == MEU_CARRINHO.length) {
                    $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                    $("#lblValorEntrega").text('Consultar valores');
                    $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
                }

            })

        },

        //carregar a etapa enderecos
        carregarEndereco: () => {
            if (MEU_CARRINHO.length <= 0) {
                cardapio.metodos.mensagem('Seu carrinho esta vazio.')
                return; 
            }
                cardapio.metodos.carregarEtapa(2);
        },

        // API viaCEP
        buscarCep: () => {
            
         //cria a variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g,'');
            
        // verifica se o CEP tem o valor informado
        if (cep != "") {    

         //Expressao regular para validar CEP
         var validacep = /^[0-9]{8}$/;

         if (validacep.test(cep)) {

                    $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                        if (!("erro" in dados)) {

                            // atualizar os campos com os valores retornados 
                            $("#txtEndereco").val(dados.logradouro);
                            $("#txtBairro").val(dados.bairro);
                            $("#txtCidade").val(dados.localidade);
                            $("#ddlUf").val(dados.uf);     
                            $("#txtNumero").focus();

                        }
                        else {
                            cardapio.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                            $("#txtEndereco").focus();
                        }

                    })
        }

        else {
                    cardapio.metodos.mensagem('Formato do CEP inválido.');
                    $("#txtCEP").focus();
                    
         }

         }
        else {
                cardapio.metodos.mensagem('Informe o CEP, por favor.');
                $("#txtCEP").focus();
            }
        },
        
        // validacao antes de prosseguir para a etapa 3
        resumoPedido: () => {
            const retirarPedido = $("#retirada").is(":checked");
        
            // Inicializa os dados como vazios
            let cep = '', endereco = '', bairro = '', cidade = '', uf = '', numero = '', complemento = '';
        
            // Se NÃO for retirada, pega os dados dos campos e valida
            if (!retirarPedido) {
                cep = $("#txtCEP").val().trim();
                endereco = $("#txtEndereco").val().trim();
                bairro = $("#txtBairro").val().trim();
                cidade = $("#txtCidade").val().trim();
                uf = $("#ddlUf").val().trim();
                numero = $("#txtNumero").val().trim();
                complemento = $("#txtComplemento").val().trim();
        
                if (!cep) {
                    cardapio.metodos.mensagem('Informe o CEP, por favor.');
                    $("#txtCEP").focus();
                    return;
                }
        
                if (!endereco) {
                    cardapio.metodos.mensagem('Informe o Endereço, por favor.');
                    $("#txtEndereco").focus();
                    return;
                }
        
                if (!bairro) {
                    cardapio.metodos.mensagem('Informe o Bairro, por favor.');
                    $("#txtBairro").focus();
                    return;
                }
        
                if (!cidade) {
                    cardapio.metodos.mensagem('Informe a Cidade, por favor.');
                    $("#txtCidade").focus();
                    return;
                }
        
                if (!uf) {
                    cardapio.metodos.mensagem('Informe a UF, por favor.');
                    $("#ddlUf").focus();
                    return;
                }
        
                if (!numero) {
                    cardapio.metodos.mensagem('Informe o Número, por favor.');
                    $("#txtNumero").focus();
                    return;
                }
            }
        
            MEU_ENDERECO = {
                cep,
                endereco,
                bairro,
                cidade,
                uf,
                numero,
                complemento,
                retirarPedido
            };
        
            cardapio.metodos.carregarEtapa(3);
            cardapio.metodos.carregarResumo();
        },        
        
        // carrega a etapa do resumo do pedido
        carregarResumo: () => {
            $('#listaItensResumo').html('');
        
            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemResumo
                    .replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${dsc}/g,   e.dsc)        
                    .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                    .replace(/\${qntd}/g, e.qntd);
        
                $('#listaItensResumo').append(temp);
            });
        
            if (MEU_ENDERECO.retirarPedido) {
                $('#resumoEndereco').html(`<strong>Vou retirar meu pedido.</strong>`);
                $('#cidadeEndereco').html('');
            } else {
                $('#resumoEndereco').html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
                $('#cidadeEndereco').html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);
            }
        
            cardapio.metodos.finalizarPedido();
        },
        
        //atualiza o link do botao do WhatsApp
        finalizarPedido: () => {
            if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
                let totalPedido = VALOR_CARRINHO;
             let texto = 'Olá! Gostaria de fazer um pedido:';
                texto += `\n*Itens do pedido:*\n\n`;
                let itens = '';
                // Preencher os itens
                $.each(MEU_CARRINHO, (i, e) => {
                    itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;
                });
                // Adiciona os itens diretamente ao texto
                texto += itens;
                texto += `\n\n*Total: R$ ${totalPedido.toFixed(2).replace('.', ',')}*`;
        
                if (MEU_ENDERECO.retirarPedido) {
                    texto += `\n*Vou retirar meu pedido.*`;
                } else {
                    texto += `\n*Endereço de entrega:*`;
                    texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
                    texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
                }
        
                // Converte a URL
                let encode = encodeURI(texto);
                let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;
        
                $("#btnEtapaResumo").attr('href', URL);
            }
        },        
        // carrega o link do botao reserva
        carregarBotaoReserva: () => {
            var texto = 'Olá, gostaria de fazer um pedido para retirada!';

            let encode = encodeURI(texto);
            let URL =  `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

            $('#btnReserva').attr('href', URL);
        },
        
        //carrega o botao de ligar
        carregarBotaoLigar: () => {

            $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

        },    

        //abre o depoimento
        abrirDepoimento: (depoimento) => {

            $("#depoimento-1").addClass('hidden');
            $("#depoimento-2").addClass('hidden');
            $("#depoimento-3").addClass('hidden');

            $("#btnDepoimento-1").removeClass('active');
            $("#btnDepoimento-2").removeClass('active');
            $("#btnDepoimento-3").removeClass('active');
        
            $("#depoimento-" + depoimento).removeClass('hidden');
            $("#btnDepoimento-" + depoimento).addClass('active');
        },

        carregarBotaoWhatsApp: () => {
            var texto = 'Olá, gostaria de fazer um pedido.*';

            let encode = encodeURI(texto);
            let URL =  `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

            $('#btnWhatsApp').attr('href', URL);
        },


    // mensagens
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;
        
        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo)
    }
}

cardapio.templates = {

    item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                     <img src="\${img}"/>
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="dsc-produto text-center">
                    <b>\${dsc}</b>
                </p>    
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
             </div>
         </div>
    `,
    
    itemCarrinho: `
            <div class="col-12 item-carrinho">
                    <div class="img-produto">
                        <img src="\${img}"/>
                    </div>
                    <div class="dados-produto">
                        <p class="title-produto"><b>\${nome}</b></p>
                        <p class="dsc-produto">\${dsc}</p>
                    </div>

                <div class="botao-adc">  
                    <div class="add-carrinho">
                         <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                         <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                         <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                         <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
                    </div>            
                </div>          
            </div>     
     `,
     
     itemResumo: `
       <div class="col-12 item-carrinho resumo">
                                        <div class="img-produto-resumo">
                                            <img src="\${img}"></img>
                                        </div>
                                        <div class="dados-produto">
                                            <p class="title-produto-resumo">
                                                <b>\${nome}</b> 
                                            </p>
                                             <b>\${dsc}</b>
                                            <p class="price-produto-resumo">
                                                <b>R$\${preco}</b>
                                            </p>
                                        </div>
                                        <p class="quantidade-produto-resumo">
                                            x <b>\${qntd}</b>
                                        </p>
                                    </div>
     `
}