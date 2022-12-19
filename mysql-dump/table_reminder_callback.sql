CREATE TABLE `reminder_callback` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `reminder_id` int DEFAULT '0',
  `reminder_bn` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_bn` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trigger_acc` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `validator_acc` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sign` varchar(255) COLLATE utf8mb4_unicode_ci NULL,
  `ip` varchar(25) COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY(`reminder_id`),
  KEY(`reminder_bn`),
  KEY(`trigger_acc`),
  KEY(`validator_acc`),
  KEY(`sign`),
  KEY(`link_bn`),
  KEY(`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;