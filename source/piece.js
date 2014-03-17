define(['knockout'], function(ko) {
    var Piece = function() {
        //location
        this.x = ko.observable();
        this.y = ko.observable();

        //holes / none / more
        this.left = ko.observable();
        this.top = ko.observable();
        this.right = ko.observable();
        this.bottom = ko.observable();

        //image
        this.image = ko.observable();

        //css
        this.marginX = ko.observable(0);
        this.marginY = ko.observable(0);
        this.css = ko.computed(function() {
            return {
                'left': this.left() === 1,
                'top': this.top() === 1,
                'right': this.right() === 1,
                'bottom': this.bottom() === 1
            };
        }, this);
    };

    Piece.prototype.setParameters = function(x, y, leftPiece, topPiece, rightPiece, bottomPiece) {
        this.x(x);
        this.y(y);
        this.left(leftPiece !== 0 ? -leftPiece.right() : 0);
        this.top(topPiece !== 0 ? -topPiece.bottom() : 0);
        this.right(rightPiece);
        this.bottom(bottomPiece);
    };

    Piece.prototype.setImage = function(data) {
        this.image(data);
    };

    Piece.prototype.setDistance = function(data) {
        this.marginX(data.left);
        this.marginY(data.top);
    };

    return Piece;
});