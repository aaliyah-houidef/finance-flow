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

if (!empty($data->email) && !empty($data->password)) {
    try {
        $query = "SELECT * FROM user WHERE email = :email LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($data->password, $user['password'])) {
                unset($user['password']);
                
                echo json_encode([
                    "success" => true,
                    "message" => "Connexion réussie",
                    "user" => $user
                ]);
                exit;
            } else {
                http_response_code(401);
                echo json_encode([
                    "success" => false,
                    "message" => "Mot de passe incorrect"
                ]);
                exit;
            }
        } else {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur non trouvé"
            ]);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Erreur de base de données: " . $e->getMessage()
        ]);
        exit;
    }
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Données incomplètes"
]);