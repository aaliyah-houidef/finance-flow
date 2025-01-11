
<?php
class User {
    private $conn;
    private $table_name = "user"; // Nom de votre table

    public $id;
    public $name;
    public $email;
    // Ajoutez d'autres propriétés selon votre structure de table

    public function __construct($db) {
        $this->conn = $db;
    }

    // Récupérer tous les utilisateurs
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Récupérer un utilisateur par ID
    public function getOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        return $stmt;
    }

    // Créer un nouvel utilisateur
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (name, email) VALUES (:name, :email)";
        $stmt = $this->conn->prepare($query);

        // Nettoyer les données
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Lier les paramètres
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);

        return $stmt->execute();
    }
}