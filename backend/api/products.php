<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$sql = "SELECT
            id,
            nome AS title,
            preco,
            imagem,
            estoque AS qtd_estoque
        FROM jerseys";

$result = $conn->query($sql);

$products = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            "id" => (int)$row["id"],
            "title" => $row["title"],
            "preco" => (float)$row["preco"],
            "imagem" => $row["imagem"],
            "qtd_estoque" => (int)$row["qtd_estoque"]
        ];
    }
}

echo json_encode($products, JSON_UNESCAPED_UNICODE);

$conn->close();
?>