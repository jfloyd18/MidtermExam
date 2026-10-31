<?php
// ---------------------------------------------------------------
// Student Records REST API — full CRUD
//
//   GET    students.php            -> list all students
//   GET    students.php?id=1       -> get one student
//   POST   students.php            -> create a student
//   PUT    students.php?id=1       -> update a student
//   DELETE students.php?id=1       -> delete a student
//
// Some free hosts block PUT/DELETE. In that case send a POST with
// "_method": "PUT" or "_method": "DELETE" in the JSON body.
// ---------------------------------------------------------------
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$body = ($method === 'GET') ? [] : json_body();

if ($method === 'POST' && isset($body['_method'])) {
    $method = strtoupper($body['_method']);
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : (isset($body['id']) ? (int) $body['id'] : null);

switch ($method) {
    case 'GET':
        $id ? getStudent($id) : listStudents();
        break;
    case 'POST':
        createStudent($body);
        break;
    case 'PUT':
        requireId($id);
        updateStudent($id, $body);
        break;
    case 'DELETE':
        requireId($id);
        deleteStudent($id);
        break;
    default:
        respond(405, ['success' => false, 'message' => 'Method not allowed']);
}

// ---------------- handlers ----------------

function listStudents(): void
{
    $rows = db()->query('SELECT * FROM students ORDER BY id DESC')->fetchAll();
    respond(200, ['success' => true, 'data' => array_map('castRow', $rows)]);
}

function getStudent(int $id): void
{
    $row = findStudent($id);
    if (!$row) {
        respond(404, ['success' => false, 'message' => 'Student not found']);
    }
    respond(200, ['success' => true, 'data' => castRow($row)]);
}

function createStudent(array $in): void
{
    $data = validate($in);
    $stmt = db()->prepare(
        'INSERT INTO students (student_number, first_name, last_name, course, year_level, email)
         VALUES (:student_number, :first_name, :last_name, :course, :year_level, :email)'
    );
    try {
        $stmt->execute($data);
    } catch (PDOException $e) {
        duplicateOrFail($e);
    }
    $newId = (int) db()->lastInsertId();
    respond(201, ['success' => true, 'message' => 'Student created', 'data' => castRow(findStudent($newId))]);
}

function updateStudent(int $id, array $in): void
{
    if (!findStudent($id)) {
        respond(404, ['success' => false, 'message' => 'Student not found']);
    }
    $data = validate($in);
    $data['id'] = $id;
    $stmt = db()->prepare(
        'UPDATE students SET student_number = :student_number, first_name = :first_name,
         last_name = :last_name, course = :course, year_level = :year_level, email = :email
         WHERE id = :id'
    );
    try {
        $stmt->execute($data);
    } catch (PDOException $e) {
        duplicateOrFail($e);
    }
    respond(200, ['success' => true, 'message' => 'Student updated', 'data' => castRow(findStudent($id))]);
}

function deleteStudent(int $id): void
{
    if (!findStudent($id)) {
        respond(404, ['success' => false, 'message' => 'Student not found']);
    }
    $stmt = db()->prepare('DELETE FROM students WHERE id = :id');
    $stmt->execute(['id' => $id]);
    respond(200, ['success' => true, 'message' => 'Student deleted']);
}

// ---------------- helpers ----------------

function findStudent(int $id)
{
    $stmt = db()->prepare('SELECT * FROM students WHERE id = :id');
    $stmt->execute(['id' => $id]);
    return $stmt->fetch();
}

function requireId($id): void
{
    if (!$id) {
        respond(400, ['success' => false, 'message' => 'Missing student id']);
    }
}

function validate(array $in): array
{
    $errors = [];
    $data = [
        'student_number' => trim((string) ($in['student_number'] ?? '')),
        'first_name'     => trim((string) ($in['first_name'] ?? '')),
        'last_name'      => trim((string) ($in['last_name'] ?? '')),
        'course'         => trim((string) ($in['course'] ?? '')),
        'year_level'     => (int) ($in['year_level'] ?? 0),
        'email'          => trim((string) ($in['email'] ?? '')),
    ];

    foreach (['student_number', 'first_name', 'last_name', 'course', 'email'] as $field) {
        if ($data[$field] === '') {
            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
        }
    }
    if ($data['year_level'] < 1 || $data['year_level'] > 5) {
        $errors['year_level'] = 'Year level must be between 1 and 5';
    }
    if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Email is not valid';
    }

    if ($errors) {
        respond(422, ['success' => false, 'message' => 'Validation failed', 'errors' => $errors]);
    }
    return $data;
}

function castRow(array $row): array
{
    $row['id'] = (int) $row['id'];
    $row['year_level'] = (int) $row['year_level'];
    return $row;
}

function duplicateOrFail(PDOException $e): void
{
    // 23000 = integrity constraint violation (duplicate student number)
    if ($e->getCode() === '23000') {
        respond(409, ['success' => false, 'message' => 'Student number already exists']);
    }
    respond(500, ['success' => false, 'message' => $e->getMessage()]);
}
