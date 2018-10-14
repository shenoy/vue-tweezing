export default function timer (callback, delay) {
  const t = new Timer({ callback, delay })
  return t
}

class Timer {
  constructor ({ callback, delay }) {
    this.callback = callback
    this.delay = delay
    this.callback(0)
  }

  stop () {
    return this
  }

  // Custom function to simulate some time elapsed
  _elapse (elapsed) {
    this.callback(elapsed)
  }

  // Custom function to make it end
  _end () {
    this._elapse(Infinity)
  }
}
