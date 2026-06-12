-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 12/06/2026 às 22:59
-- Versão do servidor: 10.4.28-MariaDB
-- Versão do PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `test`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `jerseys`
--

CREATE TABLE `jerseys` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `imagem` varchar(255) NOT NULL,
  `estoque` int(11) DEFAULT 0,
  `descricao` text DEFAULT NULL,
  `time_nome` varchar(255) DEFAULT NULL,
  `liga` varchar(255) DEFAULT NULL,
  `temporada` varchar(50) DEFAULT NULL,
  `patrocinador` varchar(255) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `tamanho` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `jerseys`
--

INSERT INTO `jerseys` (`id`, `nome`, `preco`, `imagem`, `estoque`, `descricao`, `time_nome`, `liga`, `temporada`, `patrocinador`, `pais`, `tamanho`) VALUES
(1, 'Real Madrid Home 24/25', 299.90, './assets/jerseys/real-madrid.jpg', 50, 'Camisa titular do Real Madrid temporada 2024/25.', 'Real Madrid', 'La Liga', '2024/25', 'Emirates', 'Espanha', 'P,M,G,GG'),
(2, 'Barcelona Home 24/25', 299.90, './assets/jerseys/barcelona.jpg', 40, 'Camisa titular do Barcelona temporada 2024/25.', 'Barcelona', 'La Liga', '2024/25', 'Spotify', 'Espanha', 'P,M,G,GG'),
(3, 'Manchester United Home 24/25', 299.90, './assets/jerseys/manchester-united.jpg', 35, 'Camisa titular do Manchester United temporada 2024/25.', 'Manchester United', 'Premier League', '2024/25', 'Snapdragon', 'Inglaterra', 'P,M,G,GG'),
(4, 'Liverpool Home 24/25', 299.90, './assets/jerseys/liverpool.jpg', 30, 'Camisa titular do Liverpool temporada 2024/25.', 'Liverpool', 'Premier League', '2024/25', 'Standard Chartered', 'Inglaterra', 'P,M,G,GG'),
(5, 'Juventus Home 24/25', 299.90, './assets/jerseys/juventus.jpg', 25, 'Camisa titular da Juventus temporada 2024/25.', 'Juventus', 'Serie A', '2024/25', 'Jeep', 'Itália', 'P,M,G,GG'),
(6, 'PSG Home 24/25', 299.90, './assets/jerseys/psg.jpg', 45, 'Camisa titular do Paris Saint-Germain temporada 2024/25.', 'PSG', 'Ligue 1', '2024/25', 'Qatar Airways', 'França', 'P,M,G,GG');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `jerseys`
--
ALTER TABLE `jerseys`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `jerseys`
--
ALTER TABLE `jerseys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
