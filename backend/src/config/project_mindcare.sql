-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 09, 2026 at 05:37 AM
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
  `token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_authentications`
--

INSERT INTO `tb_authentications` (`id`, `user_id`, `token`, `createdAt`) VALUES
(1, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA0OTIzNSwiZXhwIjoxNzc4MTM1NjM1fQ.Zx5F4XurYShq07dEfOnM2Fyoyzf1EVHVw4TaQSI_5Aw', '2026-05-06 13:33:55'),
(2, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA0OTI5OSwiZXhwIjoxNzc4MTM1Njk5fQ.anxZBMI9nM9aYJTwRS0angwB45EUouyH7zVzSeyej28', '2026-05-06 13:34:59'),
(3, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA1ODczMiwiZXhwIjoxNzc4MTQ1MTMyfQ.d8gNI2UBSgLmrOeb2HQl64OOFHUt6jBOetxEOWAVZ-I', '2026-05-06 16:12:12'),
(4, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA1ODg0OSwiZXhwIjoxNzc4MTQ1MjQ5fQ.ErrshGajuOFfJk34WQANpyXgiRd-Z5nV-c-qRgIGA1Q', '2026-05-06 16:14:09'),
(5, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA1OTQyNiwiZXhwIjoxNzc4MTQ1ODI2fQ.jBwGwcy3ieagXKpfI1sik8fIgp3FhEBRofScWStf8fY', '2026-05-06 16:23:46'),
(6, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA2MzYxOSwiZXhwIjoxNzc4MTUwMDE5fQ.L1qViVx6JMF7i1ZLd94j9LZpzZWlcoyt2uVkn72gFx8', '2026-05-06 17:33:39'),
(7, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA2MzY0NCwiZXhwIjoxNzc4MTUwMDQ0fQ.lEaIGlihqaJ9rxeJp-3XCxyE2hrmyYa3lL0dQsXq0Cg', '2026-05-06 17:34:04'),
(8, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODA2NTA0NywiZXhwIjoxNzc4MTUxNDQ3fQ.5KjPgbDK5u9v3OGEEHMozM1NwubVY9uQBW1MT510IPk', '2026-05-06 17:57:27'),
(9, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODEzOTgxNywiZXhwIjoxNzc4MjI2MjE3fQ.bPlUIhwu7Qxzm1SzKR0yWvkvaQunzupzugrCKruPpHE', '2026-05-07 14:43:37'),
(10, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODEzOTk2NSwiZXhwIjoxNzc4MjI2MzY1fQ.cXWZ1Pfn5P8fjm0IcMM7UgaFrFkQWhbemgKZMCu6PdI', '2026-05-07 14:46:05'),
(11, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODE1NjUyOSwiZXhwIjoxNzc4MjQyOTI5fQ.-Mb3vU1TsXOjnG6RtbjOyYJoz6xzqToMfc4B4-H38KE', '2026-05-07 19:22:09'),
(12, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksIm5hbWUiOiJsdWttYW4iLCJlbWFpbCI6Imx1a21hbjEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTc3ODE1NjYwNSwiZXhwIjoxNzc4MjQzMDA1fQ.Nj1-OOYytTE9EkH2vzTPigTlEAEMPYu0Bagn85-Ne-o', '2026-05-07 19:23:25'),
(13, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJuYW1lIjoiTHVrbWFuMTIzIiwiZW1haWwiOiJsdWtsdWsxMkBnbWFpbC5jb20iLCJpYXQiOjE3NzgxNTczMTQsImV4cCI6MTc3ODI0MzcxNH0.D44RmgbVfPGt8Ul5Wh4j-Yo3BFykixIiS-YDmGMbS24', '2026-05-07 19:35:14'),
(14, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJuYW1lIjoiTHVrbWFuMTIzIiwiZW1haWwiOiJsdWtsdWsxMkBnbWFpbC5jb20iLCJpYXQiOjE3NzgxNTgxODIsImV4cCI6MTc3ODI0NDU4Mn0.V_w5sISF7UGiddp7Q0artQxQsa-0SrKJfpBU4JmQ0rE', '2026-05-07 19:49:42'),
(15, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJuYW1lIjoiTHVrbWFuMTIzIiwiZW1haWwiOiJsdWtsdWsxMkBnbWFpbC5jb20iLCJpYXQiOjE3NzgxNTgzODksImV4cCI6MTc3ODI0NDc4OX0.OwIwpZMsJj0PiLtADAkU9aifxpcoeaEUHcXuvsrWl40', '2026-05-07 19:53:09'),
(16, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJuYW1lIjoiTHVrbWFuMTIzIiwiZW1haWwiOiJsdWtsdWsxMkBnbWFpbC5jb20iLCJpYXQiOjE3NzgxNTgzOTMsImV4cCI6MTc3ODI0NDc5M30.AIvguEqtWEE6DrChbhwUWv4O4D4Tvbdb6zPT4gRdJTE', '2026-05-07 19:53:13'),
(17, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJuYW1lIjoiTHVrbWFuMTIzIiwiZW1haWwiOiJsdWtsdWsxMkBnbWFpbC5jb20iLCJpYXQiOjE3NzgyMjUyMDIsImV4cCI6MTc3ODMxMTYwMn0.ePlxHgy1IHkvYSpDMurrXl_WeGK0laNNqsogGr9a_iQ', '2026-05-08 14:26:42'),
(18, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJuYW1lIjoiTHVrbWFuMTIzIiwiZW1haWwiOiJsdWtsdWsxMkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3ODI1MTkxMiwiZXhwIjoxNzc4MzM4MzEyfQ.pjoCr1OrFo2U6_VF4RDwp6zLECsKIj40MeBinLnEggk', '2026-05-08 21:51:52'),
(19, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJuYW1lIjoiTHVrbWFuMTIzIiwiZW1haWwiOiJsdWtsdWsxMkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3ODMwMjU2MiwiZXhwIjoxNzc4Mzg4OTYyfQ.xKYCIrGorutguPiBN6jQqJ9NwBV8lcpwOKM6GlJsnKs', '2026-05-09 11:56:02');

-- --------------------------------------------------------

--
-- Table structure for table `tb_journal`
--

CREATE TABLE `tb_journal` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mood` tinyint DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_journal`
--

INSERT INTO `tb_journal` (`id`, `user_id`, `judul`, `deskripsi`, `mood`, `createdAt`, `updatedAt`) VALUES
(1, 9, 'kerjaan', 'saya cape kerjaan banyak banget tapi gaji kecil abnget kwkwkw hahaha', NULL, '2026-05-06 17:57:55', '2026-05-06 17:57:55'),
(2, 9, 'kerjaan', 'saya cape kerjaan banyak banget tapi gaji kecil abnget kwkwkw hahaha', NULL, '2026-05-06 18:03:34', '2026-05-06 18:03:34'),
(3, 9, 'kerjaan', 'saya cape kerjaan banyak banget tapi gaji kecil abnget kwkwkw hahaha', NULL, '2026-05-06 18:03:44', '2026-05-06 18:03:44'),
(4, 9, 'kerjaan', 'saya cape kerjaan banyak banget tapi gaji kecil abnget kwkwkw hahaha', NULL, '2026-05-06 18:03:52', '2026-05-06 18:03:52'),
(5, 9, 'kerjaan', 'saya cape kerjaan banyak banget tapi gaji kecil abnget kwkwkw hahaha', NULL, '2026-05-06 18:05:43', '2026-05-06 18:05:43'),
(6, 9, 'kerjaan', 'saya cape kerjaan banyak banget tapi gaji kecil abnget kwkwkw hahaha', NULL, '2026-05-06 18:06:55', '2026-05-06 18:06:55'),
(7, 9, 'terbaruu wkwkkw', 'mudahkan semua urusan', NULL, '2026-05-07 19:30:12', '2026-05-07 19:30:12'),
(8, 10, 'terbaruu wkwkkw', 'mudahkan semua urusan', NULL, '2026-05-07 19:53:49', '2026-05-07 19:53:49'),
(9, 10, 'jurnal 123', 'mudahkan semua urusan', NULL, '2026-05-08 14:28:06', '2026-05-08 14:28:06');

-- --------------------------------------------------------

--
-- Table structure for table `tb_kuesioner_hasil`
--

CREATE TABLE `tb_kuesioner_hasil` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `umur` tinyint NOT NULL,
  `pekerjaan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'mahasiswa, karyawan, wirausaha',
  `tingkat_stres` tinyint NOT NULL COMMENT '1-5',
  `durasi_stres` tinyint NOT NULL COMMENT 'dalam minggu',
  `penyebab_stres` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'akademik, pekerjaan, hubungan, finansial',
  `kualitas_tidur` tinyint NOT NULL COMMENT '1-5',
  `waktu_luang` smallint NOT NULL COMMENT 'dalam menit',
  `mood` tinyint DEFAULT NULL COMMENT '0-4',
  `aktivitas_fisik` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'sering, jarang',
  `preferensi_olahraga` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ya, tidak',
  `preferensi_membaca` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ya, tidak',
  `preferensi_journaling` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ya, tidak',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_kuesioner_hasil`
--

INSERT INTO `tb_kuesioner_hasil` (`id`, `user_id`, `umur`, `pekerjaan`, `tingkat_stres`, `durasi_stres`, `penyebab_stres`, `kualitas_tidur`, `waktu_luang`, `mood`, `aktivitas_fisik`, `preferensi_olahraga`, `preferensi_membaca`, `preferensi_journaling`, `createdAt`) VALUES
(1, 10, 22, 'mahasiswa', 4, 3, 'akademik', 2, 90, 2, 'jarang', 'tidak', 'ya', 'ya', '2026-05-08 21:55:13'),
(2, 10, 22, 'mahasiswa', 4, 3, 'akademik', 2, 90, 2, 'jarang', 'tidak', 'ya', 'ya', '2026-05-08 22:02:19'),
(3, 10, 22, 'mahasiswa', 4, 3, 'akademik', 2, 90, 2, 'jarang', 'tidak', 'ya', 'ya', '2026-05-08 22:06:47'),
(4, 10, 20, 'mahasiswa', 4, 3, 'akademik', 4, 120, 4, 'sering', 'ya', 'ya', 'tidak', '2026-05-08 22:10:38'),
(5, 10, 40, 'mahasiswa', 4, 3, 'akademik', 4, 120, 4, 'sering', 'tidak', 'ya', 'tidak', '2026-05-09 11:58:22');

-- --------------------------------------------------------

--
-- Table structure for table `tb_lari`
--

CREATE TABLE `tb_lari` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `jarak_km` decimal(5,2) NOT NULL COMMENT 'jarak dalam kilometer',
  `durasi_menit` smallint NOT NULL COMMENT 'durasi dalam menit',
  `rute_maps` text COLLATE utf8mb4_unicode_ci COMMENT 'data koordinat rute JSON',
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
  `aktivitas` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'journaling, membaca, olahraga',
  `confidence` decimal(5,3) NOT NULL COMMENT '0.000 - 1.000',
  `durasi` smallint NOT NULL COMMENT 'dalam menit',
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'jogging ringan, menulis perasaan harian, dst'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_rekomendasi_aktivitas`
--

INSERT INTO `tb_rekomendasi_aktivitas` (`id`, `sesi_id`, `is_utama`, `aktivitas`, `confidence`, `durasi`, `detail`) VALUES
(1, 1, 1, 'membaca', 0.960, 25, 'buku self-improvement atau relaksasi'),
(2, 2, 1, 'olahraga', 1.000, 30, 'jogging ringan atau senam ringan'),
(3, 3, 1, 'membaca', 1.000, 25, 'buku self-improvement atau relaksasi');

-- --------------------------------------------------------

--
-- Table structure for table `tb_rekomendasi_buku`
--

CREATE TABLE `tb_rekomendasi_buku` (
  `id` int NOT NULL,
  `aktivitas_id` int NOT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `penulis` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_rekomendasi_buku`
--

INSERT INTO `tb_rekomendasi_buku` (`id`, `aktivitas_id`, `judul`, `penulis`, `kategori`, `thumbnail`, `deskripsi`) VALUES
(1, 1, 'The Stress-Proof Brain', 'Melanie Greenberg', 'Self Help, Mental Health', 'https://books.google.com/thumbnail/stress_proof.jpg', 'Master your emotional response to stress using mindfulness, neuroscience, and CBT....'),
(2, 1, 'Burnout: The Secret to Unlocking the Stress Cycle', 'Emily Nagoski', 'Self Help, Psychology, Health', 'https://books.google.com/thumbnail/burnout.jpg', 'Science-based strategies to complete the stress cycle and prevent burnout....'),
(3, 1, 'Feeling Good: The New Mood Therapy', 'David D. Burns', 'Psychology, Self Help', 'https://books.google.com/thumbnail/feeling_good.jpg', 'Evidence-based cognitive therapy techniques to defeat depression and feel good again....'),
(4, 3, 'Feeling Good: The New Mood Therapy', 'David D. Burns', 'Psychology, Self Help', 'https://books.google.com/thumbnail/feeling_good.jpg', 'Evidence-based cognitive therapy techniques to defeat depression and feel good again....'),
(5, 3, 'Maybe You Should Talk to Someone', 'Lori Gottlieb', 'Psychology, Memoir, Self Help', 'https://images.gr-assets.com/maybe_talk.jpg', 'A therapist, her therapist, and our lives revealed — humanizing therapy....'),
(6, 3, 'The Anxiety and Worry Workbook', 'Clark & Beck', 'Self Help, Psychology', 'https://books.google.com/thumbnail/anxiety_workbook.jpg', 'Practical CBT-based strategies to overcome anxiety and excessive worry in daily life....');

-- --------------------------------------------------------

--
-- Table structure for table `tb_rekomendasi_distribusi`
--

CREATE TABLE `tb_rekomendasi_distribusi` (
  `id` int NOT NULL,
  `sesi_id` int NOT NULL,
  `aktivitas` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'journaling, membaca, olahraga',
  `probabilitas` decimal(5,3) NOT NULL COMMENT '0.000 - 1.000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_rekomendasi_distribusi`
--

INSERT INTO `tb_rekomendasi_distribusi` (`id`, `sesi_id`, `aktivitas`, `probabilitas`) VALUES
(1, 1, 'journaling', 0.041),
(2, 1, 'membaca', 0.959),
(3, 1, 'olahraga', 0.000),
(4, 2, 'journaling', 0.000),
(5, 2, 'membaca', 0.000),
(6, 2, 'olahraga', 1.000),
(7, 3, 'journaling', 0.000),
(8, 3, 'membaca', 1.000),
(9, 3, 'olahraga', 0.000);

-- --------------------------------------------------------

--
-- Table structure for table `tb_rekomendasi_sesi`
--

CREATE TABLE `tb_rekomendasi_sesi` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `kuesioner_id` int NOT NULL,
  `model_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Deep Learning (Neural Network)',
  `alasan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_rekomendasi_sesi`
--

INSERT INTO `tb_rekomendasi_sesi` (`id`, `user_id`, `kuesioner_id`, `model_type`, `alasan`, `createdAt`) VALUES
(1, 10, 3, 'Deep Learning — Functional API + Residual Block', 'Jaringan saraf tiruan (Neural Network) dengan arsitektur Residual Block memiliki tingkat keyakinan 95.9% bahwa \'membaca\' adalah aktivitas yang paling sesuai dengan kondisi Anda saat ini.', '2026-05-08 22:06:49'),
(2, 10, 4, 'Deep Learning — Functional API + Residual Block', 'Jaringan saraf tiruan (Neural Network) dengan arsitektur Residual Block memiliki tingkat keyakinan 100.0% bahwa \'olahraga\' adalah aktivitas yang paling sesuai dengan kondisi Anda saat ini.', '2026-05-08 22:10:39'),
(3, 10, 5, 'Deep Learning — Functional API + Residual Block', 'Jaringan saraf tiruan (Neural Network) dengan arsitektur Residual Block memiliki tingkat keyakinan 100.0% bahwa \'membaca\' adalah aktivitas yang paling sesuai dengan kondisi Anda saat ini.', '2026-05-09 11:58:25');

-- --------------------------------------------------------

--
-- Table structure for table `tb_stress_scan`
--

CREATE TABLE `tb_stress_scan` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `tingkat_stres` tinyint NOT NULL COMMENT '1-5',
  `keterangan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stres Rendah, Stres Sedang, dst',
  `mood` tinyint NOT NULL COMMENT '0-4',
  `keterangan_mood` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sangat Buruk, Buruk, dst',
  `foto_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tb_users`
--

INSERT INTO `tb_users` (`id`, `name`, `email`, `role`, `password`, `avatar`, `createdAt`, `updatedAt`) VALUES
(1, 'Wawan', 'email@gmail.com', 'user', '$2b$10$kBCPYBkGbUrABwQtlA4Uzewgcqa53/rkos61dkek/d9tYFbq78ag.', NULL, '2026-05-01 01:56:52', '2026-05-01 02:36:36'),
(2, 'Budi Santoso', 'budisantoso@example.com', 'user', '$2b$12$NPiIqYNFCpTN.759EgD9su0N/bX/d9uqab.eVKaud.cJzSKOsKgoe', NULL, '2026-05-03 20:32:13', '2026-05-03 20:32:13'),
(3, 'satosi kang poto', 'satosi@example.com', 'user', '$2b$12$YwlkETkVBvK784G8xPDP1OefVi/kpCvADsydUv4465JrH2eEqfesK', NULL, '2026-05-03 20:47:10', '2026-05-03 20:47:10'),
(4, 'lukman', 'lukman@example.com', 'user', '$2b$12$VHHrIEC/eEVNzlwAWxGP3OMYwwBh6D7GJErzM5QuqoAYk2AweeOZi', NULL, '2026-05-03 20:48:55', '2026-05-03 20:48:55'),
(5, 'wawan', 'wawan@example.com', 'user', '$2b$12$hoaH1vIMGRpY.TGmGeYspuM7P/wIy7TNqeL0exne1zZ7fPHDHHtGG', NULL, '2026-05-03 20:51:13', '2026-05-03 20:51:13'),
(6, 'nikki', 'nikki@example.com', 'user', '$2b$12$lHHKk7nrb6A6lu4Vm6PKUuZA2R6KLdsMAMKuFjOGCUcMmjElee54i', NULL, '2026-05-03 20:54:29', '2026-05-03 20:54:29'),
(7, 'nikki', 'nikki123@example.com', 'user', '$2b$12$MzZ2/HJBaNv3dGSYmHulN.mR6h.TzWE5Ry1bfGXFifWK/3nFcwELC', NULL, '2026-05-03 20:56:02', '2026-05-03 20:56:02'),
(8, 'nikki', 'nikki1234@example.com', 'user', '$2b$12$fV46hlVXNdHki5KdEVap3.EA61AS73oDXyVv3LuYJITwfatgSJKJK', NULL, '2026-05-03 20:57:18', '2026-05-03 21:49:36'),
(9, 'lukman', 'lukman123@example.com', 'user', '$2b$12$PQQSPnCGAGqjKIR9f8Ckj.414ur4ZhE9w1UUx3WC4Z.eoOQtzrRJy', NULL, '2026-05-06 13:30:25', '2026-05-06 13:30:25'),
(10, 'Lukman123', 'lukluk12@gmail.com', 'user', '$2b$12$3bXjgy2droe0wa56Hz1lXuq/rspY5YT9fq.F0UbSGwHRtKKOOGbXG', NULL, '2026-05-07 19:34:50', '2026-05-07 19:34:50');

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
-- Indexes for table `tb_lari`
--
ALTER TABLE `tb_lari`
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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `tb_journal`
--
ALTER TABLE `tb_journal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tb_kuesioner_hasil`
--
ALTER TABLE `tb_kuesioner_hasil`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tb_lari`
--
ALTER TABLE `tb_lari`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_aktivitas`
--
ALTER TABLE `tb_rekomendasi_aktivitas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_buku`
--
ALTER TABLE `tb_rekomendasi_buku`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_distribusi`
--
ALTER TABLE `tb_rekomendasi_distribusi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tb_rekomendasi_sesi`
--
ALTER TABLE `tb_rekomendasi_sesi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tb_stress_scan`
--
ALTER TABLE `tb_stress_scan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_users`
--
ALTER TABLE `tb_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tb_authentications`
--
ALTER TABLE `tb_authentications`
  ADD CONSTRAINT `fk_auth_user` FOREIGN KEY (`user_id`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `tb_lari`
--
ALTER TABLE `tb_lari`
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
