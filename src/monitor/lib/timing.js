import tracker from "../utils/tracker"
import onload from "../utils/onload"
import getLastEvent from "../utils/getLastEvent"
import getSelector from "../utils/getSelector"

export function timing() {
  let FMP, LCP, FID
  // 增加一个性能条目观察者
  if (PerformanceObserver) {

    new PerformanceObserver((entryList, observer) => {
      let prefEntries = entryList.getEntries()
      FMP = prefEntries[0]
      observer.disconnect()
    }).observe({ entryTypes: ['element'] })

    new PerformanceObserver((entryList, observer) => {
      let prefEntries = entryList.getEntries()
      console.log('prefEntries: ', prefEntries)
      LCP = prefEntries[0]
      observer.disconnect()
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    new PerformanceObserver((entryList, observer) => {
      let lastEvent = getLastEvent()
      let firstInput = entryList.getEntries()[0]
      console.log('firstInput: ', firstInput)

      if (firstInput) {
        // 开始处理的时间 - 开始点击的时间
        let inputDelay = firstInput.processingStart - firstInput.startTime
        // 处理的耗时
        let duration = firstInput.duration
        if (inputDelay > 0 || duration > 0) {

          tracker.send({
            kind: 'experience', // 用户体验
            type: 'firstInputDelay', // 统计每个阶段的时间
            inputDelay, // 延时时间
            duration, // 处理时间
            startTime: firstInput.startTime,
            selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : '',
          })

        }
      }
      observer.disconnect()
    }).observe({ type: 'first-input', buffered: true }) // 用户第一次交互
  }

  onload(function () {
    setTimeout(() => {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        domComplete,
        loadEventStart,
        loadEventEnd,
      } = performance.timing

      tracker.send({
        kind: 'experience', // 用户体验
        type: 'timing', // 统计每个阶段的时间
        connectTime: connectEnd - connectStart, // TCP 连接时间
        ttfbTime: responseStart - requestStart, // 第一个首字节的时间
        responseTime: responseEnd - responseStart, // 响应读取时间
        parseDOMTime: loadEventStart - domLoading, // DOM 解析时间
        domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart, // onload 时间
        timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
        loadTime: loadEventStart - fetchStart, // 完整的加载时间
      })
      let FP = performance.getEntriesByName('first-paint')[0]
      let FCP = performance.getEntriesByName('first-contentful-paint')[0]
      console.log('FP', FP)
      console.log('FCP', FCP)
      console.log('FMP', FMP)
      console.log('LCP', LCP)

      tracker.send({
        kind: 'experience', // 用户体验
        type: 'paint',
        firstPaint: FP.startTime,
        firstContentfulPaint: FCP.startTime,
        firstMeaningfulPaint: FMP.startTime,
        largestContentfulPaint: LCP.startTime,
      })

    }, 3000)
  })
}
