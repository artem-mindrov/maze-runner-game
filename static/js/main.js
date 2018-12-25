Vue.options.delimiters = ['[[', ']]'];

var maze = new Vue({
  el: '#maze',
  data: {
    grid: [],
    cellsize: 0,
    wallwidth: 1
  },
  methods: {
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
      let wall = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
          th = this.wallwidth, bordered_size = this.cellsize + th
      wall.setAttribute('x1', sx * bordered_size + th)
      wall.setAttribute('y1', sy * bordered_size + th)
      wall.setAttribute('x2', ex * bordered_size + th)
      wall.setAttribute('y2', ey * bordered_size + th)
      wall.setAttribute('stroke', 'black')
      wall.setAttribute('stroke-width', th)
      this.$el.appendChild(wall)
    },

    draw_chip: function(x, y) {
      let canvas = this.$el, chip = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
          th = this.wallwidth, bordered_size = this.cellsize + this.wallwidth
      chip.setAttribute('cx', x * bordered_size + th + this.cellsize / 2)
      chip.setAttribute('cy', y * bordered_size + th + this.cellsize / 2)
      chip.setAttribute('r', 0.4 * this.cellsize)
      chip.setAttribute('stroke', 'black')
      chip.setAttribute('fill', 'blue')
      this.$el.appendChild(chip)
    },

    draw_exit: function(x, y) {
      let canvas = this.$el, chip = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
          th = this.wallwidth, bordered_size = this.cellsize + this.wallwidth
      chip.setAttribute('x', x * bordered_size + th + this.cellsize / 10)
      chip.setAttribute('y', y * bordered_size + th + this.cellsize / 10)
      chip.setAttribute('rx', this.cellsize / 8)
      chip.setAttribute('ry', this.cellsize / 8)
      chip.setAttribute('width', this.cellsize * 0.8)
      chip.setAttribute('height', this.cellsize * 0.8)
      chip.setAttribute('stroke', 'black')
      chip.setAttribute('fill', 'green')
      this.$el.appendChild(chip)
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

      this.draw_chip(...start)
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
      submit_text: "",
      rebuild() {
        this.loading = true
        this.submit_text = "<i class='fa fa-circle-o-notch fa-spin'></i> Building"

        axios.get("/build", { params: { w: this.width, h: this.height } }).then(resp => {
            maze.draw(resp.data)
            maze.start()
        }).finally(() => {
            this.loading = false
            this.submit_text = "Build"
        })
      }
    }
  },
  mounted() {
    this.rebuild()
  },
  methods: {
    rebuild: function() {
      this.rebuild()
    }
  }
});
