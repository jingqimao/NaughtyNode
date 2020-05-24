CREATE TABLE IF NOT EXISTS ? (
`id`  int NOT NULL AUTO_INCREMENT ,
`account`  varchar(255) NULL COMMENT '账号' ,
`password`  varchar(255) NULL COMMENT '密码' ,
`name`  varchar(255) NULL COMMENT '昵称' ,
`role`  varchar(255) NULL COMMENT '角色' ,
`phone`  varchar(255) NULL COMMENT '电话' ,
`email`  varchar(255) NULL COMMENT '邮箱' ,
`sex`  int NULL DEFAULT 0 COMMENT '性别' ,
`location`  varchar(255) NULL COMMENT '位置' ,
`profile_photo`  varchar(255) NULL COMMENT '头像' ,
`status`  int NULL DEFAULT 0 COMMENT '状态' ,
`active_code`  varchar(255) NULL COMMENT '激活码' ,
`first_time`  datetime NULL DEFAULT now() COMMENT '创建时间' ,
`login_time`  datetime NULL COMMENT '登录时间' ,
`last_time`  datetime NULL COMMENT '上次登录时间' ,
PRIMARY KEY (`id`)
)
;