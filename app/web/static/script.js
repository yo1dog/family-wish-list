// eslint-disable-next-line @typescript-eslint/no-unused-vars
const wishListItemUpdater = {
  /**
   * @param {string} itemId 
   * @param {boolean} isCovered 
   * @param {boolean} [isFulfilled] 
   */
  async setCovered(itemId, isCovered, isFulfilled = false) {
    const res = await fetch('/api/setWishListItemCovered', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemId,
        isCovered,
        isFulfilled
      })
    });
    
    if (!res.ok) {
      const bodyStr = await res.text();
      throw new Error(`Non 200 status code recieved '${res.status}':\n${bodyStr}.`);
    }
  }
};