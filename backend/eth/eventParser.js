const EVENTLOADCHUNK = 250000;
let LASTBLOCK;
let ENDBLOCK;
const DEBUG = false;

const doSync = async (contract, eventName, updateFn, from, to, filter) => {
  from = Math.max(0, from);
  if (DEBUG) console.log('EVENT:', eventName, 'FROM', from, 'to', to, contract);
  let events;
  try {
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
  } catch (e) { console.log(e); }
  return true;
};

const loadDownTheChain = async (contract, eventName, updateFn, filter) => {
  while (LASTBLOCK >= ENDBLOCK) {
    let nextLast = LASTBLOCK - EVENTLOADCHUNK;
    if (nextLast < ENDBLOCK) nextLast = ENDBLOCK;
    await doSync(contract, eventName, updateFn, nextLast, LASTBLOCK, filter); // eslint-disable-line
    LASTBLOCK = nextLast - 1;
  }
};

module.exports = (contract, eventName, endingBlock, startingBlock, updateFn, filter) => {
  LASTBLOCK = parseInt(startingBlock, 10);
  ENDBLOCK = parseInt(endingBlock, 10);
  loadDownTheChain(contract, eventName, updateFn, filter);
};
