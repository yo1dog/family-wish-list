const SQL             = require('@yo1dog/sql');
const db              = require('../../app/db');
const transactionWrap = require('../../app/utils/sql/transactionWrap');
const authUtil        = require('../../app/utils/authUtil');


/** @type {import('../runMigrations').MigrationRunFn} */
module.exports = async function run(context) {
  return await transactionWrap(db.getPool(), async dbClient => {
    const exampleUser = {
      firstName   : 'John',
      lastName    : 'Doe',
      email       : 'johndoe@example.com',
      passwordHash: authUtil.hashPassword('yo1dog'),
      authToken   : authUtil.createAuthToken()
    };
    
    await db.query(dbClient, SQL`
      SET ROLE fwl_owner;
      
      CREATE TABLE usr (
        id               SERIAL NOT NULL PRIMARY KEY,
        first_name       TEXT   NOT NULL,
        last_name        TEXT   NOT NULL,
        email            TEXT   NOT NULL,
        avatar_image_url TEXT,
        is_admin         BOOL  NOT NULL,
        password_hash    TEXT  NOT NULL,
        auth_token       TEXT  NOT NULL
      );
      CREATE UNIQUE INDEX ON usr (email);
      CREATE UNIQUE INDEX ON usr (auth_token);
      
      CREATE TABLE wish_list_collection (
        id                     SERIAL  NOT NULL PRIMARY KEY,
        owner_user_id          INT     NOT NULL REFERENCES usr(id) ON UPDATE CASCADE ON DELETE CASCADE,
        name                   TEXT    NOT NULL,
        has_single_wish_list   BOOLEAN NOT NULL DEFAULT FALSE,
        is_hidden              BOOLEAN NOT NULL DEFAULT FALSE
      );
      CREATE INDEX ON wish_list_collection (owner_user_id);
      
      CREATE TABLE wish_list (
        id                      SERIAL NOT NULL PRIMARY KEY,
        wish_list_collection_id INT    NOT NULL REFERENCES wish_list_collection(id) ON UPDATE CASCADE ON DELETE CASCADE,
        owner_user_id           INT    NOT NULL REFERENCES usr(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
      CREATE UNIQUE INDEX ON wish_list (wish_list_collection_id, owner_user_id);
      
      CREATE TABLE wish_list_item (
        id                 SERIAL  NOT NULL PRIMARY KEY,
        wish_list_id       INT     NOT NULL REFERENCES wish_list(id) ON UPDATE CASCADE ON DELETE CASCADE,
        creator_user_id    INT     NOT NULL REFERENCES usr(id) ON UPDATE CASCADE ON DELETE CASCADE,
        name               TEXT    NOT NULL,
        description        TEXT    NOT NULL DEFAULT ''::TEXT,
        url                TEXT    NOT NULL DEFAULT ''::TEXT,
        image_url          TEXT    NOT NULL DEFAULT ''::TEXT,
        priority           SERIAL  NOT NULL,
        covered_by_user_id INT     REFERENCES usr(id) ON UPDATE CASCADE ON DELETE SET NULL,
        is_fulfilled       BOOLEAN NOT NULL DEFAULT FALSE
      );
      
      CREATE TABLE suggestion (
        id                SERIAL      NOT NULL PRIMARY KEY,
        created_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        author_name       TEXT        NOT NULL,
        text              TEXT        NOT NULL,
        referring_url     TEXT
      );
    `);
    
    await db.query(dbClient, SQL`
      INSERT INTO usr (
        first_name,
        last_name,
        email,
        password_hash,
        auth_token
      ) VALUES (
        ${exampleUser.firstName},
        ${exampleUser.lastName},
        ${exampleUser.email},
        ${exampleUser.passwordHash},
        ${exampleUser.authToken}
      )
    `);
  });
};