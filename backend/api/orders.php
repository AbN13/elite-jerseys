<?php
// Configuração para permitir CORS (Crucial para o Angular)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Resposta para requisições OPTIONS (pré-voo CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verifica se o método é POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Método não permitido. Use POST."]);
    exit();
}

// 1. Receber e decodificar o JSON
$data = json_decode(file_get_contents("php://input"), true);

// Verifica se os dados foram recebidos corretamente
if (empty($data)) {
    http_response_code(400);
    echo json_encode(["message" => "Dados inválidos ou vazios."]);
    exit();
}

// 2. Validação básica (garantir que os campos essenciais estão presentes)
if (!isset($data['address']) || !isset($data['payment']) || !isset($data['items']) || !isset($data['total'])) {
    http_response_code(400);
    echo json_encode(["message" => "Dados obrigatórios do pedido (address, payment, items, total) estão faltando."]);
    exit();
}

// Validação simples de endereço e total
if (empty($data['address']['cep']) || empty($data['items']) || $data['total'] <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "O pedido não pode ser processado. Endereço ou itens inválidos."]);
    exit();
}

// 3. Simulação de Processamento do Pedido
// Em um ambiente real, você faria aqui:
// - Validação mais detalhada dos dados (ex: formato do cartão, CEP)
// - Conexão e inserção dos dados na tabela 'orders' do banco de dados (MySQL/PostgreSQL)
// - Chamada a um Gateway de Pagamento (Stripe, PagSeguro, etc.)
// - Envio de e-mail de confirmação

// Gera um ID de pedido simulado
$order_id = uniqid('ORD');
$current_date = date('Y-m-d H:i:s');

// 4. Retorno de Sucesso (201 Created - padrão para criação de recursos)
http_response_code(201);
echo json_encode([
    "message" => "Pedido recebido e processado com sucesso!",
    "orderId" => $order_id,
    "timestamp" => strtotime($current_date) * 1000,
    "total" => $data['total'],

    "items" => $data['items'],

    "payment" => $data['payment'],

    "address" => $data['address']
]);
?>
