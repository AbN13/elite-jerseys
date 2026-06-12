<?php
// Configurações de Segurança (CORS) - Permite o Angular acessar
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Recebe o CEP (parâmetro GET)
$cep = isset($_GET['cep']) ? preg_replace('/[^0-9]/', '', $_GET['cep']) : '';

// 1. Validação básica do CEP
if (empty($cep) || strlen($cep) !== 8) {
    http_response_code(400);
    echo json_encode(["error" => "CEP inválido ou não fornecido."]);
    exit();
}

// 2. Chama o ViaCEP
$url_viacep = "https://viacep.com.br/ws/" . $cep . "/json/";
$response_viacep = @file_get_contents($url_viacep);

if ($response_viacep === FALSE) {
    // Erro de comunicação com o ViaCEP
    http_response_code(500);
    echo json_encode(["error" => "Erro ao conectar com a API de CEP externa."]);
    exit();
}

$dados_viacep = json_decode($response_viacep, true);

// 3. Verifica se o CEP foi encontrado
if (isset($dados_viacep['erro']) && $dados_viacep['erro'] === true) {
    http_response_code(404);
    echo json_encode(["error" => "CEP não encontrado."]);
    exit();
}

// 4. Prepara a resposta no formato esperado pelo Angular
$endereco_response = [
    "logradouro" => $dados_viacep['logradouro'] ?? '',
    "bairro" => $dados_viacep['bairro'] ?? '',
    "cidade" => $dados_viacep['localidade'] ?? '', // O ViaCEP usa 'localidade' para cidade
    "estado" => $dados_viacep['uf'] ?? '',         // O ViaCEP usa 'uf' para estado
];

// 5. Envia a resposta final
echo json_encode($endereco_response);
?>
