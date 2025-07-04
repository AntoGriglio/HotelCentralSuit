/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Loader from './loader'

type Props = {
  fetchData: () => Promise<any>
  render: (data: any) => React.ReactNode
}

export default function WithLoader({ fetchData, render }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  return <>{render(data)}</>
}
