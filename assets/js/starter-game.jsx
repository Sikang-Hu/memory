import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root, channel) {
  ReactDOM.render(<Starter channel={channel}/>, root);
}

class Starter extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel
    this.state = {
      current: [],
      clicks: 0,
    };

    this.channel
    .join()
    .receive("ok", this.get_view.bind(this))
    .receive("error", resp => {console.log("Cannot join!", resp)});

    this.channel.on("refresh", this.get_view.bind(this));
  }

  get_view(view) {
    console.log(view);
    this.setState(view.game);
  }

  restart() {
    this.channel.push("restart", {})
      .receive("ok", this.get_view.bind(this));
  }

  get_clicks() {
    return this.state.clicks;
  }

  handler(i) {
    this.channel.push("guess", {click: i})
      .receive("ok", this.get_view.bind(this));
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
            cb={this.state.current}
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

  renderRow(board, row, columns) {
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
    <p>{params.root.get_clicks()}</p>
    </div>);
}

