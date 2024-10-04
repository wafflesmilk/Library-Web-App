<?php

// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
$input = json_decode(file_get_contents('php://input'), true);

// connect to the mysql database, provide the appropriate credentials
$conn = mysqli_connect('db_server', 'username', 'password', 'db_name');
mysqli_set_charset($conn, 'utf8');

// check if the table name is provided in the URL
if (count($request) < 1) {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "Table name is required"]);
    exit;
}

// initialise the table name from the URL
$table = preg_replace('/[^a-z0-9_]+/i', '', array_shift($request));

// retrieve the search key field names and values from the path
$fld1 = preg_replace('/[^a-z0-9_]+/i', '', array_shift($request));
$key1 = array_shift($request);
$fld2 = preg_replace('/[^a-z0-9_]+/i', '', array_shift($request));
$key2 = array_shift($request);

// retrieve the data to prepare set values
if (isset($input)) {
    $columns = preg_replace('/[^a-z0-9_]+/i', '', array_keys($input));
    $values = array_map(function ($value) use ($conn) {
        if ($value === null) return null;
        return mysqli_real_escape_string($conn, (string)$value);
    }, array_values($input));

    $set = '';
    for ($i = 0; $i < count($columns); $i++) {
        $set .= ($i > 0 ? ',' : '') . '`' . $columns[$i] . '`=';
        $set .= ($values[$i] === null ? 'NULL' : '"' . $values[$i] . '"');
    }
}

// create SQL
switch ($method) {
    case 'GET':
        if ($key1 && $key2) {
            $sql = "SELECT * FROM `$table` WHERE $fld1='$key1' AND $fld2='$key2'";
        } elseif ($key1) {
            $sql = "SELECT * FROM `$table` WHERE $fld1='$key1'";
        } else {
            $sql = "SELECT * FROM `$table`";
        }
        break;
    case 'PUT':
        if ($key1 && $key2) {
            $sql = "UPDATE `$table` SET $set WHERE $fld1='$key1' AND $fld2='$key2'";
        } elseif ($key1) {
            $sql = "UPDATE `$table` SET $set WHERE $fld1='$key1'";
        } else {
            $sql = "UPDATE `$table` SET $set WHERE 0=1"; // Invalid query if no keys are provided
        }
        break;
    case 'POST':
        $sql = "INSERT INTO `$table` SET $set";
        break;
    case 'DELETE':
        if ($key1 && $key2) {
            $sql = "DELETE FROM `$table` WHERE $fld1='$key1' AND $fld2='$key2'";
        } elseif ($key1) {
            $sql = "DELETE FROM `$table` WHERE $fld1='$key1'";
        } else {
            $sql = "DELETE FROM `$table` WHERE 0=1"; // Invalid query if no keys are provided
        }
        break;
}

// execute SQL statement
$result = mysqli_query($conn, $sql);
if ($result) {
    if ($method == 'GET') {
        header('Content-Type: application/json');
        echo '[';
        for ($i = 0; $i < mysqli_num_rows($result); $i++) {
            echo ($i > 0 ? ',' : '') . json_encode(mysqli_fetch_object($result));
        }
        echo ']';
    } elseif ($method == 'POST') {
        echo mysqli_insert_id($conn);
    } else {
        echo mysqli_affected_rows($conn);
    }
}

// close mysql connection
mysqli_close($conn);
?>
