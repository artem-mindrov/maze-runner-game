Vue.options.delimiters = ['[[', ']]'];

var maze = new Vue({
  el: '#maze',
  methods: {
    draw: function(grid) {
      if (grid.length < 4) return

      const th = 1

      let canvas = this.$el
      let height = grid.length, width = grid[0].length
      let cellsize = Math.min(canvas.clientWidth / width, canvas.clientHeight / height)

      if (cellsize > 60) { cellsize = 60 }
      else if (cellsize < 30) { cellsize = 30 }

      canvas.width = width * cellsize + th*(width + 1)
      canvas.height = height * cellsize + th*(height + 1)

      let xratio = canvas.width / canvas.clientWidth, yratio = canvas.height / canvas.clientHeight
      let minratio = Math.min(xratio, yratio)

      canvas.parentElement.style.width = Math.round(canvas.parentElement.clientWidth * minratio) + 'px'

      let ctx = canvas.getContext("2d")
      ctx.lineWidth = th
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

      ctx.stroke()
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
