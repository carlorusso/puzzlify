define(['knockout', 'jquery', './puzzle', './piece'], function(ko, $, Puzzle, Piece) {
    function Puzzlify(image, destWidth, destHeight, numRow, numCol, callback) {
        this.images = ko.observableArray([]);
        this.imageName = image;
        this.originalSize = {width: destWidth, height: destHeight};
        this.numRowPieces = ko.observable(numRow);
        this.numColPieces = ko.observable(numCol);
        this.callback = callback;

        this.puzzle = new Puzzle();
    }

    Puzzlify.prototype.createPuzzle = function() {
        var self = this;

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext("2d");

        this.originalImage = new Image();
        this.originalImage.onload = function() {
            self.initOnImageLoad();
        };
        this.originalImage.src = this.imageName;
    };

    Puzzlify.prototype.initOnImageLoad = function() {
        this.canvas.width = this.originalImage.width;
        this.canvas.height = this.originalImage.height;

        this.puzzle.setNumPieces(this.numRowPieces(), this.numColPieces());
        var tileWidth = this.canvas.width / this.numRowPieces(),
                tileHeight = this.canvas.height / this.numColPieces();

        this.context.drawImage(this.originalImage, 0, 0);
        this.distance = {
            left: this.originalSize.width / this.originalImage.width * 85,
            top: this.originalSize.height / this.originalImage.height * 85
        };

        var pieces = [];
        //$('#sidebar').empty();
        //left, top, right, bottom; 0 is closed, 1 is external, -1 is internal
        for (var rowIndex = 0; rowIndex < this.numRowPieces(); rowIndex++) {
            for (var colIndex = 0; colIndex < this.numColPieces(); colIndex++) {
                var piece = this.puzzle.getPiece(rowIndex, colIndex);
                var data = this.createPiece({
                    left: piece.left(),
                    top: piece.top(),
                    right: piece.right(),
                    bottom: piece.bottom()
                }, {x: colIndex, y: rowIndex}, tileWidth, tileHeight);

                var canvas = document.createElement('canvas');
                canvas.width = data.width / tileWidth * this.originalSize.width / this.numRowPieces();
                canvas.height = data.height / tileHeight * this.originalSize.height / this.numColPieces();
                var context = canvas.getContext("2d");
                context.drawImage(data, 0, 0, canvas.width, canvas.height);

                piece.setImage(canvas.toDataURL());
                piece.setDistance(this.distance);

                //shuffle
                var index = Math.floor(Math.random() * pieces.length);
                pieces.splice(index,0,piece);
            }
        }

        this.callback(pieces);
    };

    Puzzlify.prototype.createPiece = function(currentPiece, currentPosition, tileWidth, tileHeight) {
        var pieceWidth = (currentPiece.left === 1 ? 1 : 0) + (currentPiece.right === 1 ? 1 : 0);
        var pieceHeight = (currentPiece.top === 1 ? 1 : 0) + (currentPiece.bottom === 1 ? 1 : 0);

        var currentPieceCanvas = document.createElement('canvas');
        var currentPieceContext = currentPieceCanvas.getContext("2d");

        var r = 35, l = 15;
        var pieceData = {
            circleRadius: r,
            circleDistance: l,
            mainRectLeft: currentPiece.left === 1 ? l + 2 * r : 0,
            mainRectTop: currentPiece.top === 1 ? l + 2 * r : 0,
            mainRectWidth: tileWidth,
            mainRectHeight: tileHeight
        };
        pieceData.mainRectRight = pieceData.mainRectLeft + pieceData.mainRectWidth;
        pieceData.mainRectBottom = pieceData.mainRectTop + pieceData.mainRectHeight;

        currentPieceCanvas.width = tileWidth + pieceWidth * (2 * r + l);
        currentPieceCanvas.height = tileHeight + pieceHeight * (2 * r + l);

        currentPieceContext.fillStyle = 'blue';
        currentPieceContext.rect(pieceData.mainRectLeft, pieceData.mainRectTop, pieceData.mainRectWidth, pieceData.mainRectHeight);
        currentPieceContext.fill();

        this.updatePieceLeft(currentPiece.left, currentPieceCanvas, currentPieceContext, pieceData);
        this.updatePieceTop(currentPiece.top, currentPieceCanvas, currentPieceContext, pieceData);
        this.updatePieceRight(currentPiece.right, currentPieceCanvas, currentPieceContext, pieceData);
        this.updatePieceBottom(currentPiece.bottom, currentPieceCanvas, currentPieceContext, pieceData);

        currentPieceContext.save();
        currentPieceContext.beginPath();
        currentPieceContext.globalCompositeOperation = 'source-in';
        currentPieceContext.drawImage(this.canvas, -currentPosition.x * tileWidth + pieceData.mainRectLeft, -currentPosition.y * tileHeight + pieceData.mainRectTop);
        currentPieceContext.restore();

        return currentPieceCanvas;
    };

    Puzzlify.prototype.updatePieceLeft = function(left, currentPieceCanvas, currentPieceContext, data) {
        currentPieceContext.save();

        var alpha, cX, cY = data.mainRectTop + data.mainRectHeight / 2, pX, pY;

        switch (left) {
            case -1:
                alpha = Math.PI * 0.25;
                cX = data.mainRectLeft + data.circleDistance + data.circleRadius;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, Math.PI + alpha, Math.PI - alpha, false);
                //rettangolo
                currentPieceContext.rect(data.mainRectLeft, cY - pY, 2 * pX, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-over';
                currentPieceContext.moveTo(data.mainRectLeft, cY - pY - 2);
                currentPieceContext.quadraticCurveTo(data.mainRectLeft, cY, cX - pX, cY - pY - 2);
                currentPieceContext.moveTo(data.mainRectLeft, cY + pY + 2);
                currentPieceContext.quadraticCurveTo(data.mainRectLeft, cY, cX - pX, cY + pY + 2);
                currentPieceContext.fill();
                break;
            case 0:
                break;
            case 1:
                alpha = Math.PI * 0.25;
                cX = data.circleRadius;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, alpha, -alpha, false);
                //rettangolo
                currentPieceContext.rect(data.circleRadius, cY - pY, 2 * pX + 1, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                currentPieceContext.moveTo(data.mainRectLeft, cY - pY - 1);
                currentPieceContext.quadraticCurveTo(data.mainRectLeft, cY, cX + pX - 1, cY - pY - 1);
                currentPieceContext.moveTo(data.mainRectLeft, cY + pY + 1);
                currentPieceContext.quadraticCurveTo(data.mainRectLeft, cY, cX + pX - 1, cY + pY + 1);
                currentPieceContext.fill();
                break;
        }
        currentPieceContext.restore();
    };

    Puzzlify.prototype.updatePieceTop = function(top, currentPieceCanvas, currentPieceContext, data) {
        currentPieceContext.save();

        var alpha, cX = data.mainRectLeft + data.mainRectWidth / 2, cY, pX, pY;

        switch (top) {
            case -1:
                alpha = Math.PI * 0.25;
                cY = data.mainRectTop + data.circleRadius + data.circleDistance;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, -alpha, Math.PI + alpha, false);
                //rettangolo
                currentPieceContext.rect(cX - pX, data.mainRectTop, 2 * pX, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-over';
                currentPieceContext.moveTo(cX - data.circleRadius, data.mainRectTop);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectTop, cX - pX, data.mainRectTop + pY);
                currentPieceContext.moveTo(cX + data.circleRadius, data.mainRectTop);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectTop, cX + pX, data.mainRectTop + pY);
                currentPieceContext.fill();
                break;
            case 0:
                break;
            case 1:
                alpha = Math.PI * 0.75;
                cY = data.circleRadius;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, alpha, Math.PI - alpha, false);
                //rettangolo
                currentPieceContext.rect(cX - pX, data.mainRectTop - data.circleRadius - data.circleDistance, 2 * pX, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                currentPieceContext.moveTo(cX - data.circleRadius, data.mainRectTop);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectTop, cX - pX, data.mainRectTop - pY);
                currentPieceContext.moveTo(cX + data.circleRadius, data.mainRectTop);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectTop, cX + pX, data.mainRectTop - pY);
                currentPieceContext.fill();
                break;
        }
        currentPieceContext.restore();
    };

    Puzzlify.prototype.updatePieceRight = function(right, currentPieceCanvas, currentPieceContext, data) {
        currentPieceContext.save();

        var alpha, cX, cY = data.mainRectTop + data.mainRectHeight / 2, pX, pY;

        switch (right) {
            case -1:
                alpha = Math.PI * 0.25;
                cX = data.mainRectRight - data.circleDistance - data.circleRadius;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, alpha, -alpha, false);
                //rettangolo
                currentPieceContext.rect(data.mainRectRight - data.circleRadius - data.circleDistance, cY - pY, 2 * pX + 1, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-over';
                currentPieceContext.moveTo(data.mainRectRight, cY - pY - 1);
                currentPieceContext.quadraticCurveTo(data.mainRectRight, cY, cX + pX - 1, cY - pY - 1);
                currentPieceContext.moveTo(data.mainRectRight, cY + pY + 1);
                currentPieceContext.quadraticCurveTo(data.mainRectRight, cY, cX + pX - 1, cY + pY + 1);
                currentPieceContext.fill();
                break;
            case 0:
                break;
            case 1:
                alpha = Math.PI * 0.75;
                cX = data.mainRectRight + data.circleDistance + data.circleRadius;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, -alpha, alpha, false);
                //rettangolo
                currentPieceContext.rect(data.mainRectRight, cY - pY, 2 * pX, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                currentPieceContext.moveTo(data.mainRectRight, cY - pY - 1);
                currentPieceContext.quadraticCurveTo(data.mainRectRight, cY, cX - pX + 1, cY - pY - 1);
                currentPieceContext.moveTo(data.mainRectRight, cY + pY + 1);
                currentPieceContext.quadraticCurveTo(data.mainRectRight, cY, cX - pX + 1, cY + pY + 1);
                currentPieceContext.fill();
                break;
        }
        currentPieceContext.restore();
    };

    Puzzlify.prototype.updatePieceBottom = function(bottom, currentPieceCanvas, currentPieceContext, data) {
        currentPieceContext.save();

        var alpha, cX = data.mainRectLeft + data.mainRectWidth / 2, cY, pX, pY;

        switch (bottom) {
            case -1:
                alpha = Math.PI * 0.25;
                cY = data.mainRectBottom - data.circleRadius - data.circleDistance;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, Math.PI - alpha, alpha, false);
                //rettangolo
                currentPieceContext.rect(cX - pX, data.mainRectBottom - data.circleRadius - data.circleDistance, 2 * pX, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-over';
                currentPieceContext.moveTo(cX - data.circleRadius, data.mainRectBottom);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectBottom, cX - pX, data.mainRectBottom - pY);
                currentPieceContext.moveTo(cX + data.circleRadius, data.mainRectBottom);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectBottom, cX + pX, data.mainRectBottom - pY);
                currentPieceContext.fill();
                break;
            case 0:
                break;
            case 1:
                alpha = Math.PI * 0.25;
                cY = data.mainRectBottom + data.circleRadius + data.circleDistance;

                pY = Math.abs(Math.sin(alpha) * data.circleRadius);
                pX = Math.abs(Math.cos(alpha) * data.circleRadius);

                currentPieceContext.beginPath();
                //cerchio
                currentPieceContext.moveTo(cX, cY);
                currentPieceContext.arc(cX, cY, data.circleRadius, -alpha, Math.PI + alpha, false);
                //rettangolo
                currentPieceContext.rect(cX - pX, data.mainRectBottom, 2 * pX, data.circleRadius + data.circleDistance);
                currentPieceContext.fill();

                currentPieceContext.beginPath();
                currentPieceContext.globalCompositeOperation = 'destination-out';
                currentPieceContext.moveTo(cX - data.circleRadius, data.mainRectBottom);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectBottom, cX - pX, data.mainRectBottom + pY);
                currentPieceContext.moveTo(cX + data.circleRadius, data.mainRectBottom);
                currentPieceContext.quadraticCurveTo(cX, data.mainRectBottom, cX + pX, data.mainRectBottom + pY);
                currentPieceContext.fill();
                break;

        }
        currentPieceContext.restore();
    };

    return Puzzlify;
});