(function (root) {
  var CopyPastaChecker = root.CopyPastaChecker = (root.CopyPastaChecker || {});

  // Constructor function
  var TextIndex = CopyPastaChecker.TextIndex = function() {
    this.index_length = 100;
  };

  // This function should be the do-all function, 
  TextIndex.prototype.create_index = function(text) {
    var new_index = this.get_empty_index(this.index_length);
    return this.populate_index(new_index, text);
  };

  // A function that just returns a blank index object of the right size
  TextIndex.prototype.get_empty_index = function(len) {
    var index = [];

    for (var i = 0; i < len; i++) {
      index.push([]);
    };

    return index;
  };

  // Populates an index using a string, takes an offset so that a text can
  // populate an index in parts
  TextIndex.prototype.populate_index = function(index, string, offset) {
    offset = typeof offset !== 'undefined' ? offset : 0;
    // This for loop gets us the character and position
    for (var x = string.length - 1; x >= 0; x--) {
      this.set_index_at_position(index, string[x], x + offset);
    };
    return index;
  };

  TextIndex.prototype.set_index_at_position = function(index, character, pos) {
    var len = index.length;
    for (var i = 0; i < len; i++) {
      // If this character hasn't occured at this position of the index before
      // create a new list to hold positions
      index[i][character] = index[i][character] || [];
      // Add this position to the list of positions that have this character at
      // this place in the index
      index[i][character].push(pos - i);
    };
  };


  // Ok, we now have indexes and now we need to compare them to find matches
  // Constructor function
  var IndexMatcher = CopyPastaChecker.IndexMatcher = function() {
    this.match_length = 100;
    this.acceptable_errors = 10; // 10% seems generous
  }

  // The workhorse. Calls all the other things.
  IndexMatcher.prototype.find_matches = function(index_1, index_2) {
    this.verify_indexes(index_1, index_2);
    var results = this.compare_indices(index_1, index_2);
    return this.clean_up_results(results);
  };

  IndexMatcher.prototype.clean_up_results = function(matches) {
    // 1. Get and sort the keys
    var keys = this.get_sorted_match_keys(matches)
    // 2. Create some result objects
    return this.create_result_objects(matches, keys);
  };

  IndexMatcher.prototype.compare_indices = function(index_1, index_2) {
    var len =  this.match_length;
    var tally = []; // We're going to save them in pos1=>[pos2=>#matches]
    var threshold = []; // Store in here as 'pos1...pos2'=>#matches
    for (var i = 0; i < len; i++) {
      for (var chr in index_1[i]) {
        if (chr in index_2[i]) {
          this.tally_matches(tally, threshold, index_1[i][chr], index_2[i][chr], i === 0);
        };
      };
    };
    return threshold;
  };

  IndexMatcher.prototype.create_result_objects = function(matches, keys) {
    var results = [];
    var dupes = [];
    // Iterate through the keys
    var count = keys.length;
    for (var i = 0; i < count; i++) {
      var key = keys[i];
      if (key in dupes) {
        continue;
      };
      // If it's not a dupe, make a result object of it
      var obj = {};
      results.push(obj);
      var key_arr = key.split('...');
      obj.pos1 = key_arr[0];
      obj.pos2 = key_arr[1];
      var j = 1;
      var next = [parseInt(key_arr[0]) + j, parseInt(key_arr[1]) + j].join('...');
      while (next in matches) {
        dupes[next] = true;
        j++;
        next = [parseInt(key_arr[0]) + j, parseInt(key_arr[1]) + j].join('...');
      };
      obj.match_length = this.match_length + j - 1;
    };
    return results;
  };

  IndexMatcher.prototype.get_sorted_match_keys = function(matches) {
    var keys = [];
    for (key in matches) {
      keys.push(key);
    };
    keys.sort(function(a, b) {
      var a_arr = a.split('...');
      var b_arr = b.split('...');
      if ((parseInt(a_arr[0]) - parseInt(b_arr[0])) !== 0) {
        return parseInt(a_arr[0]) - parseInt(b_arr[0]);
      } else {
        return parseInt(a_arr[1]) - parseInt(b_arr[1]);
      };
      return parseInt(a.split('...')[0]) - parseInt(b.split('...')[0]);
    });
    return keys;
  };

  // Five parameters, getting a little heavy...
  IndexMatcher.prototype.tally_matches = function(tally, matches, positions_1, positions_2, add_new) {
    var that = this;
    if (add_new) {
      positions_1.forEach(function(pos1) {
        tally[pos1] = [];
        positions_2.forEach(function(pos2) {
          tally[pos1][pos2] = 1;
        });
      });
    } else {
      // Not the first time? Lets only increment matches we have then.
      positions_1.forEach(function(pos1) {
        if (pos1 in tally) {
          positions_2.forEach(function(pos2) {
            if (pos2 in tally[pos1]) {
              var count = tally[pos1][pos2];
              count++;
              tally[pos1][pos2] = count;
              if (count >= (that.match_length - that.acceptable_errors)) {
                var index = [pos1, pos2].join('...');
                matches[index] = count;
              };
            };
          });
        };
      });
    };
  };

  IndexMatcher.prototype.verify_indexes = function(index_1, index_2) {
    if (!(index_1 instanceof Array) || !(index_2 instanceof Array)) {
      throw "Parameter 1 and 2 need to be index objects";
    };
    if (index_1.length < this.match_length) {
      throw "Parameter 1 index is too small for a match length of " + this.match_length;
    };
    if (index_2.length < this.match_length) {
      throw "Parameter 2 index is too small for a match length of " + this.match_length;
    };
  };
})(window)

// TODO: looks like indexes are created properly now
// * Write index class for sentences
// * Create webpage
// * Github????