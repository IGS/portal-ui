ALTER TABLE `participant`
ADD `redcap_id` varchar(100) COLLATE 'utf8_unicode_ci' NULL AFTER `participant_id`;