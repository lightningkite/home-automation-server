var express = require('express');
var bodyParser = require('body-parser');
var cradle = require('cradle');

var app = express();
var db = new(cradle.Connection)('http://localhost', 5984).database('garage_doors');

app.use(bodyParser.json());

app.get('/garage-doors', function (req, res) {
  db.view('garage_doors/all', function (err, response) {
    if (!err) {
      var rows = [];
      response.forEach(function (key, row, id) {
        rows.push(row);
      });
      res.send(rows), 200;
    } else {
      res.send({'non_field_errors': ['Error querying doors.']}), 500
    }
  });
});

app.post('/garage-doors', function (req, res) {
  var name = req.body.name;
  if (name) {
    db.save({
      name: name,
      state: 'unknown'
    }, function (err, response) {
      if (!err) {
        res.send(response), 201;
      } else {
        res.send({'non_field_errors': ['Error creating door.']}), 400;
      }
    });
  } else {
    res.send({'name': ['Value for name required.']}), 400;
  }
});

app.put('/garage-doors/:id', function (req, res) {
  var name = req.body.name;
  var state = req.body.state;
  var id = req.params.id;
  if (!name) {
    return res.send({'name': ['Value for name required.']}), 400;
  }
  if (!state) {
    return res.send({'name': ['Value for state required.']}), 400;
  }
  if (!isValidState(state)) {
    return res.send({'name': ['State requested is not valid.']}), 400;
  }
  if (!id) {
    return res.send({'id': ['ID required.']}), 400;
  }
  db.merge(id, {
    name: name,
    state: state
  }, function (err, response) {
    if (!err) {
      res.send(response), 200;
    } else {
      res.send({'non_field_errors': ['Error updating door.']}), 400;
    }
  });
});

app.patch('/garage-doors/:id', function (req, res) {
  var state = req.body.state;
  var id = req.params.id;
  if (!state) {
    return res.send({'name': ['Value for state required.']}), 400;
  }
  if (!isValidState(state)) {
    return res.send({'name': ['State requested is not valid.']}), 400;
  }
  db.merge(id, {
    state: state
  }, function (err, response) {
    if (!err) {
      res.send(response), 200;
    } else {
      res.send({'non_field_errors': ['Error updating door.']}), 400;
    }
  });
});

app.delete('/garage-doors/:id/:rev', function (req, res) {
  var rev = req.params.rev;
  var id = req.params.id;
  db.remove(id, rev, function (err, response) {
    if (!err) {
      res.send(response), 200;
    } else {
      res.send({'non_field_errors': ['Error deleting door.']}), 400;
    }

  });
});

function isValidState (state) {
  var VALID_STATES = ['open', 'closed', 'unknown'];
  for (x in VALID_STATES) {
    if (state === VALID_STATES[x]) {
      return true;
    }
  }
  return false;
}

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
