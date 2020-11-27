const promiseTimeout = function (ms) {
  let timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
  return timeout;
};

module.exports = promiseTimeout;
