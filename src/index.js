import React from 'react';
import ReactDOM from 'react-dom/client';
import { isCompositeComponent } from 'react-dom/test-utils';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    renderBoard(rows, squares) {
        let count = -1;
        const boardRows = Array(rows).fill(null); 
        const squarePerRow = Array(squares).fill(null);
        const board = boardRows.map(() => {
            return (
                <div className="board-row">
                    {squarePerRow.map(() => {
                        count++;
                        return this.renderSquare(count);
                    })}
                </div>
            );
        })

        return board
    }

    render() {
        return (
            <div>
                {this.renderBoard(3, 3)}
            </div>
        );
    }
}

function SortBtn(props) {
    return (
        <button onClick={() => props.sort()}>
            Sort {(props.isAscending) ? 'Ascendingly' : 'Descendingly'}
        </button>
    )
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            xIsNext: true,
            stepNumber: 0,
            isAscending : true
        }
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        })
    }

    // Marks the selected square and then records it as a new history.
    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        // do nothing if there's a winner OR the selected square
        // was already marked.
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    sort() {
        this.setState({ isAscending : !this.state.isAscending});
    }

    render() {
        const history = this.state.history
        const coords = getCoords(history, 3, 3);
        const current = history[this.state.stepNumber]
        const winner = calculateWinner(current.squares)

        let status

        if (winner)
            status = 'Winner: ' + winner
        else
            status = 'Next player: ' + (this.state.xIsNext) ? 'X' : 'O'

        const moves = history.map((step, move) => {
            let desc;

            if (!move) {
                let text = 'Go to game start';
                desc = (move === this.state.stepNumber) ? <b>{text}</b> : text;
            } else {
                let text = 'Go to move #' + move + ' step coord: ' + coords[move - 1];
                // -1 because move=0 will be skipped because history[0] has initially an array of nulls,
                // so we go to move=1 having an array with an input now in which this means that coords has now
                // value but in the index 0.
                desc = (move === this.state.stepNumber) ? <b>{text}</b> : text;
            }

            return (
                <li key={move}>
                    <button
                        onClick={() => this.jumpTo(move)}
                    >
                        {desc}
                    </button>
                </li>
            )
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <SortBtn 
                        sort={() => this.sort()}
                        isAscending={this.state.isAscending}
                    />
                    <ol>{(this.state.isAscending) ? moves : moves.reverse()}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

function getCoords(history, rows, squaresPerRow) {
    if (history.length === 0) {
        return [];
    }

    const coords = [];
    for (let i=1; i<=rows; i++) {
        for (let j=1; j<=squaresPerRow; j++) {
            coords.push([j, i]);
        }
    }

    const existingCoords = [];

    history.forEach((step) => {
        step.squares.forEach((square, index) => {
            const coord = coords[index];
            const coordExist = existingCoords.find(value => value === coord);

            if (square != null && coordExist === undefined) {
                existingCoords.push(coords[index]);
            }
        })
    });

    return existingCoords;
}