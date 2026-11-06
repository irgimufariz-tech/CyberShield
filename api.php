<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
require 'config.php';
$method = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];
function out($data, $code=200) { http_response_code($code); echo json_encode($data); exit; }
try {
 if ($resource === 'rules') {
   if ($method === 'GET') out($pdo->query("SELECT * FROM firewall_rules ORDER BY id DESC")->fetchAll());
   if ($method === 'POST') {
     $q=$pdo->prepare("INSERT INTO firewall_rules(name,ip_address,target_port,action,is_enabled) VALUES(?,?,?,?,1)");
     $q->execute([$input['name'],$input['ip_address'] ?? '*',$input['target_port'] ?? '*',$input['action']]);
     out(['success'=>true,'id'=>$pdo->lastInsertId()],201);
   }
   if ($method === 'PUT') {
     $q=$pdo->prepare("UPDATE firewall_rules SET is_enabled=? WHERE id=?");
     $q->execute([(int)$input['is_enabled'],(int)$input['id']]); out(['success'=>true]);
   }
   if ($method === 'DELETE') {
     $q=$pdo->prepare("DELETE FROM firewall_rules WHERE id=?");$q->execute([(int)($_GET['id']??0)]);out(['success'=>true]);
   }
 }
 if ($resource === 'logs') {
   if ($method === 'GET') out($pdo->query("SELECT * FROM security_logs ORDER BY event_time DESC LIMIT 500")->fetchAll());
   if ($method === 'POST') {
     $q=$pdo->prepare("INSERT INTO security_logs(source_ip,target_port,activity,action) VALUES(?,?,?,?)");
     $q->execute([$input['source_ip'],$input['target_port'],$input['activity'],$input['action']]);out(['success'=>true,'id'=>$pdo->lastInsertId()],201);
   }
 }
 if ($resource === 'blacklist') {
   if ($method === 'GET') out($pdo->query("SELECT * FROM blacklist_ips ORDER BY created_at DESC")->fetchAll());
   if ($method === 'POST') {
     $q=$pdo->prepare("INSERT INTO blacklist_ips(ip_address,reason) VALUES(?,?)");
     $q->execute([$input['ip_address'],$input['reason']??null]);out(['success'=>true,'id'=>$pdo->lastInsertId()],201);
   }
   if ($method === 'DELETE') {
     $q=$pdo->prepare("DELETE FROM blacklist_ips WHERE id=?");$q->execute([(int)($_GET['id']??0)]);out(['success'=>true]);
   }
 }
 out(['error'=>'Resource atau method tidak didukung'],404);
} catch (Throwable $e) { out(['error'=>$e->getMessage()],400); }
?>