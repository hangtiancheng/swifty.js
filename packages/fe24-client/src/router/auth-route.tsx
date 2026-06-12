import { redirect, LoaderFunctionArgs } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { WHITE_LIST } from '@/constants'
import { message } from 'antd'

export const createAuthLoader =
  (auths?: string[]) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url)
    const pathname = url.pathname

    const { token, auth } = useUserStore.getState()

    if (!WHITE_LIST.has(pathname) && !token) {
      return redirect('/login')
    }

    if (token && pathname === '/login') {
      return redirect('/')
    }

    if (token && auths && !auths.includes(auth)) {
      message.warning('您触犯了企鹅高压线!')
      const currentPath = window.location.pathname
      return redirect(currentPath === pathname ? '/' : currentPath)
    }

    return null
  }

export const authLoader = createAuthLoader()
