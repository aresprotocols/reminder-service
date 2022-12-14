exports.async = function (callback: Function) {
  setTimeout(function () {
    callback(10);
  }, 10);
};


