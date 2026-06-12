import { create } from 'zustand'
import type { IMenuItem } from '@/types/user'

type ITabItem = Omit<IMenuItem, 'children'>

interface ITabStore {
  tabList: ITabItem[]
  addTab: (name: string, icon: string, url: string) => void
  findTab: (url: string) => number
  removeTab: (idx: number) => void
}

export const useTabStore = create<ITabStore>((set, get) => ({
  tabList: [],
  addTab: (name, icon, url) =>
    set((state) => {
      if (state.tabList.some((tab) => tab.url === url)) {
        return state
      }
      return { tabList: [...state.tabList, { name, icon, url }] }
    }),
  findTab: (url) => {
    return get().tabList.findIndex((tab) => tab.url === url)
  },
  removeTab: (idx) =>
    set((state) => {
      const newTabList = [...state.tabList]
      newTabList.splice(idx, 1)
      return { tabList: newTabList }
    }),
}))
