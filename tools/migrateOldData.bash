#! /bin/bash
# Usage: OLD_PGURL='...' NEW_PGURL='...' ./migrateOldData.bash

set -e -o pipefail
cd "$(dirname "$0")"

(
  echo '
    DROP SCHEMA IF EXISTS fwl_old CASCADE;
    CREATE SCHEMA fwl_old;
  ';
  pg_dump --no-owner --no-acl "$OLD_PGURL" | sed -e 's/public\./fwl_old./g';
  cat <<EOF
    BEGIN;
    
    INSERT INTO public.usr (
      id,              
      first_name,
      last_name,
      email,
      avatar_image_url,
      is_admin,
      password_hash,
      auth_token
    )
    SELECT
      id,
      first_name,
      last_name,
      email,
      avatar_image_url,
      id = 7,
      encode(password_hash, 'hex'),
      md5(random()::text)
    FROM fwl_old.users;
    SELECT setval(
      pg_get_serial_sequence('public.usr', 'id'),
      coalesce(max(id), 0) + 1,
      FALSE
    ) FROM public.usr;
    
    INSERT INTO public.wish_list_collection(
      id,
      owner_user_id,
      name,
      has_single_wish_list,
      is_hidden
    )
    SELECT
      id,
      owner_user_id,
      name,
      exclusive_wish_list_id IS NOT NULL,
      is_hidden
    FROM fwl_old.wish_list_collections;
    SELECT setval(
      pg_get_serial_sequence('public.wish_list_collection', 'id'),
      coalesce(max(id), 0) + 1,
      FALSE
    ) FROM public.wish_list_collection;
    
    INSERT INTO public.wish_list (
      id,
      wish_list_collection_id,
      owner_user_id
    )
    SELECT
      id,
      wish_list_collection_id,
      owner_user_id
    FROM fwl_old.wish_lists;
    SELECT setval(
      pg_get_serial_sequence('public.wish_list', 'id'),
      coalesce(max(id), 0) + 1,
      FALSE
    ) FROM public.wish_list;
    
    INSERT INTO public.wish_list_item (
      id,
      wish_list_id,
      creator_user_id,
      name,
      description,
      url,
      image_url,
      priority,
      covered_by_user_id,
      is_fulfilled
    )
    SELECT
      id,
      wish_list_id,
      creator_user_id,
      name,
      description,
      url,
      image_url,
      priority,
      covered_by_user_id,
      fulfilled
    FROM fwl_old.wish_list_items;
    SELECT setval(
      pg_get_serial_sequence('public.wish_list_item', 'id'),
      coalesce(max(id), 0) + 1,
      FALSE
    ) FROM public.wish_list_item;
    
    INSERT INTO public.suggestion (
      id,
      created_timestamp,
      author_user_id,
      text,
      referring_url
    )
    SELECT
      fwl_old.suggestions.id,
      fwl_old.suggestions.created_timestamp,
      COALESCE(fwl_old.users.first_name || ' ' || fwl_old.users.last_name, 'Anonymous'),
      fwl_old.suggestions.text,
      fwl_old.suggestions.referring_page
    FROM fwl_old.suggestions
    LEFT JOIN fwl_old.users ON fwl_old.users.id = fwl_old.suggestions.author_user_id;
    SELECT setval(
      pg_get_serial_sequence('public.suggestion', 'id'),
      coalesce(max(id), 0) + 1,
      FALSE
    ) FROM public.suggestion;
    
    COMMIT;
    
    DROP SCHEMA fwl_old CASCADE;
EOF
) | psql "$NEW_PGURL"