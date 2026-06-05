CREATE TABLE IF NOT EXISTS `tb_user_stress_state` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `kuesioner_id` int DEFAULT NULL,
  `stress_awal_percent` decimal(5,2) NOT NULL COMMENT 'baseline terbaru dari kuesioner',
  `stress_saat_ini_percent` decimal(5,2) NOT NULL COMMENT 'stress berjalan setelah aktivitas',
  `kategori_stress` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `keterangan_stress` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_stress_state_user` (`user_id`),
  KEY `fk_user_stress_state_kuesioner` (`kuesioner_id`),
  CONSTRAINT `fk_user_stress_state_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_stress_state_kuesioner` FOREIGN KEY (`kuesioner_id`) REFERENCES `tb_kuesioner_hasil` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `tb_user_stress_state`
  ADD COLUMN IF NOT EXISTS `keterangan_stress` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
  AFTER `kategori_stress`;

CREATE TABLE IF NOT EXISTS `tb_stress_reduction_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `aktivitas` enum('membaca','journaling','olahraga') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'journal, book_session, olahraga',
  `source_id` int DEFAULT NULL,
  `durasi_menit` smallint NOT NULL,
  `stress_sebelum` decimal(5,2) NOT NULL,
  `penurunan_percent` decimal(5,2) NOT NULL,
  `stress_sesudah` decimal(5,2) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_stress_reduction_user` (`user_id`),
  KEY `idx_stress_reduction_created` (`createdAt`),
  CONSTRAINT `fk_stress_reduction_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
