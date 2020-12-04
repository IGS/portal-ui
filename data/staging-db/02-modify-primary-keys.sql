ALTER TABLE `file`
ADD `id` int NOT NULL AUTO_INCREMENT UNIQUE FIRST;

ALTER TABLE `file`
DROP INDEX `file_id_UNIQUE`;

ALTER TABLE `file`
ADD UNIQUE `id` (`id`);

ALTER TABLE `file_participant`
DROP FOREIGN KEY `file_participant_ibfk_1`;

ALTER TABLE `file_participant_orig`
DROP FOREIGN KEY `file_participant_orig_ibfk_2`

ALTER TABLE `file`
ADD PRIMARY KEY `id` (`id`),
DROP INDEX `PRIMARY`,
DROP INDEX `id`;

ALTER TABLE `participant`
ADD `id` int NOT NULL AUTO_INCREMENT UNIQUE FIRST;

ALTER TABLE `participant`
ADD PRIMARY KEY `id` (`id`),
DROP INDEX `PRIMARY`,
DROP INDEX `id`;

ALTER TABLE `participant`
ADD UNIQUE `id` (`id`);

ALTER TABLE `file_participant`
RENAME TO `file_participant_orig`;

CREATE TABLE `file_participant` (
  `file_id` int NOT NULL,
  `participant_id` int NOT NULL
) ENGINE='InnoDB' COLLATE 'utf16_unicode_ci';

ALTER TABLE `participant`
CHANGE `id` `participant_id` int(11) NOT NULL AUTO_INCREMENT FIRST,
CHANGE `participant_id` `old_participant_id` varchar(100) COLLATE 'utf8_unicode_ci' NOT NULL AFTER `participant_id`;

ALTER TABLE `file`
CHANGE `id` `file_id` int(11) NOT NULL AUTO_INCREMENT FIRST,
CHANGE `file_id` `dl_file_id` varchar(36) COLLATE 'utf8_unicode_ci' NOT NULL AFTER `file_id`;

ALTER TABLE `file_participant`
ADD FOREIGN KEY (`file_id`) REFERENCES `file` (`file_id`);

ALTER TABLE `file_participant`
ADD FOREIGN KEY (`participant_id`) REFERENCES `participant` (`participant_id`)

insert into file_participant (file_id, participant_id)
select f.file_id as file_id, p.participant_id as participant_id from file f, participant p, file_participant_orig fp
where f.dl_file_id = fp.file_id
and p.old_participant_id = fp.participant_id;


