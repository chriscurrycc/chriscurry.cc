import Script from 'next/script'
import { siteMetadata } from '~/data/siteMetadata'

export function SimpleAnalyticsScript() {
  return (
    <>
      <Script strategy="lazyOnload" id="sa-script">
        {`window.sa_event=window.sa_event||function(){var a=[].slice.call(arguments);window.sa_event.q?window.sa_event.q.push(a):window.sa_event.q=[a]};`}
      </Script>
      {/* <Script strategy="lazyOnload" src="https://scripts.simpleanalyticscdn.com/latest.js" /> */}
      <Script
        async
        src="https://analytics.umami.is/script.js"
        data-website-id={siteMetadata.analytics.umamiWebsiteId}
      ></Script>
    </>
  )
}

// https://docs.simpleanalytics.com/events
export function logEvent(eventName: string, callback: () => void) {
  if (callback) {
    // @ts-ignore
    return window.sa_event?.(eventName, callback)
  } else {
    // @ts-ignore
    return window.sa_event?.(eventName)
  }
}
