import React, { useRef, useEffect } from 'react'
import { Outlet, useNavigation } from 'react-router-dom'
import ProgressBar, { type ProgressBarRef } from '@/components/common/progress-bar'

const RootLayout: React.FC = () => {
  const navigation = useNavigation()
  const progressRef = useRef<ProgressBarRef>(null)

  useEffect(() => {
    if (navigation.state === 'loading') {
      progressRef.current?.loadStart()
    } else if (navigation.state === 'idle') {
      progressRef.current?.loadEnd()
    }
  }, [navigation.state])

  return (
    <>
      <ProgressBar ref={progressRef} />
      <Outlet />
    </>
  )
}

export default RootLayout
