CREATE ROLE fwl_owner;
CREATE ROLE fwl_admin_group WITH NOINHERIT IN ROLE fwl_owner;
CREATE ROLE fwl_api_group;
CREATE ROLE fwl_readonly_group;

/*
example users
 - replace _local prefix with environment
 - replace passwords

CREATE ROLE fwl_admin_local    WITH LOGIN PASSWORD '111111' IN ROLE fwl_admin_group;
CREATE ROLE fwl_api_local      WITH LOGIN PASSWORD '111111' IN ROLE fwl_api_group;
CREATE ROLE fwl_readonly_local WITH LOGIN PASSWORD '111111' IN ROLE fwl_readonly_group;
*/