-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design,
-- you will have to change these here.

;
CREATE TABLE "users" (
    "id" SERIAL   NOT NULL,
    "username" varchar   NOT NULL,
    "hashed_password" varchar   NOT NULL,
    "picture_url" varchar   NULL,
    "joining_date" timestamp   NOT NULL,
    "last_on" timestamp   NOT NULL,
    "is_site_admin" boolean   NULL,
    CONSTRAINT "pk_users" PRIMARY KEY (
        "id"
    ),
    CONSTRAINT "pk_users_username" UNIQUE (
        "username"
    )

);

CREATE TABLE "servers" (
    "id" SERIAL   NOT NULL,
    "name" varchar   NULL,
    "picture_url" varchar   NULL,
    "start_date" timestamp   NOT NULL,
    "private" boolean  NULL,
    CONSTRAINT "pk_servers" PRIMARY KEY (
        "id"
     ),
    CONSTRAINT "uc_servers_name" UNIQUE (
        "name"
    )
);

CREATE TABLE "invites" (
    "link" varchar   NOT NULL,
    "role_id" int   NOT NULL,
    "user_cap" int   NULL,
    "expiration_time" timestamp   NULL,
    CONSTRAINT "pk_invites" PRIMARY KEY (
        "link"
     )
);

CREATE TABLE "roles" (
    "id" SERIAL   NOT NULL,
    "title" varchar   NOT NULL,
    "server_id" int   NOT NULL,
    "color" int   NOT NULL,
    "is_admin" boolean   NOT NULL,
    CONSTRAINT "pk_roles" PRIMARY KEY (
        "id"
     )
);

CREATE TABLE "memberships" (
    "id" SERIAL   NOT NULL,
    "user_id" int   NOT NULL,
    "role_id" int   NOT NULL,
    "server_id" int   NOT NULL,
    "nickname" varchar   NOT NULL,
    "joining_date" timestamp   NOT NULL,
    "picture_url" varchar NULL,
    CONSTRAINT "pk_memberships" PRIMARY KEY (
        "id"
     )
);

CREATE TABLE "rooms" (
    "id" SERIAL   NOT NULL,
    "name" varchar   NOT NULL,
    "server_id" int   NOT NULL,
    "type" varchar   NOT NULL,
    "private" boolean   NULL,
    CONSTRAINT "pk_rooms" PRIMARY KEY (
        "id"
     )
);

CREATE TABLE "access" (
    "room_id" int   NOT NULL,
    "role_id" int   NOT NULL,
    "read_only" boolean   NULL,
    "is_moderator" boolean   NULL
);

CREATE TABLE "posts" (
    "id" SERIAL   NOT NULL,
    "room_id" int   NOT NULL,
    "member_id" int   NULL,
    "content" varchar   NOT NULL,
    "post_date" timestamp    NOT NULL,
    "threaded_from" int   NULL,
    CONSTRAINT "pk_posts" PRIMARY KEY (
        "id"
     )
);

CREATE TABLE "reactions" (
    "post_id" int   NOT NULL,
    "member_id" int   NULL,
    "type" varchar   NOT NULL
);

ALTER TABLE "invites" ADD CONSTRAINT "fk_invites_role_id"
FOREIGN KEY("role_id") REFERENCES "roles" ("id");

ALTER TABLE "roles" ADD CONSTRAINT "fk_roles_server_id"
FOREIGN KEY("server_id") REFERENCES "servers" ("id");

ALTER TABLE "memberships" ADD CONSTRAINT "fk_memberships_user_id"
FOREIGN KEY("user_id") REFERENCES "users" ("id");

ALTER TABLE "memberships" ADD CONSTRAINT "fk_memberships_role_id"
FOREIGN KEY("role_id") REFERENCES "roles" ("id");

ALTER TABLE "memberships" ADD CONSTRAINT "fk_memberships_server_id"
FOREIGN KEY("server_id") REFERENCES "servers" ("id");

ALTER TABLE "rooms" ADD CONSTRAINT "fk_rooms_server_id"
FOREIGN KEY("server_id") REFERENCES "servers" ("id");

ALTER TABLE "access" ADD CONSTRAINT "fk_access_room_id"
FOREIGN KEY("room_id") REFERENCES "rooms" ("id");

ALTER TABLE "access" ADD CONSTRAINT "fk_access_role_id"
FOREIGN KEY("role_id") REFERENCES "roles" ("id");

ALTER TABLE "posts" ADD CONSTRAINT "fk_posts_room_id"
FOREIGN KEY("room_id") REFERENCES "rooms" ("id");

ALTER TABLE "posts" ADD CONSTRAINT "fk_posts_member_id"
FOREIGN KEY("member_id") REFERENCES "memberships" ("id");

ALTER TABLE "posts" ADD CONSTRAINT "fk_posts_threaded_from"
FOREIGN KEY("threaded_from") REFERENCES "posts" ("id");

ALTER TABLE "reactions" ADD CONSTRAINT "fk_reactions_post_id"
FOREIGN KEY("post_id") REFERENCES "posts" ("id");

ALTER TABLE "reactions" ADD CONSTRAINT "fk_reactions_member_id"
FOREIGN KEY("member_id") REFERENCES "memberships" ("id");

