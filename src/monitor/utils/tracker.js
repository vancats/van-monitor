const userAgent = require('user-agent')

const host = 'cn-hangzhou.log.aliyuncs.com'
const project = 'van-monitor'
const logStore = 'van-monitor-store'

function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).name,
    hostname: location.hostname,//主机的域名
  }
}

class SendTracker {
  constructor() {
    this.url = `https://${project}.${host}/logstores/${logStore}/track`
    this.xhr = new XMLHttpRequest
  }

  send(data = {}) {
    const extraData = getExtraData()
    const log = { ...extraData, ...data }
    for (const key in log) {
      if (typeof log[key] === 'number') {
        log[key] = `${log[key]}`
      }
    }

    console.log('log: ', log)
    const body = JSON.stringify({
      __logs__: [log]
    })
    this.xhr.open('POST', this.url, true)
    this.xhr.setRequestHeader('Content-Type', 'application/json')
    this.xhr.setRequestHeader('x-log-apiversion', '0.6.0')
    this.xhr.setRequestHeader('x-log-bodyrawsize', body.length)
    this.xhr.onload = () => {
      // console.log('onload')
    }
    this.xhr.onerror = () => {
      // console.log('onerror')
    }

    this.xhr.send(body)
  }
}

export default new SendTracker()
