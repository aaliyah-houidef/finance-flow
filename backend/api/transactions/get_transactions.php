<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');

include '../../config/database.php';  // Vérifie que le chemin est correct

$database = new Database();
$pdo = $database->getConnection();

if ($pdo) {
    if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
        $user_id = $_GET['user_id'];
        $stmt = $pdo->prepare('SELECT * FROM transaction WHERE id_user = :user_id');
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'transactions' => $transactions
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'ID utilisateur manquant'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Connexion à la base de données échouée.'
    ]);
}
?>

