const blockedHeaders = {};

const calculateMinimumSwaps = (receivedOrder, blockedOrder) => {
  const originalIndices = {};

  for (let i = 0; i < blockedOrder.length; i++) {
    originalIndices[blockedOrder[i]] = i;
  }

  const swapsNeeded = receivedOrder.reduce((totalSwaps, header, index) => {
    const originalIndex = originalIndices[header];
    const difference = Math.abs(originalIndex - index);

    return totalSwaps + Math.min(difference, blockedOrder.length - difference);
  }, 0);

  return swapsNeeded;
};

const isBlockedHeaderOrder = (headerOrder, sensitivity) => {
  if (blockedHeaders[headerOrder.join()]) {
    return true;
  }

  for (const currentOrder of Object.values(blockedHeaders)) {
    const swapsNeeded = calculateMinimumSwaps(headerOrder, currentOrder);
    if (swapsNeeded <= sensitivity) {
      return true;
    }
  }

  return false;
};

const blockHeaderOrder = (headerOrder) => {
  blockedHeaders[headerOrder.join()] = headerOrder;
};

module.exports =
  (
    { isModelLearningEnabled, onlyAnalyzeHeaders, sensitivity } = {
      isModelLearningEnabled: true,
      onlyAnalyzeHeaders: [],
      sensitivity: 2,
    }
  ) =>
  (req, _, next) => {
    const headerOrder = Object.keys(req.headers)
      .filter((header) =>
        onlyAnalyzeHeaders.length ? onlyAnalyzeHeaders.includes(header) : true
      )
      .map((header) => header.toLowerCase());

    req.block = () => {
      blockHeaderOrder(headerOrder);

      if (!req.blocked) {
        req.blocked = true;
      }
    };

    if (isBlockedHeaderOrder(headerOrder, sensitivity)) {
      req.blocked = true;

      if (isModelLearningEnabled && !(headerOrder.join() in blockedHeaders)) {
        req.block();
      }
    }

    next();
  };
