CREATE TABLE IF NOT EXISTS ? (
`id`  int NOT NULL AUTO_INCREMENT ,
`type`  varchar(255) NULL COMMENT '类型' ,
`title`  varchar(512) NULL COMMENT '标题' ,
`content`  text NULL COMMENT '内容' ,
`time`  datetime NULL DEFAULT now() COMMENT '日期' ,
`status`  int NULL DEFAULT 0 COMMENT '状态' ,
PRIMARY KEY (`id`)
)
;