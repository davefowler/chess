
var alpha = -999999999;
var beta  =  999999999;


/* Really dumb eval function:
 * 
 * f(p) = 200(K-K')
 *        + 9(Q-Q')
 *        + 5(R-R')
 *        + 3(B-B' + N-N')
 *        + 1(P-P')
 *        - 0.5(D-D' + S-S' + I-I')
 *        + 0.1(M-M') + ...
 *  
 * KQRBNP = number of kings, queens, rooks, bishops, knights and pawns
 * D,S,I = doubled, blocked and isolated pawns
 * M = Mobility (the number of legal moves)
 * 
 */

var RANK = {};

_.each({k: -200, q: -9, r: -5, b: -3, n: -3, p: -1}, function(val, key) {
	RANK[key] = val;
	RANK[key.toUpperCase()] = val * -1;
});


// score the chess game based on the above algorithm.
function score(chess) {
	var pieces = _.toArray(fen_pieces(chess));
	var tally = _.tally(pieces);
	var s = 0;
	_.each(tally, function(val, p) {
		s = s + val*RANK[p];		
	});
	return s;
}

function fen_pieces(chess) {
	return chess.fen().split(' ')[0].replace(/\//g, '').replace(/\d/g, '');
}

function alphaBeta(tchess,depth,alpha,beta) {
	best_score = -999999999;
	best_move = '';
	_.each(tchess.moves(), function(move) {
		var tempchess = new Chess(tchess.fen());
		tempchess.move(move);
		var move_score;
		if (depth == 0) {
			move_score = score(tempchess);
		} else {
			move_score = - alphaBeta(tempchess, depth-1, -beta, -alpha)
		}
		best_score = Math.max(move_score, best_score);
		best_move = move;
		if (best_score > alpha)  { alpha = best_score; }
		if ( alpha >= beta )   return alpha
	});	   
	return best_score, best_move;
}
