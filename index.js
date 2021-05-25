/**
* This is the default playground.
* You should see a bunny spinning in the right preview pane.
* Feel free to use this as a starting point for you own playground!
*/

// Create our application instance

//https://css-tricks.com/snippets/javascript/random-hex-color/
var randomColor = ()=> Math.floor(Math.random()*16777215);

//https://www.reddit.com/r/javascript/comments/93ntvh/simple_1d_perlin_noise_with_optional_octaves/
function ValueNoise(values) {
    this.values = Array.isArray(values) ? values : this.generateValues();
    this.smooth = this.interpolate;
}
ValueNoise.prototype = {
    generateValues: function () {
        var result = [];
        for (var i = 0; i < 1234; i++) {
            result.push(Math.random() * 2 - 1); //Output is between -1.. 1
        }
        return result;
    },
    smoothstep: function(a, b, f) {
        var f = f * f * (3 - 2 * f);
        return a + f * (b - a);
    },
    interpolate: function (a, b, f) {
        var f = .5 - Math.cos(f * Math.PI) * .5;
        return a + f * (b - a);
    },
    getValue: function (x) {
        let max = this.values.length,
            ix = Math.floor(x),
            fx = x - ix, // "gradient"
            i1 = (ix % max + max) % max,
            i2 = (i1 + 1) % max;
        return this.smooth(this.values[i1], this.values[i2], fx);
    },
    getValueOctaves: function (x, octaves) {
        if (octaves < 2) {
            return this.getValue(x);
        }
        let result = 0, m, io, c,
                maxo = 1 << octaves,
                fract = 1 / (maxo - 1);
        for (var i = 1; i <= octaves; i++) {
            io = i - 1;
            m = fract * (1 << (octaves - i));
            result += this.getValue(x * (1 << io) + io * .1234) * m;
        }
        return result;
    }
};

class Perlin {
  constructor() {
    // Quick and dirty permutation table
    this.perm = (() => {
      const tmp = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
      return tmp.concat(tmp)
    })();
  }
  
  grad(i, x) {
    const h = i & 0xf;
    const grad = 1 + (h & 7);
    
    if ((h & 8) !== 0) {
      return -grad * x;
    }
    
    return grad * x;
  }
  
  getValue(x) {
    const i0 = Math.floor(x);
    const i1 = i0 + 1;
    
    const x0 = x - i0;
    const x1 = x0 - 1;
    
    let t0 = 1 - x0 * x0;
    t0 *= t0;
    
    let t1 = 1 - x1 * x1;
    t1 *= t1;
    
    const n0 = t0 * t0 * this.grad(this.perm[i0 & 0xff], x0);
    const n1 = t1 * t1 * this.grad(this.perm[i1 & 0xff], x1);
    
    return 0.395 * (n0 + n1);
  }
}

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

    initCircles(focus_point_x, focus_point_y, circles,randomColor())
    const circleUpdater = updateCircles(circles)

timerX = 0
timerY = 0
timerOpacity = 0
timerStrength = 0
timerOmega = 0
xSimplex = new ValueNoise([250,500])
ySimplex = new ValueNoise([100,500])
opacitySimplex = new ValueNoise([0,1020])
strengthSimplex = new ValueNoise([50,50])
app.ticker.add(()=>{
    _x = (xSimplex.getValue(timerX+=0.001))
    _y = (ySimplex.getValue( timerY+=0.0012))
    oS = opacitySimplex.getValue(timerOpacity+=0.001)
    sS = strengthSimplex.getValue(timerStrength+=0.001)
    // timerX+=0.001
   
    circleUpdater(_x,_y,oS,sS)
})
    
//     circles.on('mousemove', (event)=>{
//      const {x,y} =   event.data.global
//     //  console.log(x,y)
//     //  circleUpdater(x,y)

// console.log(_x)
//      circleUpdater(_x,_y)
//     })

}


function initCircles(focus_point_x, focus_point_y, container,color) {

    for (let x_position = 0; x_position < GRID_SIZE; x_position++) {
        for (let y_position = 0; y_position < GRID_SIZE; y_position++) {
            const x_position_padded = x_position * PADDING
            const y_position_padded = y_position * PADDING

            const distance = getDistance(x_position, focus_point_x, y_position, focus_point_y)
         
            const circle = createCircle(CIRCLE_SIZE , x_position_padded, y_position_padded, 1,color)

            container.addChild(circle)
        }
    }


}

function updateCircles(circles) {
    return (mouseX, mouseY,opacityStrength,distanceStrength) => {

        for (const circle of circles.children) {
            const { x, y } = circle
            const distance = getDistance(mouseX, x, mouseY, y)
            const opacity = opacityFromDistance(distance,opacityStrength||100)
            const size_multiplier = multiplierFromDistance(distance,distanceStrength||50,1,0)
            updateCircle(circle, CIRCLE_SIZE * size_multiplier, opacity)

        }

    }
}

function updateCircle(circle, size, opacity) {
    circle.alpha = opacity
    circle.height = size*2
    circle.width = size*2
    // circle.tint = 0xfffffff
}


function createCircle(size, x, y, opacity,color) {
    const circle = new PIXI.Graphics()
    circle.lineStyle(0)
    circle.beginFill(color||0xfffff, opacity)

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

