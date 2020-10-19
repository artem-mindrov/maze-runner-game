var form = new Vue({
  el: '#reading-form',
  data() {
    return {
      choice: '4_2',
      errors: ''
    }
  },
  mounted() {
    this.populate()
  },
  methods: {
    populate: function() {
      this.loading = true

      axios.get("/reading/words", { params: { choice: this.choice } }).then(resp => {
          this.errors = ''
          wordHolder.draw(resp.data)
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
      })
    }
  }
})

var wordHolder = new Vue({
  el: '#word-container',
  data() {
    return {
      current: '',
      idx: 0,
      words: []
    }
  },
  methods: {
    draw: function(words) {
      this.words = words
      this.syllables = []
      this.idx = 0
      this.current = this.words[this.idx]
      this.updateNav()
    },
    prev: function() {
      if (!this.startOfList) {
        this.current = this.words[--this.idx]
        this.updateNav()
      }
    },
    next: function() {
      if (!this.endOfList) {
        this.current = this.words[++this.idx]
        this.updateNav()
      }
    },
    updateNav: function() {
      this.syllables = this.current.split('-')
      console.log(this.syllables)
    }
  }
})

