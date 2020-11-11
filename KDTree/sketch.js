function dibujar_circulo(point, radio) {
    fill(100, 100, 255, 0);
    circle(point[0], height - point[1], radio * 2); 
    textSize(8);
    fill(0,255,255)
    circle(x, height - y, 2);
    a = "Punto " + point[0] + ',' + point[1], point[0] - 25, height - point[1];
    b = "Radio " + radio, point[0] - 15, height - point[1] + 10;
    document.getElementById('datos').innerHTML = a + ' ' + b;
}

function dibujar_rectangulo(point,range) {
    fill(255, 255, 0, 40);
    rect(point[0], point[0], range[0], range[1]);
    textSize(8);
    text(point[0] + ',' + point[1], point[0] - 8, height - point[1]);
}

function dibujar_puntos(lista, r, g, b) {
    for(let i=0; i<lista.length; i++) {
        x = lista[i][0];
        y = lista[i][1];
        fill(r, g, b);
        circle(x, height - y, 5);
        textSize(8);
        text(x + ',' + y, x + 5, height - y);
    }
}

n = 30; // n puntos

function setup() {
    var width = 350;
    var height = 300;
    createCanvas(width, height);
    background(0);
    for (var x = 0; x < width; x += width / 10) {
        for (var y = 0; y < height ; y += height / 5) {
            stroke(125, 125, 125);
            strokeWeight(1);
            line(x, 0, x, height);
            line(0, y, width, y);
        }
    }
    var data = [];
    for ( let i = 0; i < n; i++) {
        var x = Math.floor(Math.random() * width);
        var y = Math.floor(Math.random() * height);
        data.push([x, y]);
    }
    dibujar_puntos(data, 255, 255, 255);
    let root = build_kdtree(data);
    console.log(root);
    model.nodeDataArray = gg(root);
    myDiagram.model = model;

    var point = [80, 120]; //punto del circulo y el rectangulo
    var radio = 50;
    var range = [70, 50];
    dibujar_circulo(point, radio);
    let queue = [];
    range_query_circle(root, point, radio, queue);
    dibujar_puntos(queue, 255, 255, 0);
    console.log(queue);
    var point_rect = [50, 100];
    var range = [100, 70];
    let queue_rect = [];
    range_query_rectangle(root, point_rect, range, queue_rect);
    dibujar_puntos(queue_rect, 255, 255, 0);
    console.log(queue_rect);

    /*console.log('Altura del KDTree: ' + getHeight(root));
    console.log(generate_dot(root));
    var point = [];
    point.push(15, 65);
    fill(0, 255, 0);
    circle(15, height - 65, 7);
    textSize(8);
    text(15 + ',' + 65, 15 + 5, height - 65);
    console.log('Brute force: ' + point[0] + ',' + point[1] + ': ' + closest_point_brute_force(data, point));
    console.log('Naive: ' + naive_closest_point(root, point));
    console.log('CP: ' + closest_point(root, point));*/
}