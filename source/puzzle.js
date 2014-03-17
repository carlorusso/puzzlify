define(['knockout', './piece'], function(ko, Piece) {
    var Puzzle = function() {
        this.pieces = ko.observableArray();
    };

    Puzzle.prototype.setNumPieces = function(row, col) {
        var self = this;
        this.numRowPieces = row;
        this.numColPieces = col;

        var status = function() {
            return Math.floor(Math.random() * 2) === 1 ? 1 : -1;
        };
        
        this.pieces([]);

        ko.utils.arrayForEach(ko.utils.range(0, row - 1), function(rowIndex) {
            var array = ko.observableArray([]);

            ko.utils.arrayForEach(ko.utils.range(0, col - 1), function(colIndex) {
                var piece = new Piece();

                piece.setParameters(
                        rowIndex,
                        colIndex,
                        colIndex === 0 ? 0 : array()[colIndex - 1],
                        rowIndex === 0 ? 0 : self.getPiece(rowIndex - 1, colIndex),
                        colIndex === col - 1 ? 0 : status(),
                        rowIndex === row - 1 ? 0 : status()
                        );

                array.push(piece);
            });

            self.pieces.push(array);
        });
    };

    Puzzle.prototype.getPiece = function(row, col) {
        return this.pieces()[row]()[col];
    };

    Puzzle.prototype.switchPiece = function(srcRow, srcCol, destRow, destCol) {
        var destPiece = this.getPiece(destRow, destCol),
                srcPiece = this.getPiece(srcRow, srcCol);

        this.setPiece(destRow, destCol, srcPiece);
        this.setPiece(srcRow, srcCol, destPiece);
    };

    return Puzzle;
});