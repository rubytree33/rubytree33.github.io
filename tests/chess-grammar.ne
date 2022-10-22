@{%
const PieceType = { Pawn: 0 }
const GameResult = { WhiteWins: 0, BlackWins: 1, Stalemate: 2 }
const PieceColor = { White: 0, Black: 1 }
const parseFile = f => f.codePointAt(0) - 'a'.codePointAt(0)
const parseRank = r => Number(r) - 1
const parseType = p => p ? (1 + Array.from('NBRQK').findIndex(x=>x===p)) ?? null : 0
%}
main -> turns  {% id %}
split[x,y] -> x (y x):* {% id %}
turns -> (turn _):* lastTurn (_ gameResult):?
  {% ([ts,t,gr]) => ({ moves: [].concat(...ts.map(x=>x[0]),t), ...gr?.[1] }) %}
turn -> turnNumber _ move _ move
  {% ([_n,_,m,_2,m2]) => [
    { color: PieceColor.White, ...m },
    { color: PieceColor.Black, ...m2 }
  ] %}
lastTurn -> turnNumber _ move (_ move):?
  {% ([_n,_,m,__m2]) => [
	{ color: PieceColor.White, ...m },
	...(__m2 ? [{ color: PieceColor.Black, ...__m2[1] }] : [])
  ] %}
turnNumber -> [0-9]:+ "."  {% ([n,_]) => Number(n) %}
move -> type from capture to promotesTo moveNote  {% d => Object.assign(...d) %}
from -> file:? rank:?  {% ([file,rank]) => ({ from: { ...file??{}, ...rank??{} }}) %}
type -> [NBRQK]:?      {% ([t]) => ({ type: parseType(t) }) %}
to -> file rank        {% ([file,rank]) => ({ to: { ...file, ...rank } }) %}
file -> [a-h]          {% ([f]) => ({ file: parseFile(f) }) %}
rank -> [1-8]          {% ([r]) => ({ rank: parseRank(r) }) %}
capture -> "x":?       {% ([x]) => ({ capture: Boolean(x) }) %}
moveNote -> [+#]:?     {% ([moveNote]) => ({ moveNote }) %}
promotesTo -> ("=" [NBRQ]):?  {% ([t]) => (t && { promotesTo: parseType(t[1]) }) %}
gameResult -> ("1-0" | "0-1" | "1/2-1/2")  {% ([gr]) => ({ result: [GameResult.WhiteWins, GameResult.BlackWins, GameResult.Stalemate][Number(gr[0][2])] }) %}
_ -> [\s]:+  {% null %}