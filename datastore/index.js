const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    items[id] = text;
    const filename = path.join(exports.dataDir, id + '.txt');
    // console.log(filename);
    fs.writeFile(filename, text, (err) => {
      if (err) {
        callback(new Error(`Couldn't write file ${filename}`));
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  // build a list of the files in the dataDir
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(new Error(`Couldn't read director ${exports.dataDir}`));
    } else {
      var data = _.map(files, (filename, index) => {
        // strip the extension
        filename = filename.slice(0, -4);
        // use message's id for both text/id
        return { id: filename, text: filename };
      });
      callback(null, data);
    }
  });
};

exports.readOne = (id, callback) => {
  const filename = path.join(exports.dataDir, id + '.txt');
  fs.readFile(filename, (err, fileData) => {
    if (err) {
      callback(new Error(`Couldn't read file ${filename}`));
    } else {
      const todo = {id: id, text: fileData.toString()};
      // console.log(`Read todo: ${JSON.stringify(todo)}`);
      callback(null, todo);
    }
  });
};

exports.update = (id, text, callback) => {
  const filename = path.join(exports.dataDir, id + '.txt');
  // make sure the todo exists on server first
  exports.readOne(id, (err, todo) => {
    if (err) {
      // pass error down the chain
      callback(err);
    } else {
      // update the todo
      // console.log(`Updating ID of ${id}`);
      fs.writeFile(filename, text, (err) => {
        if (err) {
          callback(new Error(`Couldn't update file ${filename}`));
        } else {
          callback(null, {id: id, text: text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  const filename = path.join(exports.dataDir, id + '.txt');
  exports.readOne(id, (err, todo) => {
    if (err) {
      callback(new Error(`Couldn't delete file ${filename} because it doesn't exist.`));
    } else {
      // file exists, so delete it
      fs.unlink(filename, (err) => {
        if (err) {
          // this probably shouldn't happen
          callback(new Error(`Could not delete ${filename} for unknown reason.`));
        } else {
          callback(null);
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
