<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if (str_starts_with($uri, '/backend/')) {
    $backendPath = substr($uri, strlen('/backend'));
    $backendPort = getenv('BACKEND_PORT') ?: '8081';
    $query = $_SERVER['QUERY_STRING'] ?? '';
    $target = "http://127.0.0.1:{$backendPort}{$backendPath}" . ($query ? "?{$query}" : '');

    $ch = curl_init($target);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
        CURLOPT_HTTPHEADER => array_filter([
            'Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? ''),
            'Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? ''),
        ]),
        CURLOPT_POSTFIELDS => in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'], true)
            ? file_get_contents('php://input') : null,
    ]);
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);

    http_response_code($status);
    foreach (explode("\r\n", $headers) as $header) {
        if (stripos($header, 'Content-Type:') === 0 || stripos($header, 'Access-Control-') === 0) {
            header($header, false);
        }
    }
    echo $body;
    exit;
}

$file = __DIR__ . $uri;

if ($uri !== '/' && is_file($file)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (in_array($ext, ['html', 'js', 'css'], true)) {
        header('Cache-Control: no-cache, no-store, must-revalidate');
    }
    return false;
}

if ($uri === '/' || $uri === '') {
    header('Location: /index.html');
    exit;
}

http_response_code(404);
echo 'Not found';