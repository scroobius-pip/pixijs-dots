/**
* This is the default playground.
* You should see a bunny spinning in the right preview pane.
* Feel free to use this as a starting point for you own playground!
*/

// Create our application instance


const CIRCLE_SIZE = 10
const GRID_SIZE = 30;
const GRID_AREA = GRID_SIZE ** 2
const PADDING = 25

const app = new PIXI.Application({
    width: 1000,
    height: 1000,
    backgroundColor: '0x00000',
    antialias: true
});

document.body.appendChild(app.view);

app.loader.load(startup)

function startup() {

    const circles = new PIXI.Container()

    focus_point_y = Math.floor(GRID_SIZE / 2)
    focus_point_x = Math.floor(GRID_SIZE / 2)

    circles.interactive = true
    app.stage.addChild(circles)

    initCircles(focus_point_x, focus_point_y, circles)
    const circleUpdater = updateCircles(circles)

    circles.on('mousemove', (event)=>{
     const {x,y} =   event.data.global
     console.log(x,y)
     circleUpdater(x,y)
     // circleUpdater(x,y)
    })

}


function initCircles(focus_point_x, focus_point_y, container) {

    for (let x_position = 0; x_position < GRID_SIZE; x_position++) {
        for (let y_position = 0; y_position < GRID_SIZE; y_position++) {
            const x_position_padded = x_position * PADDING
            const y_position_padded = y_position * PADDING

            const distance = getDistance(x_position, focus_point_x, y_position, focus_point_y)
         
            const circle = createCircle(CIRCLE_SIZE , x_position_padded, y_position_padded, 1)

            container.addChild(circle)
        }
    }


}

function updateCircles(circles) {
    return (mouseX, mouseY) => {

        for (const circle of circles.children) {
            const { x, y } = circle
            const distance = getDistance(mouseX, x, mouseY, y)
            const opacity = opacityFromDistance(distance,100)
            const size_multiplier = multiplierFromDistance(distance,50,1,0)
            updateCircle(circle, CIRCLE_SIZE * size_multiplier, opacity)

        }

    }
}

function updateCircle(circle, size, opacity) {
    circle.alpha = opacity
    circle.height = size*2
    circle.width = size*2
}


function createCircle(size, x, y, opacity) {
    const circle = new PIXI.Graphics()
    circle.lineStyle(0)
    circle.beginFill(0xffffff, opacity)

    circle.drawCircle(0, 0, size)
    circle.endFill()
    circle.x = x
    circle.y = y
  
    return circle
}


function getDistance(x1, x2, y1, y2) {
    return Math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2))
}




function opacityFromDistance(distance,scale) {
    if (distance == 0) return 1
    return ((scale||2) / distance)
}

function multiplierFromDistance(distance,scale,max,min) {
    if (distance == 0) return max||1
    const multiplier = ((scale || 1) / distance)
    return Math.min(max||1,Math.max(min||0,multiplier))
}

