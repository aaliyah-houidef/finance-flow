<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../../config/database.php';

$database = new Database();
$pdo = $database->getConnection();

if ($pdo) {
    try {
        // Gérer l'upload du fichier
        $payment_confirmation = null;
        if (isset($_FILES['payment_confirmation']) && $_FILES['payment_confirmation']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = __DIR__ . '/uploads/payment_confirmation/';
            
            // Créer le répertoire s'il n'existe pas
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            // Générer un nom de fichier unique
            $file_extension = strtolower(pathinfo($_FILES['payment_confirmation']['name'], PATHINFO_EXTENSION));
            $file_name = uniqid() . '_' . time() . '.' . $file_extension;
            $upload_path = $upload_dir . $file_name;
            
            // Vérifier le type de fichier
            $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            $file_type = $_FILES['payment_confirmation']['type'];
            
            if (!in_array($file_type, $allowed_types)) {
                throw new Exception('Type de fichier non autorisé');
            }
            
            // Déplacer le fichier
            if (move_uploaded_file($_FILES['payment_confirmation']['tmp_name'], $upload_path)) {
                $payment_confirmation = $file_name;
            } else {
                throw new Exception('Erreur lors de l\'upload du fichier');
            }
        }

        // Préparer les données
        $id_subcategory = !empty($_POST['id_subcategory']) ? $_POST['id_subcategory'] : null;

        // Préparer l'insertion de la transaction
        $stmt = $pdo->prepare('
            INSERT INTO transaction (
                id_user, 
                amount, 
                date, 
                type, 
                payment_method, 
                description, 
                recurrence, 
                payment_confirmation, 
                id_category, 
                id_subcategory
            ) 
            VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $_POST['id_user'],
            $_POST['amount'],
            $_POST['type'],
            $_POST['payment_method'],
            $_POST['description'],
            $_POST['recurrence'],
            $payment_confirmation, // Nom du fichier ou null
            $_POST['id_category'],
            $id_subcategory // Null si pas de sous-catégorie
        ]);

        // Mettre à jour le solde de l'utilisateur
        $amount = $_POST['type'] === 'expense' ? -$_POST['amount'] : $_POST['amount'];
        $updateStmt = $pdo->prepare('UPDATE user SET balance = balance + ? WHERE id = ?');
        $updateStmt->execute([$amount, $_POST['id_user']]);

        // Récupérer le nouveau solde
        $balanceStmt = $pdo->prepare('SELECT balance FROM user WHERE id = ?');
        $balanceStmt->execute([$_POST['id_user']]);
        $new_balance = $balanceStmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'message' => 'Transaction ajoutée avec succès',
            'new_balance' => $new_balance
        ]);
        
    } catch (Exception $e) {
        // Si une erreur survient et qu'un fichier a été uploadé, le supprimer
        if (isset($payment_confirmation) && file_exists($upload_path)) {
            unlink($upload_path);
        }
        
        echo json_encode([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données'
    ]);
}
?>
