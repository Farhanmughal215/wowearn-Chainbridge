-- MySQL dump 10.13  Distrib 8.0.31, for macos12 (arm64)
--
-- Host: localhost    Database: chainbridge
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chain_order`
--

DROP TABLE IF EXISTS `chain_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chain_order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `oid` varchar(256) COLLATE utf8mb4_0900_as_ci NOT NULL,
  `fromHash` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `fromNet` varchar(32) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `fromSymbol` varchar(64) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `fromAddress` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `fromLower` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `fromAmount` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `fromReceiver` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `toHash` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `toNet` varchar(32) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `toSymbol` varchar(64) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `toAddress` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `toLower` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `toAmount` varchar(256) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `fee` double DEFAULT NULL,
  `status` int DEFAULT NULL,
  `expireTime` bigint DEFAULT NULL,
  `expireStr` varchar(64) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `createTime` bigint DEFAULT NULL,
  `createStr` varchar(64) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `updateTime` bigint DEFAULT NULL,
  `updateStr` varchar(64) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `oid_UNIQUE` (`oid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chain_order`
--

LOCK TABLES `chain_order` WRITE;
/*!40000 ALTER TABLE `chain_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `chain_order` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-16 12:05:18
