const db     = require('../../../db');
const SQL    = require('@yo1dog/sql');
const CError = require('@yo1dog/cerror');

/**
 * @param {string} authUserId
 */
module.exports = async function homeViewData(authUserId) {
  const {rows: coveredCollections} = await db.query(SQL`
    SELECT 
      wish_list_collection.id,
      wish_list_collection.name,
      wish_list_collection.has_single_wish_list,
      json_agg(covered_wish_list) AS covered_wish_lists
    FROM (
      SELECT
        wish_list.id,
        wish_list_owner_usr.first_name AS owner_user_first_name,
        json_agg(covered_wish_list_item) AS covered_items,
        wish_list.wish_list_collection_id
      FROM (
        SELECT
          wish_list_item.id,
          wish_list_item.name,
          wish_list_item.is_fulfilled,
          wish_list_item.wish_list_id
        FROM wish_list_item
        WHERE covered_by_user_id = ${authUserId}
        ORDER BY wish_list_item.priority ASC
      ) AS covered_wish_list_item
      LEFT JOIN wish_list ON
        wish_list.id = covered_wish_list_item.wish_list_id
      LEFT JOIN usr AS wish_list_owner_usr ON
        wish_list_owner_usr.id = wish_list.owner_user_id
      GROUP BY wish_list.id, owner_user_first_name
      ORDER BY wish_list.id ASC
    ) AS covered_wish_list
    LEFT JOIN wish_list_collection ON
      wish_list_collection.id = covered_wish_list.wish_list_collection_id
    WHERE
      NOT wish_list_collection.is_hidden
    GROUP BY wish_list_collection.id
    ORDER BY wish_list_collection.id ASC
  `)
  .catch(err => {throw new CError(err, `Error SELECTing covered collections.`);});
  
  return {
    coveredCollections
  };
};