-- MySQL schema for academic journal portal

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','researcher','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('bachelor','magistr','doctor','journal') NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  school VARCHAR(255),
  level ENUM('bachelor','magistr','doctor') NULL,
  abstract TEXT,
  pdf_filename VARCHAR(255) NOT NULL,
  pdf_url VARCHAR(512) NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(type, created_at),
  FULLTEXT(title, author, abstract),
  INDEX(created_at)
);

CREATE TABLE IF NOT EXISTS metrics (
  article_id BIGINT,
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  PRIMARY KEY(article_id),
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
);
