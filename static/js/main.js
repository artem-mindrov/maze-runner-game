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

      if (cellsize > 60) { cellsize = 60 }
      else if (cellsize < 30) { cellsize = 30 }

      this.cellsize = cellsize

      canvas.width = width * cellsize + th*(width + 1)
      canvas.height = height * cellsize + th*(height + 1)

      let xratio = canvas.width / canvas.clientWidth, yratio = canvas.height / canvas.clientHeight
      let minratio = Math.min(xratio, yratio)

      canvas.parentElement.style.width = Math.round(canvas.parentElement.clientWidth * minratio) + 'px'

      let ctx = canvas.getContext("2d")
      ctx.lineWidth = th
      ctx.lineCap = 'round'
      ctx.beginPath()

      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          let cell = grid[y][x]
          let bordered_size = cellsize + th

          /* N, S, E, W = 1, 2, 4, 8 */
          if (!(cell & 1)) {
            ctx.moveTo(x * bordered_size + th/2, y * bordered_size + th/2)
            ctx.lineTo((x + 1) * bordered_size + th/2, y * bordered_size + th/2)
          }

          if (!(cell & 2)) {
            ctx.moveTo(x * bordered_size + th/2, (y + 1) * bordered_size + th/2)
            ctx.lineTo((x + 1) * bordered_size + th/2, (y + 1) * bordered_size + th/2)
          }

          if (!(cell & 4)) {
            ctx.moveTo((x + 1) * bordered_size + th/2, y * bordered_size + th/2)
            ctx.lineTo((x + 1) * bordered_size + th/2, (y + 1) * bordered_size + th/2)
          }

          if (!(cell & 8)) {
            ctx.moveTo(x * bordered_size + th/2, y * bordered_size + th/2)
            ctx.lineTo(x * bordered_size + th/2, (y + 1) * bordered_size + th/2)
          }
        }
      }

      this.grid = grid
      ctx.stroke()
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

      let ctx = this.$el.getContext("2d"), cellsize = this.cellsize, th = this.wallwidth, bordered_size = cellsize + th

      ctx.beginPath()
      ctx.arc(start[0] * bordered_size + (bordered_size + th)/2, start[1] * bordered_size + (bordered_size + th)/2,
        cellsize * 0.4, 0, Math.PI * 2, true)
      ctx.fillStyle = 'blue'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(end[0] * bordered_size + (bordered_size + th)/2, end[1] * bordered_size + (bordered_size + th)/2,
        cellsize * 0.4, 0, Math.PI * 2, true)
      ctx.fillStyle = 'red'
      ctx.fill()
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
