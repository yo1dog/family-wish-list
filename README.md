# Family Wish List

Family Wish List


## Setup

- `npm install`
- Create empty database.
- Use `tools/createGroupRoles.sql` to create DB group roles.
- Use `tools/setGroupRoleDefaultPrivileges.sql` to set group role default privileges.
- Create DB user roles. See bottom of `tools/createGroupRoles.sql`.
- Create `.env` file at project root or use environment variables to configure. See `app/config.js`.
- Initiate database structure and run migrations with `node migrate/runMigrations.js`.


## Run

`npm start`