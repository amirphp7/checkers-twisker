import React, { Component } from  'react';

class Statistics extends Component {
    render(){
        return(
			<div  className="stats" >
				<div className="half">
					Black(Player):<br/>
					
					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/r/g) || []).length} Soldiers<br/>
					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/r\sk/g) || []).length} Kings
				</div>
				<div className="half" style={{color: '#e26b6b'}}>
					Red(AI):<br/>
					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/b/g) || []).length} Soldiers<br/>
					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/b\sk/g) || []).length} Kings
				</div>
			</div>
		)
    }
}

export default Statistics;