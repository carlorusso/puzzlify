puzzlify
========

Puzzlify makes a puzzle from an Image

##Getting started

Prerequisites are:
- RequireJS

You can use it with the following call:
var image = 'file.png', dest = $('#my-div'), numRow = 5, numCol = 5, pieces = [];
require(['puzzlify'], function(Puzzlify) {
    var puzzlify = new Puzzlify(image, dest.width(), dest.height(), numRow, numCol, function(array) {
            pieces = array;
        });
        
    puzzlify.createPuzzle();
});

##License

MIT license - [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)