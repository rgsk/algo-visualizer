import React, { useState, useEffect } from 'react';
import { depthFirstSearch } from '../algos/depthFirstSearch';
import { breathFirstSearch } from '../algos/breathFirstSearch';
import { calculateLength } from '../helper';
import Edges from './Edges';
import Nodes from './Nodes';
import styles from './GraphAdvancedVisualizer.module.css';
import { dijkstra } from '../algos/dijkstra';
import { prims } from '../algos/prims';
import { dijkstraAllNodes } from '../algos/dijkstraAllNodes';
import { kruskals } from '../algos/kruskals';
import { topSortAlgo } from '../algos/topSort';
import TopBar from '../../TopBar/TopBar';
import Button from '../../shared/Button';
const initialVisualizerState = () => {
  return {
    active: false,
    delay: 100,
    timeOuts: [],
    edgesVisited: [],
    nodesVisited: [],
    edgesFinalized: [],
    nodesFinalized: [],
    dijkstraDistanceNodes: [],
  };
};

function GraphAdvancedVisualizer() {
  const [gamePaused, setGamePaused] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [visualizerState, setVisualizerState] = useState(() => {
    return initialVisualizerState();
  });
  const [directedEdges, setDirectedEdges] = useState(false);
  const [startMakingEdge, setStartMakingEdge] = useState(false);
  const [startNode, setStartNode] = useState(0);
  const [endNode, setEndNode] = useState(0);

  const [showLength, setShowLength] = useState(true);
  let reset = () => {
    for (let timer of visualizerState.timeOuts) {
      timer.clear();
    }
    setVisualizerState((vs) => ({
      ...initialVisualizerState(),
      delay: vs.delay,
    }));
  };
  const cursorOverWhichNode = () => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].cursorOver) return nodes[i].num;
    }
    return -1;
  };
  const addNode = (e) => {
    setNodes((nodes) => {
      let num;
      if (nodes.length === 0) {
        num = 1;
      } else {
        num = nodes[nodes.length - 1].num + 1;
      }
      return [
        ...nodes,
        {
          num,
          x: e.pageX,
          y: e.pageY,
          originatingEdges: [],
          terminatingEdges: [],
        },
      ];
    });
  };
  const addEdgeToNodes = (currentEdge) => {
    if (directedEdges) {
      setNodes((nodes) => {
        const startNode = {
          ...nodes.find((node) => node.num === currentEdge.startNode),
        };
        startNode.originatingEdges = [
          ...startNode.originatingEdges,
          currentEdge,
        ];
        const endNode = {
          ...nodes.find((node) => node.num === currentEdge.endNode),
        };
        endNode.terminatingEdges = [...endNode.terminatingEdges, currentEdge];
        return nodes.map((node) => {
          if (node.num === startNode.num) return startNode;
          if (node.num === endNode.num) return endNode;
          return node;
        });
      });
    } else {
      setNodes((nodes) => {
        const startNode = {
          ...nodes.find((node) => node.num === currentEdge.startNode),
        };
        const endNode = {
          ...nodes.find((node) => node.num === currentEdge.endNode),
        };
        startNode.originatingEdges = [
          ...startNode.originatingEdges,
          currentEdge,
        ];
        endNode.terminatingEdges = [...endNode.terminatingEdges, currentEdge];
        const reversedCurrentEdge = { ...currentEdge };
        reversedCurrentEdge.startNode = currentEdge.endNode;
        reversedCurrentEdge.endNode = currentEdge.startNode;
        startNode.terminatingEdges = [
          ...startNode.terminatingEdges,
          reversedCurrentEdge,
        ];

        endNode.originatingEdges = [
          ...endNode.originatingEdges,
          reversedCurrentEdge,
        ];

        return nodes.map((node) => {
          if (node.num === startNode.num) return startNode;
          if (node.num === endNode.num) return endNode;
          return node;
        });
      });
    }
  };
  useEffect(() => {
    if (gamePaused) {
      for (let timer of visualizerState.timeOuts) {
        timer.pause();
      }
    } else {
      for (let timer of visualizerState.timeOuts) {
        timer.resume();
      }
    }
  }, [gamePaused]);
  function deleteAll() {
    setNodes([]);
    setEdges([]);
    setStartNode(0);
    setEndNode(0);
  }
  return (
    <div className="container">
      <div
        className={styles.block}
        onMouseMove={(e) => {
          // console.log(e);
          if (startMakingEdge) {
            // console.log(edges);
            setEdges((edges) => {
              const uce = { ...edges[edges.length - 1] };
              uce.ex = e.pageX;
              uce.ey = e.pageY;
              uce.length = calculateLength(uce);
              uce.endNode = cursorOverWhichNode();
              return [...edges.slice(0, edges.length - 1), uce];
            });
          }
        }}
        onMouseDown={(e) => {
          if (cursorOverWhichNode() === -1) return;
          setStartMakingEdge(true);
          setEdges((edges) => {
            let id;
            if (edges.length === 0) {
              id = 1;
            } else {
              id = edges[edges.length - 1].id + 1;
            }
            return [
              ...edges,
              {
                id,
                sx: e.pageX,
                sy: e.pageY,
                ex: e.pageX,
                ey: e.pageY,
                length: 0,
                startNode: cursorOverWhichNode(),
                endNode: cursorOverWhichNode(),
                directed: directedEdges,
              },
            ];
          });
        }}
        onMouseUp={(e) => {
          if (startMakingEdge) {
            setStartMakingEdge(false);
            const currentEdge = edges[edges.length - 1];
            // console.log(currentEdge);
            if (
              currentEdge.endNode === -1 ||
              currentEdge.endNode === currentEdge.startNode
            ) {
              setEdges((edges) => {
                const uEdges = [...edges];
                uEdges.pop();
                return uEdges;
              });
            } else {
              // add edge to nodes
              addEdgeToNodes(currentEdge);
            }
          } else {
            if (!e.edgeClicked && cursorOverWhichNode() === -1) {
              addNode(e);
            }
          }
        }}
      >
        {Nodes(
          nodes,
          showLength,
          visualizerState,
          startNode,
          endNode,
          setNodes,
          setStartNode,
          setEndNode,
          setEdges,
        )}
        {Edges(
          edges,
          visualizerState,
          startMakingEdge,
          setEdges,
          setNodes,
          showLength,
        )}
      </div>
      {Controls()}
    </div>
  );

  function Controls() {
    return (
      <TopBar header="Advanced Graphs">
        {/* <Button
          onClick={() => {
            console.log(nodes);
            console.log(edges);
          }}
        >
          click
        </Button> */}
        <Button
          onClick={() => {
            deleteAll();
            reset();
          }}
        >
          Clear
        </Button>
        <Button onClick={reset}>Reset</Button>
        <Button onClick={() => setGamePaused(!gamePaused)}>
          {gamePaused ? 'Resume' : 'Pause'}
        </Button>

        <Button>
          <label
            style={{
              color: 'white',
            }}
          >
            Speed:{' '}
          </label>
          <input
            type="range"
            max={95}
            value={100 - visualizerState.delay / 10}
            onChange={(e) => {
              if (visualizerState.active) {
                reset();
              }
              setVisualizerState((vs) => {
                return {
                  ...vs,
                  delay: (100 - e.target.value) * 10,
                };
              });
            }}
          ></input>
        </Button>

        <Button
          onClick={() => {
            setStartNode(0);
            setEndNode(0);
          }}
        >
          Reset Src/Dest
        </Button>

        <Button>
          <label>Show Length: </label>
          <input
            checked={showLength}
            type="checkbox"
            onClick={(e) => setShowLength(!showLength)}
          ></input>
        </Button>
        <Button
          onClick={() => setDirectedEdges(!directedEdges)}
          active={directedEdges}
        >
          Directed Nodes
        </Button>
        <Button
          onClick={() => {
            if (startNode && endNode)
              breathFirstSearch(
                startNode,
                endNode,
                nodes,
                edges,
                visualizerState,
                setVisualizerState,
              );
          }}
        >
          BFS
        </Button>
        <Button
          onClick={() => {
            if (startNode && endNode)
              depthFirstSearch(
                startNode,
                endNode,
                nodes,
                edges,
                visualizerState,
                setVisualizerState,
              );
          }}
        >
          DFS
        </Button>
        <Button
          onClick={() => {
            if (startNode && endNode)
              dijkstra(
                startNode,
                endNode,
                JSON.parse(JSON.stringify(nodes)),
                edges,
                visualizerState,
                setVisualizerState,
              );
          }}
        >
          Dijkastra
        </Button>
        <Button
          onClick={() => {
            if (startNode)
              dijkstraAllNodes(
                startNode,
                endNode,
                JSON.parse(JSON.stringify(nodes)),
                edges,
                visualizerState,
                setVisualizerState,
              );
          }}
        >
          Dijkastra All Nodes
        </Button>
        <Button
          onClick={() => {
            prims(nodes, edges, visualizerState, setVisualizerState);
          }}
        >
          Prims
        </Button>
        <Button
          onClick={() => {
            kruskals(nodes, edges, visualizerState, setVisualizerState);
          }}
        >
          Kruskals
        </Button>
        <Button
          onClick={() => {
            if (startNode)
              topSortAlgo(
                startNode,
                JSON.parse(JSON.stringify(nodes)),
                edges,
                visualizerState,
                setVisualizerState,
              );
          }}
        >
          TopSort
        </Button>
      </TopBar>
    );
  }
}

export default GraphAdvancedVisualizer;

// const sampleNode = {
//   num: 1,
//   x: 24,
//   y: 24,
//   cursorOver: false,
//   originatingEdges: [],
//   terminatingEdges: [],
// };
// const sampleEdge = {
//   id: unique,
//   sx: 0,
//   sy: 0,
//   ex: 100,
//   ey: 100,
//   startNode: 0,
//   endNode: 3,
//   directed: false
// };
