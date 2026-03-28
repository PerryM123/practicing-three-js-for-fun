import { useEffect, useState } from 'react'
import { useExcavatorTelemetryQuery } from '~/features/excavatorApi'

export const useNotifications = () => {
  const { data } = useExcavatorTelemetryQuery()
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    // if (data?.telemetry?.battery < 20) {
    //   console.log('perry: battery 1')
    // } else if (data?.telemetry?.battery < 50) {
    //   console.log('perry: battery 2')
    // }
    setNotifications((prev) => {
      if (!data?.telemetry?.battery) {
        return []
      }
      // Avoid duplicate notifications
      if (data?.telemetry?.battery < 20) {
        if (!prev.includes('Battery is below 20%')) {
          return [...prev, 'Battery is below 20%']
        }
      } else if (data?.telemetry?.battery < 80) {
        if (!prev.includes('Battery is below 80%')) {
          return [...prev, 'Battery is below 80%']
        }
      } else if (data?.telemetry?.battery < 85) {
        if (!prev.includes('Battery is below 85%')) {
          return [...prev, 'Battery is below 85%']
        }
      } else if (data?.telemetry?.battery < 90) {
        if (!prev.includes('Battery is below 90%')) {
          return [...prev, 'Battery is below 90%']
        }
      } else if (data?.telemetry?.battery < 95) {
        if (!prev.includes('Battery is below 95%')) {
          return [...prev, 'Battery is below 95%']
        }
      }
      return prev
    })
  }, [data?.telemetry?.battery])

  // Connection status notifications
  useEffect(() => {
    setNotifications((prev) => {
      if (data?.connectionStatus === 'connected') {
        if (!prev.includes('Connected')) {
          return [...prev, 'Connected']
        }
      } else if (data?.connectionStatus === 'disconnected') {
        if (!prev.includes('Disconnected')) {
          return [...prev, 'Disconnected']
        }
      } else if (data?.connectionStatus === 'error') {
        if (!prev.includes('Connection Error')) {
          return [...prev, 'Connection Error']
        }
      }
      return prev
    })
  }, [data?.connectionStatus])

  // TODO: Should it be square brackets? Or curly?
  return [notifications]
}
