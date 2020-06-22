import * as React from "react";
import { Component } from "react";
import { Container, Col, Row, Button } from "react-bootstrap";
import "../cssfiles/node.css";
import "tachyons";
import $ from "jquery";
import { totalmem } from "os";

//Global variables
let chars: string[];
let temp: singleNode[] = [];
let pause: number = 0;
let escape: boolean = false;
let start: boolean = false;
let wpm: number = 0;
let times: any;
let mistakesTemp: singleNode[] = [];
let countOfMistakes: mistakeCount[] = [];

export interface NodeProps {
  text: string;
}

export interface NodeState {
  allNodes: singleNode[];
  rawArray: String[];
  currentLetter: String;
  index: number;
  wordsPerMin: number;
  timerIsOn: boolean;
  timerTime: number;
  accuracyScore: number;
  totalCharTyped: number;
}

interface singleNode {
  letter: String;
  currentColor: number;
}

interface mistakeCount {
  letterMistake: String;
  countMistake: number;
}

class Node extends Component<NodeProps, NodeState> {
  state: NodeState = {
    allNodes: temp,
    rawArray: [],
    currentLetter: "",
    index: 0,
    wordsPerMin: 0,
    timerIsOn: false,
    accuracyScore: 100,
    timerTime: 0,
    totalCharTyped: 0,
  };

  changeColor = () => {
    var cell = this.state.allNodes.map((each, i) => {
      if (each.currentColor === 1) {
        if (i === this.state.index) {
          if (each.letter === " ") {
            return (
              <Col className="Error1 bg-black pa2 shadow-1" md="auto" key={i}>
                {each.letter}
              </Col>
            );
          } else {
            return (
              <Col className="Error1 bg-black pa1 shadow-1" md="auto" key={i}>
                {each.letter}
              </Col>
            );
          }
        } else {
          if (each.letter === " ") {
            return (
              <Col className="Error pa2 bb" md="auto" key={i}>
                {each.letter}
              </Col>
            );
          } else {
            return (
              <Col className="Error pa1 bb" md="auto" key={i}>
                {each.letter}
              </Col>
            );
          }
        }
      } else if (i === this.state.index) {
        if (each.letter === " ") {
          return (
            <Col className="Coll1 bg-black pa2 shadow-1" md="auto" key={i}>
              {each.letter}
            </Col>
          );
        } else {
          return (
            <Col className="Coll1 bg-black pa1 shadow-1" md="auto" key={i}>
              {each.letter}
            </Col>
          );
        }
      } else {
        if (each.letter === " ") {
          return (
            <Col className="Coll bg-lightest-blue pa2 bb" md="auto" key={i}>
              {each.letter}
            </Col>
          );
        } else {
          return (
            <Col className="Coll bg-lightest-blue pa1 bb" md="auto" key={i}>
              {each.letter}
            </Col>
          );
        }
      }
    });
    return cell;
  };

  gettingKeyPressed = (e: any) => {
    if (e.which === 27) {
      //If escape is hit, It will enable the start button again and set espace variable to true
      $(".startButton").prop("disabled", false);
      this.setState({ timerIsOn: false });
      clearInterval(times);
      escape = true;
    }
    if (escape === false && start === true) {
      if (e.keyCode === 32 && e.target === document.body) {
        //Prevents page from scrolling down with spacebar
        e.preventDefault();
      }
      const { index } = this.state;
      this.setState({ currentLetter: e.key }); //setting the current typed key value
      if (this.state.index < this.state.allNodes.length) {
        if (this.state.currentLetter !== "Shift") {
          this.setState({ totalCharTyped: this.state.totalCharTyped + 1 });
          if (
            this.state.currentLetter ===
            this.state.allNodes[this.state.index].letter
          ) {
            //If the current letter typed matches the proper index in the array, it will increment the index (cursor)
            this.setState({ index: index + 1 });
          } else {
            let status: singleNode[] = Object.assign({}, this.state.allNodes); //If it does not match, it will set the currentColor to red, meaning the letter was typed in incorrectly.
            status[this.state.index].currentColor = 1; //currentColor 0 means it was typed corrently and 1 means it was typed incorrectly
            temp = status;
          }
        }

        //Calculating the socres to display
        if (index >= 5) {
          wpm = Math.round(index / 5 / (this.state.timerTime / 60));
          this.setState({ wordsPerMin: wpm });
          let AccScore = Math.round(
            ((this.state.index - mistakesTemp.length) /
              this.state.totalCharTyped) *
              100
          );
          this.setState({ accuracyScore: AccScore });
        }
      } else {
        this.reset();
      }
    }
  };

  filterErrors = () => {
    countOfMistakes = [];
    let returnStatement;
    mistakesTemp = this.state.allNodes.filter(
      (nodes) => nodes.currentColor > 0
    );
    mistakesTemp.map((each) => {
      if (countOfMistakes.some((i) => i.letterMistake === each.letter)) {
        let i;
        for (i = 0; i < countOfMistakes.length; i++) {
          if (countOfMistakes[i].letterMistake === each.letter) {
            countOfMistakes[i].countMistake =
              countOfMistakes[i].countMistake + 1;
          }
        }
      } else {
        const tempNode = {
          letterMistake: each.letter,
          countMistake: 1,
        };
        countOfMistakes.push(tempNode);
      }
    });
    if (mistakesTemp.length !== 0) {
      returnStatement = (
        <div>
          <Row className="justify-content-md-center">
            <Col className="text-center bg-lightest-blue b bb" md="3">
              Errors:
            </Col>
          </Row>
          <Row className="justify-content-md-center">
            <Col className="bg-lightest-blue" md="3">
              <ul>{this.returnErrors()}</ul>
            </Col>
          </Row>
        </div>
      );
    } else {
      returnStatement = <div></div>;
    }
    return returnStatement;
  };

  returnErrors = () => {
    var tempReturn = countOfMistakes.map((nodes, key) => {
      if (nodes.letterMistake === " ") {
        return (
          <li key={key}>
            {"Space"}: {nodes.countMistake}
          </li>
        );
      } else if (nodes.letterMistake === ",") {
        return (
          <li key={key}>
            {"Comma"}: {nodes.countMistake}
          </li>
        );
      } else if (nodes.letterMistake === ".") {
        return (
          <li key={key}>
            {"Period"}: {nodes.countMistake}
          </li>
        );
      } else {
        return (
          <li key={key}>
            {nodes.letterMistake}: {nodes.countMistake}
          </li>
        );
      }
    });
    return tempReturn;
  };

  start = () => {
    escape = false;
    start = true;
    $(".startButton").prop("disabled", true);
    chars = Array.from(this.props.text);
    if (pause === 0) {
      chars.map((each, i) => {
        const nodetest = {
          letter: each,
          currentColor: 0,
        };
        temp.push(nodetest);
      });
    }
    pause = pause + 1;

    this.setState({ timerIsOn: true });
    times = setInterval(() => {
      if (this.state.timerIsOn === true) {
        this.setState({
          timerTime: this.state.timerTime + 1,
        });
      }
    }, 1000);
  };

  reset = () => {
    $(".resetButton").prop("disabled", true);
    temp = [];
    countOfMistakes = [];
    this.setState({ index: 0 });
    pause = 0;
    this.setState({ allNodes: temp });
    this.setState({ timerTime: 0 });
    clearInterval(times);
    this.setState({ wordsPerMin: 0 });
    this.start();
    $(".resetButton").prop("disabled", false);
  };

  componentDidMount() {
    document.addEventListener("keydown", this.gettingKeyPressed);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.gettingKeyPressed);
  }

  render() {
    return (
      <Container>
        <Row className="bg-lightest-blue topContainer">
          <Col className="text-center">
            <p>Timer: {this.state.timerTime}</p>
          </Col>
          <Col className="text-center">
            <p>Words per minute: {this.state.wordsPerMin}</p>
          </Col>
          <Col className="text-center">
            <p>Accuracy Score: {this.state.accuracyScore}%</p>
          </Col>
        </Row>
        <Row className="justify-content-md-center bg-lightest-blue bottomContainer">
          {this.changeColor()}
        </Row>
        <Row>
          <br></br>
        </Row>
        <Row className="justify-content-md-center">
          <Col></Col>
          <Col></Col>
          <Col className="text-center">
            <Button
              variant="warning"
              className="startButton"
              onClick={this.start}
            >
              Start
            </Button>
          </Col>
          <Col className="text-center">
            <h6 className="yellow">Press Escape key to pause</h6>
          </Col>
          <Col className="text-center">
            <Button
              variant="warning"
              className="resetButton"
              onClick={this.reset}
            >
              Reset
            </Button>
          </Col>
          <Col></Col>
          <Col></Col>
        </Row>
        <Row>
          <br></br>
        </Row>
        <Container className="justify-content-md-center">
          {this.filterErrors()}
        </Container>
      </Container>
    );
  }
}

export default Node;
