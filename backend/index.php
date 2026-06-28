<?php

require_once __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_SPECIAL_CHARS) ?? 'health';

if ($action === 'health') {
    jsonResponse([
        'ok' => true,
        'app' => 'starttmux',
        'version' => 'mini-mvp',
    ]);
}

jsonResponse(['error' => 'Unknown action'], 404);