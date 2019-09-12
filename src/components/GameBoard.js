import React, { Component } from 'react';
import Row from './Row';
import Statistics from './Statistics';
import Popup from './Popup';


class GameBoard extends Component {
    state = {
        board: [
            ['-','b','-','b','-','b','-','b'],
            ['b','-','b','-','b','-','b','-'],
            ['-','b','-','b','-','b','-','b'],
            ['-','-','-','-','-','-','-','-'],
            ['-','-','-','-','-','-','-','-'],
            ['r','-','r','-','r','-','r','-'],
            ['-','r','-','r','-','r','-','r'],
            ['r','-','r','-','r','-','r','-']
        ],
        activePlayer: 'r',
        aiDepthCutoff: 3,
        count: 0,
        popShown: false
    }
    render() {
		return (
			<div className="container">
				<div className={'board '+this.state.activePlayer}>
					{
						this.state.board.map(function(row, index) {
							return (<Row rowArr={row} handlePieceClick={this.handlePieceClick.bind(this)} rowIndex={index} key={index} />)
						},this)
					}
				</div>
				<div className="clear"></div>
				<button onClick={this.reset}>Reset</button>
				<button onClick={this.aboutPopOpen}>About</button>
				<Statistics board={this.state.board}/>
				<Popup shown={this.state.popShown} close={this.aboutPopClose} copy="
					Application: Checkers AI Game. The AI is built out using a limited version of the minimax algorithm (see http://neverstopbuilding.com/minimax for a nice explanation of what that means), simply it means that the program forecasts futures, assumes you'll play as if you were doing the same, and picks the route that it thinks will result in the best for itself if you also play 'perfeclty', and I use that word loosely because this AI currently only looks 3 turns in to the future. It uses a point system to determine 'good' and 'bad' stuff that could happen, for example, if it can win in the next 3 turns, thats a 100 point outcome. If it will lose in the next 3 turns, thats worth -100 points, losing a king or killing an enemy king are worth -25 or 25 points respectively, and killing/losing regular pieces are worth +-10 points. Lastly, classifies making a new king of it's own as worth 15 points, so slightly better than killing 1 opponent. The bot looks through something like 1000-1500 possible futures before each move.
				"/>
			</div>
		);
    }

    aboutPopOpen = (e) => {
		this.setState({popShown: true});
    }
    
	aboutPopClose = (e) => {
		this.setState({popShown: false});
    }
    
	handlePieceClick = (e) => {
		var rowIndex = parseInt(e.target.attributes['data-row'].nodeValue);
		var cellIndex = parseInt(e.target.attributes['data-cell'].nodeValue);
		if (this.state.board[rowIndex][cellIndex].indexOf(this.state.activePlayer) > -1) {
			this.state.board = this.state.board.map(function(row){return row.map(function(cell){return cell.replace('a', '')});});
			this.state.board[rowIndex][cellIndex] = 'a'+this.state.board[rowIndex][cellIndex];
			this.highlightPossibleMoves(rowIndex, cellIndex);
		}
		else if(this.state.board[rowIndex][cellIndex].indexOf('h') > -1) {
			this.state.board = this.executeMove(rowIndex, cellIndex, this.state.board, this.state.activePlayer);
			this.setState(this.state);
			if (this.winDetection(this.state.board, this.state.activePlayer)) {
				console.log(this.state.activePlayer+ ' won the game!');
				if(this.state.activePlayer === 'r') {
					alert('Congratulations! you have killed all the enemy!');
					this.reset();
				}
				else {
					alert('Defeated! You lose all of your soldier!');
					this.reset();
				}
			}
			else {
				this.state.activePlayer = (this.state.activePlayer === 'r' ? 'b' : 'r');
				if (this.state.activePlayer === 'b') {
					setTimeout(function() {this.ai();}.bind(this), 50);
				}
			}
		}
		this.setState(this.state);
    }
    
	executeMove = (rowIndex, cellIndex, board, activePlayer) => {
		var activePiece;
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board[i].length; j++) {
				if (board[i][j].indexOf('a')>-1) {
					activePiece = board[i][j];
				}
			}
		}
		var deletions = board[rowIndex][cellIndex].match(/d\d\d/g);
		if (typeof deletions !== undefined && deletions !== null && deletions.length > 0) {
			for (var k = 0; k < deletions.length; k++) {
				var deleteCoords = deletions[k].replace('d', '').split('');
				board[deleteCoords[0]][deleteCoords[1]] = '-';
			}
		}
		board = board.map(function(row){return row.map(function(cell){return cell.replace(activePiece, '-')});});
		board = board.map(function(row){return row.map(function(cell){return cell.replace('h', '-').replace(/d\d\d/g, '').trim()});}); 
		board[rowIndex][cellIndex] = activePiece.replace('a', '');
		if ( (activePlayer === 'b' && rowIndex === 7) || (activePlayer === 'r' && rowIndex === 0) ) {
			board[rowIndex][cellIndex]+= ' k';
		}		
		return board;
    }
    
	highlightPossibleMoves = (rowIndex, cellIndex) => {
		this.state.board = this.state.board.map(function(row){return row.map(function(cell){return cell.replace('h', '-').replace(/d\d\d/g, '').trim()});}); 

		var possibleMoves = this.findAllPossibleMoves(rowIndex, cellIndex, this.state.board, this.state.activePlayer);

		for (var j = 0; j < possibleMoves.length; j++) {
			var buildHighlightTag = 'h ';
			for (var k = 0; k < possibleMoves[j].wouldDelete.length; k++) {
				buildHighlightTag += 'd'+String(possibleMoves[j].wouldDelete[k].targetRow) + String(possibleMoves[j].wouldDelete[k].targetCell)+' ';
			}
			this.state.board[possibleMoves[j].targetRow][possibleMoves[j].targetCell] = buildHighlightTag;
		}

		this.setState(this.state);
    }
    
	findAllPossibleMoves = (rowIndex, cellIndex, board, activePlayer) => {
		var possibleMoves = [];
		var directionOfMotion = [];
		var leftOrRight = [1,-1];
		var isKing = board[rowIndex][cellIndex].indexOf('k') > -1;
		if (activePlayer === 'b') {
			directionOfMotion.push(1);
		}
		else {
			directionOfMotion.push(-1);
		}

		if (isKing) {
			directionOfMotion.push(directionOfMotion[0]*-1);
		}

		for (var j = 0; j < directionOfMotion.length; j++) {
			for (var i = 0; i < leftOrRight.length; i++) {			
				if (
					typeof board[rowIndex+directionOfMotion[j]] !== 'undefined' &&
					typeof board[rowIndex+directionOfMotion[j]][cellIndex + leftOrRight[i]] !== 'undefined' &&
					board[rowIndex+directionOfMotion[j]][cellIndex + leftOrRight[i]] === '-'
				){
					if (possibleMoves.map(function(move){return String(move.targetRow)+String(move.targetCell);}).indexOf(String(rowIndex+directionOfMotion[j])+String(cellIndex+leftOrRight[i])) < 0) {
						possibleMoves.push({targetRow: rowIndex+directionOfMotion[j], targetCell: cellIndex+leftOrRight[i], wouldDelete:[]});
					}
				}
			}
		}

		var jumps = this.findAllJumps(rowIndex, cellIndex, board, directionOfMotion[0], [], [], isKing, activePlayer);
		
		for (var k = 0; k < jumps.length; k++) {
			possibleMoves.push(jumps[k]);
		}
		return possibleMoves;
    }
    
	findAllJumps = (sourceRowIndex, sourceCellIndex, board, directionOfMotion, possibleJumps, wouldDelete, isKing, activePlayer) => {
		var thisIterationDidSomething = false;
		var directions = [directionOfMotion];
		var leftOrRight = [1, -1];
		if (isKing) {
			directions.push(directions[0]*-1);
		}
		for (var k = 0; k < directions.length; k++) {
			for (var l = 0; l < leftOrRight.length; l++) {
				if (
					typeof board[sourceRowIndex+directions[k]] !== 'undefined' &&
					typeof board[sourceRowIndex+directions[k]][sourceCellIndex+leftOrRight[l]] !== 'undefined' &&
					typeof board[sourceRowIndex+(directions[k]*2)] !== 'undefined' &&
					typeof board[sourceRowIndex+(directions[k]*2)][sourceCellIndex+(leftOrRight[l]*2)] !== 'undefined' &&
					board[sourceRowIndex+directions[k]][sourceCellIndex+leftOrRight[l]].indexOf((activePlayer === 'r' ? 'b' : 'r')) > -1 &&
					board[sourceRowIndex+(directions[k]*2)][sourceCellIndex+(leftOrRight[l]*2)] === '-'
				){
					if (possibleJumps.map(function(move){return String(move.targetRow)+String(move.targetCell);}).indexOf(String(sourceRowIndex+(directions[k]*2))+String(sourceCellIndex+(leftOrRight[l]*2))) < 0) {
						var tempJumpObject = {
							targetRow: sourceRowIndex+(directions[k]*2),
							targetCell: sourceCellIndex+(leftOrRight[l]*2),
							wouldDelete:[
								{
									targetRow:sourceRowIndex+directions[k],
									targetCell:sourceCellIndex+leftOrRight[l]
								}
							]
						};
						for (var i = 0; i < wouldDelete.length; i++) {
							tempJumpObject.wouldDelete.push(wouldDelete[i]);
						}
						possibleJumps.push(tempJumpObject);
						thisIterationDidSomething = true;
					}
				}
			}
		}
		
		if(thisIterationDidSomething) {
			for (var m = 0; m < possibleJumps.length; m++) {
				var coords = [possibleJumps[m].targetRow, possibleJumps[m].targetCell];
				var children = this.findAllJumps(coords[0], coords[1], board, directionOfMotion, possibleJumps, possibleJumps[m].wouldDelete, isKing, activePlayer);
				for (var n = 0; n < children.length; n++) {
					if (possibleJumps.indexOf(children[n]) < 0) {
						possibleJumps.push(children[n]);
					}
				}
			}
		}
		return possibleJumps;
    }
    
	reset = () => {
		this.setState({
			board: [
				['-','b','-','b','-','b','-','b'],
				['b','-','b','-','b','-','b','-'],
				['-','b','-','b','-','b','-','b'],
				['-','-','-','-','-','-','-','-'],
                ['-','-','-','-','-','-','-','-'],
                ['r','-','r','-','r','-','r','-'],
				['-','r','-','r','-','r','-','r'],
				['r','-','r','-','r','-','r','-']
			],
			activePlayer: 'r'
		});
    }
    
	winDetection = (board, activePlayer) => {
		var enemyPlayer = (activePlayer === 'r' ? 'b' : 'r');
		var result = true;
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board[i].length; j++) {
				if (board[i][j].indexOf(enemyPlayer) > -1) {
					result = false;
				}
			}
		}
		return result;
    }
    
	cloneBoard = (board) => {
        var output = [];
        for (var i = 0; i < board.length; i++) output.push(board[i].slice(0));
        return output;
    }

	ai = () => {
		this.count = 0;
		console.time('decisionTree');
		var decisionTree = this.aiBranch(this.state.board, this.state.activePlayer, 1);
		console.timeEnd('decisionTree');
		console.log(this.count);
		if (decisionTree.length > 0) {
			console.log(decisionTree[0]);
			setTimeout(function() {
				this.handlePieceClick({
					target:{
						attributes:{
							'data-row':{
								nodeValue:decisionTree[0].piece.targetRow
							},
							'data-cell':{
								nodeValue:decisionTree[0].piece.targetCell
							}
						}
					}
				});

				setTimeout(function() {
					this.handlePieceClick({
						target:{
							attributes:{
								'data-row':{
									nodeValue:decisionTree[0].move.targetRow
								},
								'data-cell':{
									nodeValue:decisionTree[0].move.targetCell
								}
							}
						}
					});
				}.bind(this), 1000);
			}.bind(this), 750);
		}
		else {
			alert('Congratulations! opponent no moves, you win!');
			this.reset();
		}
    }
    
	aiBranch = (hypotheticalBoard, activePlayer, depth) => {
		this.count++;
		var output = [];
		for (var i = 0; i < hypotheticalBoard.length; i++) {
			for (var j = 0; j < hypotheticalBoard[i].length; j++) {
				if (hypotheticalBoard[i][j].indexOf(activePlayer) > -1) {
					var possibleMoves = this.findAllPossibleMoves(i, j, hypotheticalBoard, activePlayer);
					for (var k = 0; k < possibleMoves.length; k++) {
						var tempBoard = this.cloneBoard(hypotheticalBoard);
                    	tempBoard[i][j] = 'a'+tempBoard[i][j];

						var buildHighlightTag = 'h ';
						for (var m = 0; m < possibleMoves[k].wouldDelete.length; m++) {
							buildHighlightTag += 'd'+String(possibleMoves[k].wouldDelete[m].targetRow) + String(possibleMoves[k].wouldDelete[m].targetCell)+' ';
						}
						tempBoard[possibleMoves[k].targetRow][possibleMoves[k].targetCell] = buildHighlightTag;

						var buildingObject = {
							piece: {targetRow: i, targetCell: j},
							move:possibleMoves[k],
							board:this.executeMove(possibleMoves[k].targetRow, possibleMoves[k].targetCell, tempBoard, activePlayer),
							terminal: null,
							children:[],
							score:0,
							activePlayer: activePlayer,
							depth: depth,
						}
						buildingObject.terminal = this.winDetection(buildingObject.board, activePlayer);						

						if (buildingObject.terminal) {
							if (activePlayer === this.state.activePlayer) {
								buildingObject.score = 100-depth;
							}
							else {
								buildingObject.score = -100-depth;
							}
						}
						else if(depth > this.state.aiDepthCutoff) {
							buildingObject.score = 0;
						}
						else {	
							buildingObject.children = this.aiBranch(buildingObject.board, (activePlayer === 'r' ? 'b' : 'r'), depth+1);
							var scoreHolder = [];

					        for (var l = 0; l < buildingObject.children.length; l++) {
					        	if (typeof buildingObject.children[l].score !== 'undefined'){
					        		scoreHolder.push(buildingObject.children[l].score);
					        	}
					        }

					        scoreHolder.sort(function(a,b){ if (a > b) return -1; if (a < b) return 1; return 0; });

					        if (scoreHolder.length > 0) {
						        if (activePlayer === this.state.activePlayer) {
									buildingObject.score = scoreHolder[scoreHolder.length-1];
								}
								else {
									buildingObject.score = scoreHolder[0];
								}
							}
							else {
								if (activePlayer === this.state.activePlayer) {
									buildingObject.score = 100-depth;
								}
								else {
									buildingObject.score = -100-depth;
								}
							}
						}
						if (activePlayer === this.state.activePlayer) {
							for (var n = 0; n < buildingObject.move.wouldDelete.length; n++) {
								if (hypotheticalBoard[buildingObject.move.wouldDelete[n].targetRow][buildingObject.move.wouldDelete[n].targetCell].indexOf('k') > -1) {
									buildingObject.score+=(25-depth);
								}
								else {
									buildingObject.score+=(10-depth);
								}
							}
							if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(buildingObject.board).match(/k/g) || []).length) {
								buildingObject.score+=(15-depth);
							}
						}
						else {
							for (var x = 0; x < buildingObject.move.wouldDelete.length; x++) {
								if (hypotheticalBoard[buildingObject.move.wouldDelete[x].targetRow][buildingObject.move.wouldDelete[x].targetCell].indexOf('k') > -1) {
									buildingObject.score-=(25-depth);
								}
								else {
									buildingObject.score-=(10-depth);
								}
							}							
							if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(buildingObject.board).match(/k/g) || []).length) {
								buildingObject.score-=(15-depth);
							}
						}
						buildingObject.score+=buildingObject.move.wouldDelete.length;
						output.push(buildingObject);
					}
				}
			}
		}
		
		output = output.sort(function(a,b){ if (a.score > b.score) return -1; if (a.score < b.score) return 1; return 0; });
		return output;
	}
}

export default GameBoard;