const fs = require('fs');

const index = (files) => {
  files.map((file) => {
    fs.unlink(`${file.path}`, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports = index;