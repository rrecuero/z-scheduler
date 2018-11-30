const LOOKBACK = 16;
module.exports = async (contract, eventName, currentBlock, updateFn, filter) => {
  const from = parseInt(currentBlock, 10) - LOOKBACK;
  const to = 'latest';
  let events;
  if (filter) {
    events = await contract.getPastEvents(eventName, {
      filter,
      fromBlock: from,
      toBlock: to
    });
  } else {
    events = await contract.getPastEvents(eventName, {
      fromBlock: from,
      toBlock: to
    });
  }
  for (let i = 0; i < events.length; i += 1) {
    const thisEvent = events[i].returnValues;
    thisEvent.blockNumber = events[i].blockNumber;
    updateFn(thisEvent);
  }
  return true;
};
