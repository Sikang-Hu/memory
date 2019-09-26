import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root) {
  ReactDOM.render(<Starter str={random_list()}/>, root);
}



function random_list() {
  let arr = Array.from("ABCDEFGH");
  arr = arr.concat(arr);
  return shuffle(arr);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
}

class Starter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tiles: this.props.str,
      clicked: []
    };
  }

  restart() {
    let init = _.extend(this.state, {
      clicked: [],
    });
    this.setState(init);
  }

  clicks() {
    return this.state.clicked.length;
  }

  completed () {
    let clk = this.state.clicked;
    let last =  clk.length % 2 == 0 ? clk.length : clk.length - 1;
    let result = [];
    for (let i = 0; i < last; i += 2) {
      if (this.state.tiles[clk[i]] == this.state.tiles[clk[i + 1]]) {
        result.push(this.state.tiles[clk[i]]);
      }
    }
    return result;
  }

  currentBoard() {
    let clk = this.state.clicked;
    let comp = this.completed();
    // let result = this.state.tiles.map((t) => {
    //   return comp.includes(t) ? t : " ";
    // });
    let result = Array.from("ABCDEFGHABCDEFGH");
    if (clk.length % 2 != 0) {
      result[clk.length - 1] = this.state.tiles[clk.length - 1];
    }
    return result;
  }

  handler(i) {
    let clk = this.state.clicked;
    let t = this.state.tiles;
    let comp = this.completed();
    if (comp.includes(t[i])) {
      return;
    }
    clk.push(i);
  }


  render() {
    return (
      <div>
        <div className="row">
          <div className="column">
            <h1>{["Memory Game"]}</h1>
          </div>
        </div>
        <div className="row">
          <div className="column column-50 column-offset-25">
            <Board root={this} 
            cb={this.currentBoard()}
            onClick={(i) => this.handler(i)}/>
          </div>
        </div> 
        <div className="row">
          <div className="column">
            <Score root={this} />
          </div>
          <div className="column">
            <p><button onClick={this.restart.bind(this)}>Restart</button></p>
          </div>
        </div> 
      </div>
    );
  }
}

class Board extends React.Component {
  renderTile(board, i){
    return (<Tile 
            key={i}
            value={board[i]} 
            onClick={() => this.props.onClick(i)}
          />);
  }

  renderRow(borad, row, columns) {
    console.log(board);
    let tiles = [];
    for (let i = 0; i < columns; i++) {
      tiles.push(this.renderTile(board, i + 4 * row));
    }
    return (
      <div className="row" key={"row-" + row}>
        {tiles}
      </div>
      );
  }

  render () {
    let cur = this.props.cb;
    console.log(this.props);
    let r = [];
    for (let i = 0; i < 4; i++) {
      r.push(this.renderRow(cur, i, 4));
    }
    return (
      <div className="board">
        {r}
      </div>
      );
  }
}

function Tile(params) {
  return (
    <button className="tile" onClick={params.onClick}>
      {params.value}
    </button>
    );
}

function Score(params) {
  return (<div>
    <p><strong>Clicks:</strong></p>
    <p>{params.root.clicks()}</p>
    </div>);
}

