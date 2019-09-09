import React, { Component } from 'react';
import Cell from './Cell';

class Row extends Component {
    render(){
        return (
			<div className="row">
				{
					this.props.rowArr.map(function(cell, index) {
						return (
							<Cell rowIndex={this.props.rowIndex} index={index} cell={cell} handlePieceClick={this.props.handlePieceClick} />
						)
					}, this)
				}
			</div>
		)
    }
}

export default Row;