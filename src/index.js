import _ from 'lodash';
import React from 'react';  // just like in Node, any package in 'node-modules' can be imported using this syntax
import ReactDOM from 'react-dom';
	

class App extends React.Component {	

	constructor (props) {
		super(props);	

		this.state = {
			masterArray: [],
			historical: [],
			numberOfRows: 20,
			numberOfColumns: 20,
			randomToStart: 40,
			inputRowValue: 20,
			inputColValue: 20,
			special: [],
			specialLeft: [],
			specialRight: [],
			width:0,
			generations: 0
		};

		this.handleRowChange = this.handleRowChange.bind(this);
		this.handleColChange = this.handleColChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentWillMount () {
		this.buildArray(this.state.numberOfRows, this.state.numberOfColumns);
	}

	componentDidMount() {
		setTimeout ( () => {
			this.autoMove();
		},1000);
	}

	componentWillUnmount () {
	// 	// use intervalId from the state to clear the intervalId
		clearInterval(this.state.intervalId);
	}

	handleRowChange(event) {
		// this.setState({inputRowValue: Number(event.target.value)});
		this.setState({
			numberOfRows: Number(event.target.value)
		})
		let rebuild = _.debounce( () => {this.buildArray(this.state.numberOfRows, this.state.numberOfColumns)}, 300);
		rebuild();
	}

	handleColChange(event) {
		// this.setState({inputColValue: Number(event.target.value)});
		this.setState({
			numberOfColumns: Number(event.target.value)
		})
		let rebuild = _.debounce( () => {this.buildArray(this.state.numberOfRows, this.state.numberOfColumns)}, 300);
		rebuild();
	}

	handleSubmit(event) {
		this.setState({
			numberOfRows: this.state.inputRowValue,
			numberOfColumns: this.state.inputColValue
		})
		this.buildArray(this.state.inputRowValue, this.state.inputColValue);
		event.preventDefault();
	}

	// create a list of 'special' squares 
	// eg. the left-most and right-most cols
	createSpecial (rows, cols) {
		let special = []
		let specialLeft = [];
		let specialRight = [];

		// build the reference array of 'special' squares
		for (let i = 0; i < rows; i++) {
			specialLeft.push( i * cols);
			specialRight.push( (i * cols) + (cols - 1));
		}
		
		special = specialLeft.concat(specialRight);

		// set the width of the container
		// 20 is the width of a square and 2 is for the border around the container
		let width = (cols * 20) + 2;

		this.setState( {
			special: special,
			specialLeft: specialLeft,
			specialRight: specialRight,
			width: width
		});
	}	
	
	buildArray(rows, cols, randomNumber) {	
		let array = [];
		let total = rows * cols;
		let random = (rows * cols * 0.2); //create random number of squares equal to 10% of the total squares

		// for clearing the screen, the customClear fn passes the buildArray a third argumument equal to Zero
		if (randomNumber === 0) {
			random = 0;
		}

		// if there is an automated game running, cancel it
		clearInterval(this.state.intervalId);

		// build out the initial empty array
		for (let i = 0; i < total; i++ ) {			
			array.push(false);
		}
		// create random number of squares equal to 10% of the total squares
		// use it to randomly assign 'true' to a fixed number of squares
		for (let j = 0; j < random; j++) {
			let index = Math.random() * total;
			index = Math.floor(index);
			array[index] = true;
		}

		this.createSpecial(rows, cols);

		let history = [];
		history.push(array);

		this.setState( {
			masterArray: array,
			historical: history,
			generations: 0
		});
	}

	nextMove (masterArray, cols) {
		// keep track of the generations
		let generationCount = this.state.generations;

		var modified = masterArray.map( (val, index) => {

			// count the number of surrounding cells
			// that are alive
			let count = 0;
			let result = [];

			// check if index is NOT one of special indices
			if ( this.state.special.indexOf(index) === -1 ) {
				if (masterArray[index - (cols + 1)]) {
					count++;
				}
				if (masterArray[index - cols]) {
					count++;
				}
				if (masterArray[index - (cols - 1)]) {
					count++;
				}
				if (masterArray[index -1]) {
					count++;
				}
				if (masterArray[index + 1]) {
					count++;
				}
				if (masterArray[index + (cols - 1)]) {
					count++;
				}	
				if (masterArray[index + cols]) {
					count++;
				}
				if (masterArray[index + (cols + 1)]) {
					count++;
				}	
			}

			// a specialLeft array member
			else if ( this.state.specialLeft.indexOf(index) > -1 ) {
				if (masterArray[index - cols]) {
					count++;
				}
				if (masterArray[index - (cols - 1)]) {
					count++;
				}
				if (masterArray[index + 1]) {
					count++;
				}
				if (masterArray[index + cols]) {
					count++;
				}
				if (masterArray[index + (cols + 1)]) {
					count++;
				}	
			}

			// a specialRight array member
			else if ( this.state.specialRight.indexOf(index) > -1 ) {
				if (masterArray[index - (cols + 1)]) {
					count++;
				}
				if (masterArray[index - cols]) {
					count++;
				}
				if (masterArray[index - 1]) {
					count++;
				}
				if (masterArray[index + (cols - 1)]) {
					count++;
				}
				if (masterArray[index + cols]) {
					count++;
				}
			}

			// if current square is alive
			// check if it stays alive
			if (val == true) {
				if (count === 2 || count === 3) {
					return true;
				}
				else {
					return false;
				}
			}
			// if current square is dead
			// check if it comes alive
			if (val === false) {
				if (count === 3) {
					return true;
				}
				else {
					return false; 
				}
			}
		})

		// check if this move is the same as the last
		// if YES then stop the automated sequence
		// otherwise, increment the generations count
		if ( _.isEqual(modified, masterArray)) {
			// console.log('modified same as masterArray');
			clearInterval(this.state.intervalId);
		}
		else {		
			generationCount++;

			let history = this.state.historical;
			history[generationCount] = modified;

			this.setState( {
				masterArray: modified,
				historical: history,
				generations: generationCount
			});
		}
	}

	previousMove () {
		if ( this.state.generations > 0) {
			this.setState({
				masterArray: this.state.historical[this.state.generations-1],
				generations: this.state.generations -1
			})
		}
	}

	autoMove() {
		var intervalId = setInterval( () => {
			this.nextMove(
				this.state.masterArray, 
				this.state.numberOfColumns);
		},200);

		this.setState({
			intervalId: intervalId
		});
	}

	customClear() {
		this.buildArray(this.state.numberOfRows, this.state.numberOfColumns, 0);
		this.setState({
			generations: 0
		})
	}

	// CREATE your own pattern
	selectSquare(index) {
		let modified = this.state.masterArray;

		// add or remove squares every time you click
		if (modified[index]) {
			modified[index] = false;
		}
		else {
			modified[index] = true;
		}		
		this.setState({
			masterArray: modified
		})
	}

	// set localStorage
	setItem (key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	// a 'preset' configuration called 'gosper's gun'
	// using localStorage - for future 'Save' functionality
	runPreset () {
		clearInterval(this.state.intervalId);

		// create the arrays that hold all 'special' squares
		this.createSpecial(20, 40);

		if ( ! localStorage['preset']) {

			let preset =  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,true,false,false,false,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,false,false,false,false,true,false,false,false,false,false,true,false,false,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,false,true,false,false,false,true,false,true,true,false,false,false,false,true,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
			
			// and store array in local storage
			this.setItem('preset', preset);
		}	

		let history = [];
		history.push(JSON.parse(localStorage["preset"]));

		this.setState ({
			masterArray: JSON.parse(localStorage["preset"]),
			historical: history,
			numberOfRows: 20,
			numberOfColumns: 40,
			generations: 0	
		})	
	}	


	renderList() {
		return this.state.masterArray.map( (val, index) => { 
			// if current value in map is truthy
			if (val) { 
				return (
					<li className="flex-item occupied" 
						onClick	={ () => {this.selectSquare(index)} } 
						key={index}></li>    
				);		
			}
			else {
				return (
					<li className="flex-item unoccupied" 
						onClick	={ () => {this.selectSquare(index)} }
						key={index}></li>    
				);			
			}
		})
	}	

	render() {
		return (
			<div>
				<div className="flex-container">
					<h3 className="left">Game Of Life</h3>
				</div>	
				<div className="row header" style={{width: 400}}>
					<div className="col-xs-4">
						<div className="input-group input-group-sm">
							<span className="input-group-addon" id="sizing-addon3">Rows</span>
							<input type="text" className="form-control inputctrl" value={this.state.numberOfRows} onChange={this.handleRowChange} aria-describedby="sizing-addon3" />
						</div>
					</div>
					<div className="col-xs-4">
						<div className="input-group input-group-sm">
							<span className="input-group-addon" id="sizing-addon3">Cols</span>
							<input type="text" className="form-control inputctrl" value={this.state.numberOfColumns} onChange={this.handleColChange} aria-describedby="sizing-addon3" />
						</div>
					</div>
					<div className="col-xs-4 generations">
						<p className="right">Generations: {this.state.generations}</p>	
					</div>
				</div>	
				<ul className="flex-container" style={{width: this.state.width}} >
					{this.renderList()}
				</ul>	

				<div className="flex-container" style={{width: this.state.width}}>
					<div className="btn-toolbar" role="toolbar" aria-label="...">
						<div className="btn-group left" role="group"  aria-label="...">
							<a className="btn btn-default" href="#" data-toggle="tooltip" title="Back one Move">
								<i className="fa fa-arrow-left fa-lg" aria-hidden="true" onClick= { () => { this.previousMove() } }></i>
							</a>
							<a className="btn btn-default" href="#" data-toggle="tooltip" title="Pause/Stop">
								<i className="fa fa-pause fa-lg" aria-hidden="true" onClick= { () => { clearInterval(this.state.intervalId) } } ></i>
							</a>
							<a className="btn btn-default" href="#" data-toggle="tooltip" title="Auto Play">
								<i className="fa fa-play fa-lg" aria-hidden="true" onClick= { () => { this.autoMove() } }></i>
							</a>
							<a className="btn btn-default" href="#" data-toggle="tooltip" title="Next Move">
								<i className="fa fa-arrow-right fa-lg" aria-hidden="true" onClick= { () => { this.nextMove(this.state.masterArray, this.state.numberOfColumns) } }></i>
							</a>
						</div>
						<div className="btn-group" role="group"  aria-label="...">
							<a className="btn btn-default" href="#" data-toggle="tooltip" title="Load preset Config - called Gospers Gun">
								<i className="fa fa-star fa-lg" aria-hidden="true" onClick= { () => { this.runPreset() } }></i>
							</a>	
							<a className="btn btn-default" href="#" data-toggle="tooltip" title="Start Over">
								<i className="fa fa-refresh fa-lg" aria-hidden="true" onClick= { () => { this.buildArray(this.state.numberOfRows, this.state.numberOfColumns) } }></i>
							</a>						
							<a className="btn btn-default" href="#" data-toggle="tooltip" title="Clear Screen - draw your own pattern!">
								<i className="fa fa-eraser fa-lg" aria-hidden="true" onClick= { () => { this.customClear() } }></i>
							</a>
						</div>						
					</div>		
				</div>	
				<div className="header">
					<h3>Rules</h3>
					<p>Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:</p>
					<ol>
						<li>Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.</li>
						<li>Any live cell with two or three live neighbours lives on to the next generation.</li>
						<li>Any live cell with more than three live neighbours dies, as if by overpopulation.</li>
						<li>Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.</li>
					</ol>
					<p>The initial pattern constitutes the seed of the system. The first generation is created by applying the above rules simultaneously to every cell in the seed—births and deaths occur simultaneously, and the discrete moment at which this happens is sometimes called a tick (in other words, each generation is a pure function of the preceding one). The rules continue to be applied repeatedly to create further generations.</p>
				</div>			 
			</div>
		);
	}
};

ReactDOM.render(<App />, document.getElementById("container"));


// const Items = (props) => {
// 	const squares = props.boardArray.map( (val, index) => { 
// 		// if current value in map is truthy
// 		if (val) { 
// 			return (
// 				<li className="flex-item occupied" onclick={ () => {props.selectSquare(index)} } key={index}></li>    
// 			);		
// 		}
// 		else {
// 			return (
// 				<li className="flex-item unoccupied" key={index}></li>    
// 			);			
// 		}
// 	});

// 	var widthString = props.width + 'px';

// 	return (
// 		<div>
// 			<ul className="flex-container" style={{width: widthString}}	>
// 				{squares}
// 			</ul>	
// 		</div>
// 	);
// };

// const Board = (props) => {	
// 	return (
// 		<div>
// 			<Items 
// 				boardArray = {props.boardArray}
// 				inputRowValue = {props.inputRowValue}
// 				inputColValue = {props.inputColValue}
// 				handleRowChange = {props.handleRowChange}
// 				handleColChange = {props.handleColChange}
// 				handleSubmit = {props.handleSubmit}
// 				intervalId = {props.intervalId}
// 				autoMove = {props.autoMove}
// 				nextMove = {props.nextMove}
// 				build = {props.build}
// 				customClear = {props.customClear}
// 				selectSquare = {props.selectSquare}
// 				width = {props.width} 
// 			/> 
// 			<div>
// 				<h4 className="heading">Automated: </h4>
// 				<button className="btnctrl" onClick= { () => { props.autoMove() } } >
// 					Start
// 				</button>
// 				<button className="btnctrl" onClick= { () => { clearInterval(props.intervalId) } } >
// 					Stop
// 				</button>
// 				<button className="btnctrl" onClick= { () => { props.build() } } >
// 					Refresh
// 				</button>
// 				<h4 className="heading">Manual</h4>	
// 				<button className="btnctrl" onClick= { () => { props.nextMove() } } >
// 					Next
// 				</button>			
// 				<button className="btnctrl" onClick= { () => { props.customClear() } } >
// 					Clear
// 				</button>				
// 			</div>
// 			<div className="form-flex-container">
// 				<form onSubmit={props.handleSubmit}>
// 					<input className="inputctrl"  type="text" value={props.inputRowValue} onChange={props.handleRowChange} /> Rows <br/>
// 					<input className="inputctrl"  type="text" value={props.inputColValue} onChange={props.handleColChange}/> Columns <br/>
// 					<input className="submitctrl" type="submit" value="Submit" />
// 				</form>
//  			</div>
// 		</div>			
// 	);
// };

