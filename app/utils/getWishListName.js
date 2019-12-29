/**
 * @param {boolean} isAuthUserWishList
 * @param {string} ownerUserFirstName
 * @returns {string}
 */
module.exports = function getWishListName(isAuthUserWishList, ownerUserFirstName) {
  if (isAuthUserWishList) {
    return 'Your';
  }
  
  let listName = ownerUserFirstName;
  if (/[sS]$/.test(listName)) {
    listName += '\'';
  }
  else {
    listName += '\'s';
  }
  
  return listName;
};