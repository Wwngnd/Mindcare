-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 30, 2026 at 10:07 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_mindcare`
--

-- --------------------------------------------------------

--
-- Table structure for table `tb_authentications`
--

CREATE TABLE `tb_authentications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_book_exploration_sessions`
--

CREATE TABLE `tb_book_exploration_sessions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `durasi_detik` int NOT NULL COMMENT 'durasi eksplorasi dalam detik',
  `tanggal` datetime NOT NULL COMMENT 'waktu sesi dicatat',
  `explored_books` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON daftar buku yang dieksplorasi',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_book_reads`
--

CREATE TABLE `tb_book_reads` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `book_external_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID buku dari sumber rekomendasi',
  `judul` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `penulis` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_journal`
--

CREATE TABLE `tb_journal` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `judul` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `durasi` tinyint NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_kuesioner_hasil`
--

CREATE TABLE `tb_kuesioner_hasil` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `umur` tinyint NOT NULL,
  `pekerjaan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'mahasiswa, karyawan, wirausaha',
  `tingkat_stres` tinyint NOT NULL COMMENT '1-5',
  `durasi_stres` tinyint NOT NULL COMMENT 'dalam minggu',
  `penyebab_stres` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'akademik, pekerjaan, hubungan, finansial',
  `kualitas_tidur` tinyint NOT NULL COMMENT '1-5',
  `waktu_luang` smallint NOT NULL COMMENT 'dalam menit',
  `mood` tinyint DEFAULT NULL COMMENT '0-4',
  `aktivitas_fisik` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'sering, jarang',
  `preferensi_olahraga` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ya, tidak',
  `preferensi_membaca` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ya, tidak',
  `preferensi_journaling` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ya, tidak',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_olahraga`
--

CREATE TABLE `tb_olahraga` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `jenis` enum('lari','jalan','sepeda') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'lari, jalan dan sepeda',
  `jarak_km` decimal(5,2) NOT NULL COMMENT 'jarak dalam kilometer',
  `durasi_menit` smallint NOT NULL COMMENT 'durasi dalam menit',
  `rute_maps` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'data koordinat rute JSON',
  `tanggal` date NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_rekomendasi_aktivitas`
--

CREATE TABLE `tb_rekomendasi_aktivitas` (
  `id` int NOT NULL,
  `sesi_id` int NOT NULL,
  `is_utama` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = rekomendasi_utama, 0 = alternatif',
  `aktivitas` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'journaling, membaca, olahraga',
  `confidence` decimal(5,3) NOT NULL COMMENT '0.000 - 1.000',
  `durasi` smallint NOT NULL COMMENT 'dalam menit',
  `detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'jogging ringan, menulis perasaan harian, dst'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_rekomendasi_buku`
--

CREATE TABLE `tb_rekomendasi_buku` (
  `id` int NOT NULL,
  `aktivitas_id` int NOT NULL,
  `judul` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `penulis` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deskripsi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_rekomendasi_distribusi`
--

CREATE TABLE `tb_rekomendasi_distribusi` (
  `id` int NOT NULL,
  `sesi_id` int NOT NULL,
  `aktivitas` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'journaling, membaca, olahraga',
  `probabilitas` decimal(5,3) NOT NULL COMMENT '0.000 - 1.000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_rekomendasi_sesi`
--

CREATE TABLE `tb_rekomendasi_sesi` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `kuesioner_id` int NOT NULL,
  `model_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Deep Learning (Neural Network)',
  `alasan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_stress_scan`
--

CREATE TABLE `tb_stress_scan` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `tingkat_stres` tinyint NOT NULL COMMENT '1-5',
  `keterangan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stres Rendah, Stres Sedang, dst',
  `mood` tinyint NOT NULL COMMENT '0-4',
  `keterangan_mood` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sangat Buruk, Buruk, dst',
  `foto_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_users`
--

CREATE TABLE `tb_users` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `password` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `jenis_kelamin` enum('laki-laki','perempuan') DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `umur` int DEFAULT NULL,
  `pekerjaan` enum('mahasiswa','pelajar','karyawan','wirausaha') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tb_authentications`
--
ALTER TABLE `tb_authentications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_auth_user` (`user_id`);

--
-- Indexes for table `tb_book_exploration_sessions`
--
ALTER TABLE `tb_book_exploration_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_book_session_user` (`user_id`);

--
-- Indexes for table `tb_book_reads`
--
ALTER TABLE `tb_book_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_book_read_user_book` (`user_id`,`book_external_id`),
  ADD KEY `fk_book_read_user` (`user_id`);

--
-- Indexes for table `tb_journal`
--
ALTER TABLE `tb_journal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_journal_user` (`user_id`);

--
-- Indexes for table `tb_kuesioner_hasil`
--
ALTER TABLE `tb_kuesioner_hasil`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_kuesioner_user` (`user_id`);

--
-- Indexes for table `tb_olahraga`
--
ALTER TABLE `tb_olahraga`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lari_user` (`user_id`);

--
-- Indexes for table `tb_rekomendasi_aktivitas`
--
ALTER TABLE `tb_rekomendasi_aktivitas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aktivitas_sesi` (`sesi_id`);

--
-- Indexes for table `tb_rekomendasi_buku`
--
ALTER TABLE `tb_rekomendasi_buku`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_buku_aktivitas` (`aktivitas_id`);

--
-- Indexes for table `tb_rekomendasi_distribusi`
--
ALTER TABLE `tb_rekomendasi_distribusi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_distribusi_sesi` (`sesi_id`);

--
-- Indexes for table `tb_rekomendasi_sesi`
--
ALTER TABLE `tb_rekomendasi_sesi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sesi_user` (`user_id`),
  ADD KEY `fk_sesi_kuesioner` (`kuesioner_id`);

--
-- Indexes for table `tb_stress_scan`
--
ALTER TABLE `tb_stress_scan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stress_user` (`user_id`);

--
-- Indexes for table `tb_users`
--
ALTER TABLE `tb_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tb_authentications`
--
ALTER TABLE `tb_authentications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `tb_book_exploration_sessions`
--
ALTER TABLE `tb_book_exploration_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tb_book_reads`
--
ALTER TABLE `tb_book_reads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_journal`
--
ALTER TABLE `tb_journal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tb_kuesioner_hasil`
--
ALTER TABLE `tb_kuesioner_hasil`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `tb_olahraga`
--
ALTER TABLE `tb_olahraga`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_aktivitas`
--
ALTER TABLE `tb_rekomendasi_aktivitas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_buku`
--
ALTER TABLE `tb_rekomendasi_buku`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_distribusi`
--
ALTER TABLE `tb_rekomendasi_distribusi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=175;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_sesi`
--
ALTER TABLE `tb_rekomendasi_sesi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `tb_stress_scan`
--
ALTER TABLE `tb_stress_scan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tb_users`
--
ALTER TABLE `tb_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tb_authentications`
--
ALTER TABLE `tb_authentications`
  ADD CONSTRAINT `fk_auth_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_book_exploration_sessions`
--
ALTER TABLE `tb_book_exploration_sessions`
  ADD CONSTRAINT `fk_book_session_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_book_reads`
--
ALTER TABLE `tb_book_reads`
  ADD CONSTRAINT `fk_book_read_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_journal`
--
ALTER TABLE `tb_journal`
  ADD CONSTRAINT `fk_journal_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_kuesioner_hasil`
--
ALTER TABLE `tb_kuesioner_hasil`
  ADD CONSTRAINT `fk_kuesioner_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_olahraga`
--
ALTER TABLE `tb_olahraga`
  ADD CONSTRAINT `fk_lari_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_rekomendasi_aktivitas`
--
ALTER TABLE `tb_rekomendasi_aktivitas`
  ADD CONSTRAINT `fk_aktivitas_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `tb_rekomendasi_sesi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_rekomendasi_buku`
--
ALTER TABLE `tb_rekomendasi_buku`
  ADD CONSTRAINT `fk_buku_aktivitas` FOREIGN KEY (`aktivitas_id`) REFERENCES `tb_rekomendasi_aktivitas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_rekomendasi_distribusi`
--
ALTER TABLE `tb_rekomendasi_distribusi`
  ADD CONSTRAINT `fk_distribusi_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `tb_rekomendasi_sesi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_rekomendasi_sesi`
--
ALTER TABLE `tb_rekomendasi_sesi`
  ADD CONSTRAINT `fk_sesi_kuesioner` FOREIGN KEY (`kuesioner_id`) REFERENCES `tb_kuesioner_hasil` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sesi_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_stress_scan`
--
ALTER TABLE `tb_stress_scan`
  ADD CONSTRAINT `fk_stress_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
