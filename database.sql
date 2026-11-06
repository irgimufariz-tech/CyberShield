CREATE DATABASE IF NOT EXISTS cybershield CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cybershield;

CREATE TABLE IF NOT EXISTS firewall_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL DEFAULT '*',
  target_port VARCHAR(10) NOT NULL DEFAULT '*',
  action ENUM('ALLOW','BLOCK') NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  source_ip VARCHAR(45) NOT NULL,
  target_port INT NOT NULL,
  activity VARCHAR(100) NOT NULL,
  action ENUM('ALLOW','BLOCK') NOT NULL,
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_time(event_time),
  INDEX idx_source_ip(source_ip)
);

CREATE TABLE IF NOT EXISTS blacklist_ips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO firewall_rules(name,ip_address,target_port,action,is_enabled) VALUES
('Allow HTTPS','*','443','ALLOW',1),
('Block SSH External','*','22','BLOCK',1),
('Allow DNS','*','53','ALLOW',1),
('Block Suspicious Host','203.0.113.66','*','BLOCK',1);
INSERT IGNORE INTO blacklist_ips(ip_address,reason) VALUES
('198.51.100.23','Percobaan brute force');
