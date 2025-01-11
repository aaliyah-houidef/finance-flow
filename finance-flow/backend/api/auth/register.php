<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password) && !empty($data->username)) {
    try {
        // Vérifier si l'email existe déjà
        $check_query = "SELECT id FROM user WHERE email = :email LIMIT 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Cette adresse email est déjà utilisée"
            ]);
            exit;
        }

        // Hasher le mot de passe
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

        // Insérer le nouvel utilisateur
        $query = "INSERT INTO user (username, email, password, balance) VALUES (:username, :email, :password, :balance)";
        $stmt = $db->prepare($query);

        $default_balance = 0; // Balance par défaut pour les nouveaux utilisateurs
        
        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":balance", $default_balance);

        if ($stmt->execute()) {
            $user_id = $db->lastInsertId();
            
            // Retourner l'utilisateur créé (sans le mot de passe)
            echo json_encode([
                "success" => true,
                "message" => "Compte créé avec succès",
                "user" => [
                    "id" => $user_id,
                    "username" => $data->username,
                    "email" => $data->email,
                    "balance" => $default_balance
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la création du compte"
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Erreur de base de données: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Données incomplètes"
    ]);
}