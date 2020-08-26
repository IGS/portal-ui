-- Adminer 4.7.7 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

SET NAMES utf8mb4;

CREATE DATABASE `knowledge_environment` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `knowledge_environment`;

DROP TABLE IF EXISTS `file`;
CREATE TABLE `file` (
  `file_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `file_name` text COLLATE utf8_unicode_ci NOT NULL,
  `package_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `access` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `protocol` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `metadata_type_id` int(11) DEFAULT NULL,
  `release_ver` float DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  UNIQUE KEY `file_id_UNIQUE` (`file_id`),
  KEY `metadata_type_id` (`metadata_type_id`),
  CONSTRAINT `file_ibfk_1` FOREIGN KEY (`metadata_type_id`) REFERENCES `metadata_type` (`metadata_type_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `file_participant`;
CREATE TABLE `file_participant` (
  `file_id` varchar(36) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `participant_id` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`file_id`,`participant_id`),
  KEY `index_fileid` (`file_id`),
  KEY `participant_id` (`participant_id`),
  CONSTRAINT `file_participant_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `file` (`file_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `file_participant_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `participant` (`participant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;


DROP TABLE IF EXISTS `metadata_type`;
CREATE TABLE `metadata_type` (
  `metadata_type_id` int(11) NOT NULL,
  `experimental_strategy` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `data_type` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `data_category` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `data_format` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `platform` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `workflow_type` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `access` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `kpmp_data_type` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`metadata_type_id`),
  UNIQUE KEY `metadata_type_id_UNIQUE` (`metadata_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `participant`;
CREATE TABLE `participant` (
  `participant_id` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `age_binned` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sex` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tissue_source` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `protocol` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sample_type` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tissue_type` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `clinical_data` longtext COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`participant_id`),
  UNIQUE KEY `participant_id_UNIQUE` (`participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


-- 2020-08-26 14:25:32
