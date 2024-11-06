// OHome.js
import React, { Component } from 'react';
import createEngine, { DiagramModel } from '@projectstorm/react-diagrams';
import { DefaultNodeModel, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

class OHome extends Component {
  constructor(props) {
    super(props);

    // Initialize the diagram engine
    this.engine = createEngine();
    this.state = { loaded: false };
  }

  componentDidMount() {
    console.log("LOADING JSON");
    // Load JSON from the public folder
    fetch(`${process.env.PUBLIC_URL}/layerforge.json`)
      .then(response => response.json())
      .then(data => this.createDiagramFromJSON(data))
      .catch(error => console.error('Error loading JSON:', error));
  }

  createDiagramFromJSON(data) {
    // Create a new model for the diagram based on JSON data
    const model = new DiagramModel();
    const nodesMap = {};
  
    // Create nodes with ports
    console.log("Creating nodes from JSON data:", data.nodes);
    data.nodes.forEach(nodeData => {
      const node = new DefaultNodeModel({
        name: nodeData.label,
        color: nodeData.color || 'rgb(0,192,255)'
      });
      node.setPosition(nodeData.x, nodeData.y);
  
      // Add input and output ports
      const outPort = node.addOutPort('Out');
      const inPort = node.addInPort('In');
  
      // Store the node and its ports in nodesMap
      nodesMap[nodeData.id] = { node, outPort, inPort };
  
      model.addNode(node);
      console.log(`Node created: ${nodeData.label} at position (${nodeData.x}, ${nodeData.y})`);
    });
  
    // Create links between nodes
    console.log("Creating links from JSON data:", data.links);
    data.links.forEach(linkData => {
      const source = nodesMap[linkData.source];
      const target = nodesMap[linkData.target];
  
      if (source && target) {
        const link = new DefaultLinkModel();
        link.setSourcePort(source.outPort);
        link.setTargetPort(target.inPort);
        model.addLink(link);
        console.log(`Link created between ${linkData.source} and ${linkData.target}`);
      } else {
        console.warn(`Link creation failed for source ${linkData.source} or target ${linkData.target}`);
      }
    });
  
    // Set the new model in the engine and mark as loaded
    this.engine.setModel(model);
    this.setState({ loaded: true });
  }
  

  render() {
    if (!this.state.loaded) {
      return <p>Loading diagram...</p>;
    }

    return (
      <div style={{ height: '100vh', width: '100%' }}>
        <h2 style={{ textAlign: 'center' }}>LayerForge Project Overview</h2>
        <div className="CanvasContainer" style={{ height: '85vh', width: '100%', border: '1px solid #ddd' }}>
          <CanvasWidget engine={this.engine} />
        </div>
      </div>
    );
  }
}

export default OHome;
