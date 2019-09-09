import React, { Component } from 'react';

class Cell extends Component {
    render(){
        return(
			<div  className={'cell cell-'+this.props.cell} >
				<div onClick={this.props.handlePieceClick} data-row={this.props.rowIndex} data-cell={this.props.index} className="gamePiece"></div>
			</div>
		)
    }
}

export default Cell;