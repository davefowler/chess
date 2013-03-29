
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
	var turn = -1;
	if (chess.turn() == 'b')
	{
		turn = 1;//white just moved, evaluate from white's perspective
	}
	_.each(tally, function(val, p) {
		s = s + val*RANK[p];		
	});
	if (chess.in_checkmate()){
		return 9998;//last player to make move won
	}
	return s * turn;
}

function fen_pieces(chess) {
	return chess.fen().split(' ')[0].replace(/\//g, '').replace(/\d/g, '');
}
function startAlphaBeta(tchess, depth)
{
	var best_score = -9999;
	var best_move = '';
	var moves = tchess.moves();
	for (var index = 0; index < moves.length; index++)
	{
		var tempchess = new Chess(tchess.fen());
		tempchess.move(moves[index]);
		var move_score;
		if (depth == 0)
		{
			move_score = score(tempchess);
		}
		else {
			move_score = -alphaBeta(tempchess, depth-1);
		}
		if (move_score > best_score){
			best_score = move_score;
			best_move = moves[index];
		}
	}
	return best_move;
}
function alphaBeta(tchess,depth) 
{
	var best_score = -9999;
	var moves = tchess.moves();
	for (var index = 0; index < moves.length; index++)
	{
		var tempchess = new Chess(tchess.fen());
		tempchess.move(moves[index]);
		var move_score;
		if (depth == 0)
		{
			move_score = score(tempchess);
		}
		else {
			move_score = -alphaBeta(tempchess, depth-1);
		}
		if (move_score > best_score){
			best_score = move_score;
		}
	}
	return best_score;
}
