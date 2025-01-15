<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../../config/database.php';

$database = new Database();
$pdo = $database->getConnection();

if ($pdo) {
    try {
        $stmt = $pdo->prepare('SELECT * FROM subcategory ORDER BY name');
        $stmt->execute();
        $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'subcategories' => $subcategories
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération des sous-catégories : ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Connexion à la base de données échouée.'
    ]);
}
?>