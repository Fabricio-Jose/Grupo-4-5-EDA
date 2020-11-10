let $ = go.GraphObject.make;
let myDiagram = $(go.Diagram, 'myDiagramDiv', {
  'undoManager.isEnabled': true,
  layout: $(
    go.TreeLayout, // specify a Diagram.layout that arranges trees
    { angle: 90, layerSpacing: 35 }
  ),
});
myDiagram.nodeTemplate = $(
  go.Node,
  'Horizontal',
  { background: '#252525FF' },
  $(
    go.TextBlock,
    'Default Text',
    { margin: 12, stroke: 'white', font: 'bold 16px sans-serif' },
    new go.Binding('text', 'name')
  )
);

let model = $(go.TreeModel);

function gg(root) {
  let arr = [];
  let queue = [[root, null]];
  let key = 0;
  while (queue.length > 0) {
    let tuple = queue.shift();
    let node = tuple[0];
    let parent = tuple[1];
    key++;
    if (!parent) arr.push({ key: key.toString(), name: node.point.toString() });
    else
      arr.push({
        key: key.toString(),
        parent: parent,
        name: node.point.toString(),
      });
    parent = key;
    if (node.left) queue.push([node.left, parent]);
    if (node.right) queue.push([node.right, parent]);
  }
  return arr;
}
