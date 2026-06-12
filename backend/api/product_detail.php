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

if (!isset($_GET["id"])) {
    die(json_encode(["error" => "ID da camisa não fornecido"]));
}

$id = intval($_GET["id"]);

$sql = "SELECT
            id,
            nome AS title,
            preco,
            imagem,
            estoque AS qtd_estoque,
            time_nome,
            liga,
            temporada,
            patrocinador,
            pais,
            tamanho,
            descricao
        FROM jerseys
        WHERE id = $id
        LIMIT 1";

$result = $conn->query($sql);

if ($result->num_rows > 0) {

    $row = $result->fetch_assoc();

    $product = [
    "id" => (int)$row["id"],
    "title" => $row["title"],
    "preco" => (float)$row["preco"],
    "imagem" => $row["imagem"],
    "qtd_estoque" => (int)$row["qtd_estoque"],

    "clube" => $row["time_nome"],
    "liga" => $row["liga"],
    "temporada" => $row["temporada"],
    "patrocinador" => $row["patrocinador"],
    "pais" => $row["pais"],
    "tamanho" => $row["tamanho"],

    "descricao" => $row["descricao"]
];

    echo json_encode($product, JSON_UNESCAPED_UNICODE);

} else {
    echo json_encode(["error" => "Produto não encontrado"]);
}

$conn->close();
?>