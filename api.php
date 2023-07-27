<?php
// carregue os dados JSON
$planos = json_decode(file_get_contents("plans.json"), true);
$precos = json_decode(file_get_contents("prices.json"), true);
// Verifique se a requisição é do tipo POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // obtenha os dados enviados pelo cliente
    $data = json_decode(file_get_contents("php://input"), true);

    // extraia os dados da proposta
    $registroPlano = $data["registro_plano"];
    $beneficiarios = $data["beneficiarios"];
    $qtd_beneficiarios = count($beneficiarios);

    // procure o plano e o preço correspondentes
    $plano = null;

    foreach ($planos as $p) {
        if ($p["registro"] == $registroPlano) {
            $plano = $p;
            break;
        }
    }
    $preco = null;
    $maiorMinimoVidas = -1;  // número inicial alto o suficiente
    foreach ($precos as $pc) {
        if ($pc["codigo"] == $plano["codigo"] &&
            $pc["minimo_vidas"] <= $qtd_beneficiarios &&
            $pc["minimo_vidas"] > $maiorMinimoVidas) {
            $maiorMinimoVidas = $pc["minimo_vidas"];
            $preco = $pc;
        }
    }

    // verifique se o plano e o preço foram encontrados
    if ($plano === null || $preco === null) {
        http_response_code(400);
        echo json_encode(array("error" => "Plano não encontrado."));
        exit;
    }

    // calcule o preço para cada beneficiário e o preço total
    $precoTotal = 0;
    foreach ($beneficiarios as &$beneficiario) {
        if ($beneficiario["idade"] <= 17) {
            $beneficiario["preco"]= $preco["faixa1"];
        } else if ($beneficiario["idade"] <= 40) {
            $beneficiario["preco"] = $preco["faixa2"];
        } else {
            $beneficiario["preco"] = $preco["faixa3"];
        }
        $precoTotal += $beneficiario["preco"];
    }

    // monte a resposta
    $response = array(
        "plano" => $plano["nome"],
        "preco_total" => $precoTotal,
        "beneficiarios" => $beneficiarios
    );

    // salve a proposta no arquivo "proposta.json"
    $propostas = json_decode(file_get_contents("proposta.json"), true);
    $propostas[] = $response;
    file_put_contents("proposta.json", json_encode($propostas));

    // envie a resposta como JSON
    header("Content-Type: application/json");
    echo json_encode($response);
}
?>
