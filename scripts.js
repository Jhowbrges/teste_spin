$(document).ready(function () {
    let numBeneficiarios = 0;

    async function carregarPlanos() {
        try {
            const response = await fetch('plans.json');
            const planos = await response.json();

            const selectRegistroPlano = $('#registro_plano');

            if (planos.length === 0) {
                selectRegistroPlano.html('<option value="" disabled>Nenhum plano encontrado</option>');
                return;
            }

            for (const plano of planos) {
                const option = `<option value="${plano.registro}">${plano.nome}</option>`;
                selectRegistroPlano.append(option);
            }
        } catch (error) {
            console.error('Erro ao carregar os planos:', error);
        }
    }
    carregarPlanos();

    // Evento de mudança para a quantidade de beneficiários
    $('#qtd_beneficiarios').change(function () {
        const qtdSelecionada = parseInt($(this).val());
        const campoBeneficiarios = $('#beneficiarios');

        if (qtdSelecionada > numBeneficiarios) {
            while (numBeneficiarios < qtdSelecionada) {
                numBeneficiarios++;
                const novoBeneficiario = `
                    <input placeholder="Nome do Beneficiario" type="text" id="nome_beneficiario_${numBeneficiarios}" required>
                    <input placeholder="Idade do Benefíciario" type="number" id="idade_beneficiario_${numBeneficiarios}" required>
                `;
                campoBeneficiarios.append(novoBeneficiario);
            }
        } else if (qtdSelecionada < numBeneficiarios) {
            while (numBeneficiarios > qtdSelecionada) {
                $(`#nome_beneficiario_${numBeneficiarios}`).remove();
                $(`#idade_beneficiario_${numBeneficiarios}`).remove();
                $(`label_${numBeneficiarios}`).remove();
                numBeneficiarios--;
            }
        }

        console.log('numBeneficiarios:', numBeneficiarios);
    });

    // Adicionar evento ao formulário para enviar a proposta
    $('#formulario').submit(function (event) {
        event.preventDefault();

        const registroPlano = $('#registro_plano').val();

        const beneficiarios = [];
        for (let i = 1; i <= numBeneficiarios; i++) {
            if(numBeneficiarios => 1) {
                const nome = $(`#nome_beneficiario_${i}`).val();
                const idade = $(`#idade_beneficiario_${i}`).val();
                beneficiarios.push({nome, idade: parseInt(idade)});
            }
        }

        const data = {
            registro_plano: registroPlano,
            beneficiarios: beneficiarios
        };

        $.ajax({
            url: 'api.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                alert('Proposta enviada com sucesso!');
                carregarHistorico();
            },
            error: function (xhr, status, error) {
                alert('Erro ao enviar a proposta.');
            }
        });
    });

    // Carregar histórico de propostas
    carregarHistorico();
});

async function carregarHistorico() {
    try {
        const response = await fetch('proposta.json');
        const propostas = await response.json();

        const historicoDiv = $('#historico');
        historicoDiv.html('');

        if (propostas.length === 0) {
            historicoDiv.html('<p>Nenhuma proposta feita até o momento.</p>');
            return;
        }

        for (const proposta of propostas) {
            const propostaDiv = `
                <div>
                    <p>Plano: ${proposta.plano}</p>
                    <p>Preço Total: ${proposta.preco_total}</p>
                    <p>Beneficiários:</p>
                    <ul>
                        ${proposta.beneficiarios
                .map(
                    b => `<li>${b.nome}, ${b.idade} anos, Preço: ${b.preco}</li>`
                )
                .join('')}
                    </ul>
                    <hr>
                </div>
            `;
            historicoDiv.append(propostaDiv);
        }
    } catch (error) {
        console.error('Erro ao carregar o histórico de propostas:', error);
    }
}