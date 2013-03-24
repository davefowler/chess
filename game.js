/* Chess 
 * By Dave Fowler
 */

/* Note, all functions are tacked on to the instance instead of the class prototype because of the odd way chess.js does objects. */
var chess = new Chess();


/* Utility Functions */
_.mixin({
	// same as _.range but returns the alphabetic equivalent
	alphaRange: function(start, stop) {
		var alpha = "abcdefghijklmnopqrstuvwxyz";
		return _.map(_.range(start, stop), function(i) { return alpha[i] });
	},
	// return a string with the first instance of the character replaced
	removeFirst: function(str, c) {
		var i = str.indexOf(c);
		return str.slice(0, i) + str.slice(i+1, str.length);
	},
	// a boolean of whether a character is upper case
	isUpperCase: function(c) {
		return c == c.toUpperCase();
	},
	tally: function(arr) {
		var r = {};
		_.each(arr, function(c) { 
			r[c] = r[c] ? r[c] + 1 : 1;
		});
		return r;
	},
});

/* END Utility Functions */

chess.symbols = {'w': 
				 {'k': '&#9812;', 
				  'q': '&#9813;',
				  'r': '&#9814;',
				  'b': '&#9815;',
				  'n': '&#9816;',
				  'p': '&#9817;',
				 },
				 'b':
				 {'k': '&#9818;',
				  'q': '&#9819;',
				  'r': '&#9820;',
				  'b': '&#9821;',
				  'n': '&#9822;',
				  'p': '&#9823;',
				 }
				}

chess.boardTemplate = "<table><% "
					+ "_.each(_.range(8, 0, -1), function(i) { "
					+     "%> <tr> <%"
					+     "_.each(_.alphaRange(0, 8), function(a) { "
					+         "var piece = chess.get(a+i); %>"
					+         "<td class='square <%= chess.square_color(a+i) %>' data-square='<%= a+i %>' > <%"
					+             "if (piece) { %> "
					+                 "<span class='piece' data-color='<%= piece.color %>' data-type='<%= piece.type %>' >"
					+                     "<%= chess.symbols[piece.color][piece.type] %>"
					+                 "</span> <% "
					+             "} %>"
					+         "</td><% "
					+     "}); "
					+     "%> </tr> <%"
					+ "}); %>"
					+ "</table>";
chess.renderBoard = function (node) {
	node = node || "#board";
	
    $(node).html(_.template(chess.boardTemplate));
	$('.piece').draggable({
		'cursor': 'hand',
	});

	$('.square').droppable({
		accept: '.piece',
		hoverClass: 'hover',
		drop: function(event, ui) {
			var piece = ui.draggable;
			var origional_square = $(piece).parent().data('square');
			chess.move({from: origional_square, to: $(this).data('square'), promotion: $('#promotion option:selected').val() });
			chess.render(node);
		},
	});
}

chess.render = function() {
    chess.renderBoard();
	$("#turn").html(chess.symbols[chess.turn()]['k']);
	$('#moves').html('<li>' + chess.pgn({newline_char: '</li><li>', 'max_width': 5}) + '</li>');
	var dead = chess.dead();
	$('#dead').html(
		'<li>' + _.reduce(_.map(['w', 'b'], function(color) {
			return _.reduce(dead[color], function(memo, piece) { 
				console.log('piece dead', memo, piece);
				return memo + " " + piece; }, "")
			
		}), function (m, c) { return m + c + '</li><li>' }, '')
					+ '</li>');

	if (chess.game_over()) {
		result = chess.turn() == 'b' ? 'White Wins!' : 'Black Wins!';
		if (chess.in_draw()) {
			result = "Draw";
		} else if (chess.in_stalemate()) {
			result = "Stalemate";
		} else if (chess.in_threefold_repetition()) {
			result = "Threefold Repetition";
		} else if (chess.insufficient_material()) {
			result = "Insufficient Material";
		}
		$("#turn").html(
			"<span class='option-title gameover'>Game Over - " + result + "</span>"
		);
	}

	if (chess.turn() == 'b' && $('#vs option:selected').val() == 'computer') {
		setTimeout(function() {
			var move = startAlphaBeta(chess, 1);
			chess.move(move);
			chess.render();
			}, 0);
	}
}


// Return the fen characters for the peices that are dead
chess.dead_fen = function() {
    var dead = 'rnbqkbnrppppppppPPPPPPPPRNBQKBNR';

	var pieces = fen_pieces(chess);
	_.each(_.toArray(pieces), function(piece) {
		dead = _.removeFirst(dead, piece);
	});
	return dead;
}

chess.dead = function() {
	dead = {'w': [], 'b': []};
	_.map(_.toArray(this.dead_fen()), function(piece) {
		var color = _.isUpperCase(piece) ? 'w' : 'b';
		dead[color].unshift(chess.symbols[color][piece.toLowerCase()]);
	});
	return dead;
}

