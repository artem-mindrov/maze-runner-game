Vue.options.delimiters = ['[[', ']]']

const Direction = Object.freeze({
  N: 1,
  S: 2,
  E: 4,
  W: 8
})

function pad(num, d) {
  let zero = '';
  for (let i = 0; i < d; i++) { zero += '0' }
  return (zero + num).slice(-d)
}

var timer = new Vue({
  el: '#timer',
  data() {
    return {
      time: 'Stopped',
      counter: 0,
      finished: false
    }
  },
  methods: {
    start: function() {
      if (this.timerID === undefined) {
        const self = this
        this.finished = false

        fire = function() {
          self.time = [pad(Math.floor(self.counter / 3600), 2), pad(Math.floor((self.counter % 3600) / 60), 2),
                      pad(self.counter % 60, 2)].join(':')
          self.counter++
        }

        fire()
        this.timerID = setInterval(fire, 1000)
      }
    },
    stop: function() {
      this.time = 'Stopped'
      this.finished = false

      if (this.timerID !== undefined) {
        this.timerID = window.clearInterval(this.timerID)
        this.reset()
      }
    },
    reset: function() { this.counter = 0 },
    pause: function() {
      if (this.timerID !== undefined) {
        window.clearInterval(this.timerID)
      }

      this.time = 'Paused'
    },
    resume: function() { this.start() },
    finish: function() {
      if (!this.finished) {
        this.finished = true

        if (this.timerID !== undefined) {
          window.clearInterval(this.timerID)
        }
      }
    }
  }
})

var maze = new Vue({
  el: '#maze',
  data: {
    grid: [],
    cellsize: 0,
    wallwidth: 1
  },
  mounted() {
    this.svg = SVG.adopt(this.$el)

    window.addEventListener('keydown', (e) => {
      this.key_pressed(e)
    })
  },
  methods: {
    key_pressed: function(e) {
      switch (e.keyCode) {
        case 104:
        case 38:
        case 87:
          this.move(Direction.N)
          e.preventDefault()
          break
        case 40:
        case 98:
        case 83:
          this.move(Direction.S)
          e.preventDefault()
          break
        case 100:
        case 37:
        case 65:
          this.move(Direction.W)
          e.preventDefault()
          break
        case 102:
        case 39:
        case 68:
          this.move(Direction.E)
          e.preventDefault()
          break
      }
    },

    move: function(dir) {
      if (this.player === undefined || this.player.moving) return

      const cell = this.grid[this.player.y][this.player.x]

      if (cell & dir) {
        let dx = 0, dy = 0, player = this.player

        switch (dir) {
          case Direction.N: dy = -1; break
          case Direction.S: dy = 1;  break
          case Direction.E: dx = 1;  break
          case Direction.W: dx = -1; break
        }

        player.x += dx
        player.y += dy

        const bsize = this.cellsize + this.wallwidth

        player.moving = true
        player.chip.animate(150).dmove(dx * bsize, dy * bsize).after((s) => {
          player.moving = false

          if (this.exit !== undefined) {
            if (player.x == this.exit[0] && player.y == this.exit[1]) {
              timer.finish()
            }
          }
        })
      }
    },

    draw: function(grid) {
      if (grid.length < 4) return

      let th = this.wallwidth

      let canvas = this.$el
      let height = grid.length, width = grid[0].length
      let cellsize = Math.min(canvas.clientWidth / width, canvas.clientHeight / height)

      while (canvas.lastChild) {
        canvas.removeChild(canvas.lastChild)
      }

      if (cellsize > 80) { cellsize = 80 }
      else if (cellsize < 40) { cellsize = 40 }

      this.cellsize = cellsize

      canvas.setAttribute('width', width * cellsize + th*(width + 2))
      canvas.setAttribute('height', height * cellsize + th*(height + 2))

      let xratio = canvas.getAttribute('width') / canvas.clientWidth,
          yratio = canvas.getAttribute('height') / canvas.clientHeight
      let minratio = Math.min(xratio, yratio)

      canvas.parentElement.style.width = Math.round(canvas.parentElement.clientWidth * minratio) + 'px'

      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          let cell = grid[y][x]
          let bordered_size = cellsize + th

          /* N, S, E, W = 1, 2, 4, 8 */
          if (y == 0 && !(cell & 1)) {
            this.draw_wall(x, y, x + 1, y)
          }

          if (!(cell & 2)) {
            this.draw_wall(x, y + 1, x + 1, y + 1)
          }

          if (!(cell & 4)) {
            this.draw_wall(x + 1, y, x + 1, y + 1)
          }

          if (x == 0 && !(cell & 8)) {
            this.draw_wall(x, y, x, y + 1)
          }
        }
      }

      this.grid = grid
    },

    draw_wall: function(sx, sy, ex, ey) {
      let th = this.wallwidth, bsize = this.cellsize + th
      this.svg.line(sx * bsize + th, sy * bsize + th, ex * bsize + th, ey * bsize + th).
          stroke({ color: 'black', width: th, linecap: 'round' })
    },

    draw_player: function(x, y) {
      let th = this.wallwidth, bsize = this.cellsize + th, r = 0.4 * this.cellsize,
          cx = x * bsize + th + this.cellsize / 2, cy = y * bsize + th + this.cellsize / 2

      let g = this.svg.group()
      g.circle(2*r).fill('yellow').stroke('black').attr({ cx: cx, cy: cy, class: 'player', 'stroke-opacity': 0.6 })
      g.circle(r/3).fill('black').attr({ cx: cx - r * 2/3, cy: cy, 'fill-opacity': 0.5 })
      g.circle(r/3).fill('black').attr({ cx: cx + r * 2/3, cy: cy, 'fill-opacity': 0.5 })

      let points = [ `M${cx - r/3},${cy + r/4}`, `Q${cx},${cy + r*3/4}`, `${cx + r/3},${cy + r/4}`]
      g.path(points.join(' ')).fill('black').attr({ 'fill-opacity': 0.5 })
      return g
    },

    draw_exit: function(x, y) {
      let th = this.wallwidth, bsize = this.cellsize + th

      // https://css-tricks.com/creating-star-heart-animation-svg-vanilla-javascript/
      // https://codepen.io/thebabydino/pen/YrdwmX
      const P = 5, RCO = this.cellsize / 2 * 0.8
           BAS = 2*(2*Math.PI/P)
           BAC = 2*Math.PI/P
           RI = RCO*Math.cos(.5*BAS)
           RCI = RI/Math.cos(.5*BAC)
           ND = 2*P
           BAD = 2*Math.PI/ND
           PTS = []

      for (let i = 0; i < ND; i++) {
  	    let cr = i%2 ? RCI : RCO, ca = i*BAD,
            px = Math.round(cr*Math.cos(ca)) + x * bsize + th + this.cellsize / 2,
            py = Math.round(cr*Math.sin(ca)) + y * bsize + th + this.cellsize / 2

  		PTS.push([px, py])
  		if (!(i%2)) PTS.push([px, py])
      }

      path = PTS.reduce((a, c, i) => { return a + (i%3 ? ' ' : 'C') + c }, `M${PTS[PTS.length - 1]}`)
      this.exit = [x, y]
  	  this.svg.path(path).stroke('rgb(215,185,0)').fill('gold').attr({ class: 'star' })
    },

    start: function() {
      let grid = this.grid,
          start = [ Math.floor(Math.random() * grid[0].length), Math.floor(Math.random() * grid.length) ],
          end = [ grid[0].length - start[0] - 1, grid.length - start[1] - 1 ]

      switch (Math.floor(Math.random() * 4)) {
        case 0:  start[0] = 0;                  end[0] = grid[0].length - 1; break
        case 1:  start[1] = 0;                  end[1] = grid.length - 1;    break
        case 2:  start[0] = grid[0].length - 1; end[0] = 0; break
        case 3:  start[1] = grid.length - 1;    end[1] = 0; break
      }

      this.player = { chip: this.draw_player(...start), x: start[0], y: start[1] }
      this.draw_exit(...end)
    }
  }
})

var form = new Vue({
  el: '#maze-form',
  data() {
    return {
      width: 10,
      height: 10,
      loading: true,
      submit_text: '',
      errors: ''
    }
  },
  mounted() {
    this.rebuild()
  },
  methods: {
    rebuild: function() {
      this.loading = true
      this.submit_text = "<i class='fa fa-circle-o-notch fa-spin'></i> Building"
      timer.stop()

      axios.get("/build", { params: { w: this.width, h: this.height } }).then(resp => {
          this.errors = ''
          maze.draw(resp.data)
          maze.start()
          timer.start()
      }).catch((err) => {
          this.errors = '<b>Server Error: </b>'

          if (err.response) {
            this.errors += '[' + err.response.status + '] : '
            this.errors += err.response.data
          } else if (err.request) {
            this.errors += err.request.statusText
          } else {
            this.errors += err.message
          }

          this.errors += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
          this.errors += '<span aria-hidden="true">&times;</span>'
          this.errors += '</button>'
      }).finally(() => {
          this.loading = false
          this.submit_text = "Build"
      })
    }
  }
})
