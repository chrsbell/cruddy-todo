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
      // console.log('Wrote file ' + id);
      callback(null, { id, text });
    });
  });
};

exports.readAll = (callback) => {
  // build a list of the files in the dataDir
  fs.readdir(exports.dataDir, (err, files) => {
    var data = _.map(files, (filename, index) => {
      // strip the extension
      filename = filename.slice(0, -4);
      // use message's id for both text/id
      return { id: filename, text: filename };
    });
    callback(null, data);
  });
};

exports.readOne = (id, callback) => {
  const filename = path.join(exports.dataDir, id + '.txt');
  fs.readFile(filename, (err, fileData) => {
    if (err) {
      // This probably shouldn't happen
      callback(new Error(`Couldn't read file ${filename}`));
    } else {
      const todo = {id: id, text: fileData.toString()};
      // console.log(`Read todo: ${JSON.stringify(todo)}`);
      callback(null, todo);
    }
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err, todo) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, todo);
    }
  });
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
