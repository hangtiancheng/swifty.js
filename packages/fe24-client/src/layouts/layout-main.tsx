import React, { useState, useRef, useEffect } from 'react'
import { Layout } from 'antd'
import AsideMenu from '@/components/aside'
import HeaderMain from '@/components/header'
import LayoutTabs from './layout-tabs'
import styles from './index.module.scss'
import bus from '@/utils/bus'

const { Header, Sider, Content } = Layout

const LayoutMain: React.FC = () => {
  const [watermarked, setWatermarked] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storeScrollTop = () => {
      if (contentRef.current) {
        sessionStorage.setItem('scroll-top', contentRef.current.scrollTop.toString())
        contentRef.current.scrollTop = 0
      }
    }
    const setScrollTop = () => {
      if (contentRef.current) {
        contentRef.current.scrollTop = Number.parseFloat(
          sessionStorage.getItem('scroll-top') || '0',
        )
      }
    }
    bus.subscribe('store-scrollTop', storeScrollTop)
    bus.subscribe('set-scrollTop', setScrollTop)
    return () => {
      bus.unsubscribe('store-scrollTop', storeScrollTop)
      bus.unsubscribe('set-scrollTop', setScrollTop)
    }
  }, [])

  return (
    <Layout className="h-screen overflow-hidden">
      <Sider width={200} theme="light" className="z-20 shadow-lg">
        <AsideMenu />
      </Sider>
      <Layout>
        <Header className={`${styles.header} z-10 flex h-[10vh] flex-col p-0`}>
          <HeaderMain onSwitchWatermark={setWatermarked} />
        </Header>
        <Content className="relative h-[90vh] overflow-auto bg-gray-50" ref={contentRef}>
          <LayoutTabs watermarked={watermarked} />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutMain
