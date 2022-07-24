let lastEvent;

['click', 'mousedown', 'touchstart', 'keydown', 'mouseover'].forEach(eventType => {
  document.addEventListener(eventType, event => {
    lastEvent = event
  }, {
    passive: true,
    capture: true,
  })
})

export default function () {
  return lastEvent
}
