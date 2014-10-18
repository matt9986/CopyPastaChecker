Function.prototype.inherits = function(fun) {
  function Surrogate() {};
  Surrogate.prototype = fun.prototype;
  this.prototype = new Surrogate();
};

// So we're going to just write some tests as we go along
(function (root) {
  var QuickTester = root.QuickTester = (root.QuickTester || {});

  var TestSuite = QuickTester.TestSuite = function() {
    this.failed_asserts = 0;
    this.passed_asserts = 0;
  }

  TestSuite.prototype.all_tests = function() {
    var tests = [];
    for (method in this) {
      if ('test_' === method.substring(0, 5)) {
        tests.push(method);
      };
    }
    return tests;
  };

  // First a quick assert
  TestSuite.prototype.assert_equals = function(a, b) {
    if (a != b) {
      console.log('Failed asserting ' + a + ' equals ' + b);
      this.failed_asserts++;
    } else {
      this.passed_asserts++;
    };
  };

  TestSuite.prototype.assert_truthy = function(a) {
    if (!a) {
      console.log('Failed asserting ' + a + ' was suitably truthy');
      this.failed_asserts++;
    } else {
      this.passed_asserts++;
    };
  };

  TestSuite.prototype.run_all_tests = function() {
    var that = this;
    this.all_tests().forEach(function(arg){
      var previous_fails = that.failed_asserts;
      that[arg]();
      if (that.failed_asserts != previous_fails) {
        console.log(arg + " failed.")
      };
    });
    var total = this.failed_asserts + this.passed_asserts;
    console.log("Tests run. " + this.passed_asserts + " assertions passed. " +
      this.failed_asserts + " assertions failed.");
    this.failed_asserts = 0;
    this.passed_asserts = 0;
    return true;
  };

  var CopyPastaCheckerTests = QuickTester.CopyPastaCheckerTests = function () {
    this.failed_asserts = 0;
    this.passed_asserts = 0;
  }

  CopyPastaCheckerTests.inherits(TestSuite);

  CopyPastaCheckerTests.prototype.test_create_blank_index = function() {
    var text_index = new root.CopyPastaChecker.TextIndex;
    var blank_index = text_index.get_empty_index();

    this.assert_truthy(blank_index instanceof Array);
    this.assert_equals(0, blank_index.length);
  };

  CopyPastaCheckerTests.prototype.test_create_index = function() {
    var text_index = new root.CopyPastaChecker.TextIndex;
    var str = "Lets start with defaults on and a simple sentence that is useful";
    var index = text_index.create_index(str);
    // 19 is the number of unique characters in str
    this.assert_equals(19, Object.keys(index).length);
    for (var i = str.length - 1; i >= 0; i--) {
      this.assert_truthy(str[i] in index);
      var line_nums = index[str[i]];
      this.assert_truthy(line_nums.indexOf(i) != -1);
    };
  }

  // Lets bring it all together
  CopyPastaCheckerTests.prototype.test_compare_indices = function() {
    var str = 'I need a string that is a hundred characters long but' + 
    ' I am far too terse to be cool enough for this.';
    var text_index = new root.CopyPastaChecker.TextIndex;
    var compare = new root.CopyPastaChecker.IndexMatcher;

    var index =  text_index.create_index(str);
    var results = compare.compare_indices(index, index);

    this.assert_truthy('0...0' in results);
    this.assert_equals(100, results['0...0']);
    this.assert_truthy('1...1' in results);
    this.assert_truthy('2...2' in results);
    this.assert_truthy('3...3' in results);
    this.assert_truthy('4...4' in results);
    this.assert_truthy('5...5' in results);
    this.assert_truthy('6...6' in results);
  };

  CopyPastaCheckerTests.prototype.test_find_matches = function() {
    var str = 'I need a string that is a hundred characters long but' + 
    ' I am far too terse to be cool enough for this.';
    var text_index = new root.CopyPastaChecker.TextIndex;
    var compare = new root.CopyPastaChecker.IndexMatcher;

    var index =  text_index.create_index(str);
    var results = compare.find_matches(index, index);

    this.assert_equals(1, results.length);
    this.assert_equals(0, results[0].pos1);
    this.assert_equals(0, results[0].pos2);
    this.assert_equals(110, results[0].match_length);
  };

  CopyPastaCheckerTests.prototype.test_find_two_matches = function() {
    var str1 = 'I need a string that is a hundred characters long but' + 
    ' I am far too terse to be cool enough for this.';
    var str2 = 'I need a string that is a hundred characters long but' + 
    ' I am far too terse to be cool enough for this.' +
    'I need a string that is a hundred characters long but' + 
    ' I am far too terse to be cool enough for this.';
    var text_index = new root.CopyPastaChecker.TextIndex;
    var compare = new root.CopyPastaChecker.IndexMatcher;

    var index1 =  text_index.create_index(str1);
    var index2 =  text_index.create_index(str2);
    var results = compare.find_matches(index1, index2);

    this.assert_equals(2, results.length);
    this.assert_equals(0, results[0].pos1);
    this.assert_equals(0, results[0].pos2);
    this.assert_equals(110, results[0].match_length);
    this.assert_equals(0, results[1].pos1);
    this.assert_equals(100, results[1].pos2);
    this.assert_equals(110, results[1].match_length);
  };
})(window)