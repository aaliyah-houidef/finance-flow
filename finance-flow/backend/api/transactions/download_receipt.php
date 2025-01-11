<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['filename'])) {
    $filename = $_GET['filename'];
    $filepath = __DIR__ . '/uploads/payment_confirmation/' . $filename;
    
    if (file_exists($filepath)) {
        // Détecter le type MIME du fichier
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $filepath);
        finfo_close($finfo);
        
        // Configurer les en-têtes pour le téléchargement
        header('Content-Type: ' . $mime_type);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($filepath));
        header('Pragma: public');
        
        // Lire et envoyer le fichier
        readfile($filepath);
        exit;
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Fichier non trouvé'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Paramètre filename manquant'
    ]);
}
?>
