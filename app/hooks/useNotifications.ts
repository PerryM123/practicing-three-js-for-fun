import { useEffect, useState } from 'react'
import { useExcavatorTelemetryQuery } from '~/features/excavatorApi'

export const useNotifications = () => {
  const { data } = useExcavatorTelemetryQuery()
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
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

  // TODO: Should it be square brackets? Or curly?
  return [notifications]
}
