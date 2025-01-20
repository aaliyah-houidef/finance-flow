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

if (!isset($_GET['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
    exit;
}

$userId = $_GET['user_id'];
$categoryId = isset($_GET['category_id']) ? $_GET['category_id'] : null;

if ($pdo) {
    try {
        $query = 'SELECT t.*, c.name as category_name, sc.name as subcategory_name 
                 FROM transaction t 
                 LEFT JOIN category c ON t.id_category = c.id 
                 LEFT JOIN subcategory sc ON t.id_subcategory = sc.id 
                 WHERE t.id_user = :user_id AND t.type = "expense"';
        
        if ($categoryId) {
            $query .= ' AND t.id_category = :category_id';
        }
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        
        if ($categoryId) {
            $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'transactions' => $transactions
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération des transactions : ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Connexion à la base de données échouée.'
    ]);
}
?>