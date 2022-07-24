import getLastEvent from "../utils/getLastEvent"
import getSelector from "../utils/getSelector"
import tracker from "../utils/tracker"

export function injectJsError() {
  window.addEventListener('error', (event) => {
    let lastEvent = getLastEvent() // 最后一个交互事件

    // 脚本加载
    if (event.target && (event.target.src || event.target.href)) {
      tracker.send({
        kind: 'stability', // 监控指标的大类
        type: 'error', // 小类型，这是一个错误
        errorType: 'resourceError', // JS 执行错误
        filename: event.target.src || event.target.href, // 报错文件
        tagName: event.target.tagName,
        selector: getSelector(event.target),  // 最后一个操作的元素
      })
    } else {
      tracker.send({
        kind: 'stability', // 监控指标的大类
        type: 'error', // 小类型，这是一个错误
        errorType: 'jsError', // JS 执行错误
        message: event.message, // 报错信息
        filename: event.filename, // 报错文件
        position: `${event.lineno}:${event.colno}`, // 行、列信息
        stack: getLines(event.error.stack), // 栈信息
        selector: lastEvent ? getSelector(lastEvent.path) : '',  // 最后一个操作的元素
      })
    }
  }, true)

  window.addEventListener('unhandledrejection', (event) => {
    console.log('event: ', event)
    let lastEvent = getLastEvent()

    let message = ''
    let filename = ''
    let line = 0
    let column = 0
    let stack = ''
    let reason = event.reason
    if (typeof reason === 'string') {
      message = event.reason
    } else if (typeof reason === 'object') {
      if (reason.stack) {
        let matchRes = reason.stack.match(/at\s+(.+):(\d+):(\d+)/)
        filename = matchRes[1]
        line = matchRes[2]
        column = matchRes[3]
        stack = getLines(reason.stack)
      }
      message = reason.message
    }

    tracker.send({
      kind: 'stability', // 监控指标的大类
      type: 'error', // 小类型，这是一个错误
      errorType: 'promiseError', // JS 执行错误
      message, // 报错信息
      filename, // 报错文件
      position: `${line}:${column}`, // 行、列信息
      stack, // 栈信息
      selector: lastEvent ? getSelector(lastEvent.path) : '',  // 最后一个操作的元素
    })
  }, true)

  function getLines(stack) {
    return stack.split('\n').slice(1).map(item => item.replace(/^\s+at\s+/g, '')).join('^')
  }
}
