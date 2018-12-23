Vue.options.delimiters = ['[[', ']]'];

var form = new Vue({
  el: '#maze-form',
  data() {
    return {
      width: 20,
      height: 20,
      loading: true,
      submit_text: "",
      rebuild() {
        this.loading = true
        this.submit_text = "<i class='fa fa-circle-o-notch fa-spin'></i> Building"

        axios.get("/build", { params: { w: this.width, h: this.height } }).then(resp => {
            this.maze = resp.data
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
