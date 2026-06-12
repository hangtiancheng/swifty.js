import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Input,
  InputNumber,
  Select,
  Button,
  Table,
  Tag,
  DatePicker,
  Popconfirm,
  Modal,
  message,
  Space,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { ExcelOne } from '@icon-park/react'
import { orderQueryApi, orderDeleteApi } from '@/apis/order'
import type { IOrderItem } from '@/types/order'
import { usePagination } from '@/hooks/use-pagination'
import { ORDER_STATES, ORDER_STATE_2_TEXT_AND_TYPE } from '@/constants'
import { getDate, getTime } from '@/utils'
import { tableData2xlsx } from '@/utils/to-xlsx'
import DraggableWindow from './components/draggable-window'

const { RangePicker } = DatePicker

const STATE_COLOR: Record<string, string> = {
  danger: 'red',
  success: 'green',
  warning: 'orange',
  info: 'blue',
}

const OrderMain: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<{
    startDate?: string
    endDate?: string
    id?: string
    state?: 0 | 1 | 2 | 3
    robotId?: number
    robotName?: string
  }>({})

  const [orderList, setOrderList] = useState<IOrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const fetchList = useCallback(
    async (pageNum: number, pageSize: number) => {
      setLoading(true)
      try {
        const res = await orderQueryApi({
          ...formData,
          pageNum,
          pageSize,
        })
        setOrderList(res.data.list)
        return res.data.total || 0
      } finally {
        setLoading(false)
      }
    },
    [formData],
  )

  const { pageInfo, handleSizeChange, handleCurrentChange, setTotal, resetPagination } =
    usePagination(async () => {}, 10)

  const loadData = useCallback(async () => {
    const total = await fetchList(pageInfo.pageNum, pageInfo.pageSize)
    setTotal(total)
  }, [fetchList, pageInfo.pageNum, pageInfo.pageSize, setTotal])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (orderId: string) => {
    const { code, message: msg } = await orderDeleteApi({ idList: [orderId] })
    if (code === 200) {
      message.success(msg)
      loadData()
    }
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return

    Modal.confirm({
      title: 'Warning',
      content: '确定批量删除订单吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const { code, message: msg } = await orderDeleteApi({ idList: selectedRowKeys as string[] })
        if (code === 200) {
          message.success(msg)
          setSelectedRowKeys([])
          loadData()
        }
      },
      onCancel: () => {
        message.warning('批量删除订单取消')
      },
    })
  }

  const handleReset = () => {
    setFormData({})
    resetPagination()
  }

  const [ctxMenuAlive, setCtxMenuAlive] = useState(false)
  const [ctxMenuPos, setCtxMenuPos] = useState({ x: '0px', y: '0px' })
  const [orderData, setOrderData] = useState<IOrderItem>()
  const [draggableWindowAlive, setDraggableWindowAlive] = useState(false)

  useEffect(() => {
    const handleWindowClick = () => setCtxMenuAlive(false)
    if (ctxMenuAlive) {
      window.addEventListener('click', handleWindowClick)
    }
    return () => {
      window.removeEventListener('click', handleWindowClick)
    }
  }, [ctxMenuAlive])

  const handleCtxMenu = (ev: React.MouseEvent, rowData: IOrderItem) => {
    ev.preventDefault()
    ev.stopPropagation()
    setCtxMenuPos({ x: `${ev.pageX}px`, y: `${ev.pageY}px` })
    setOrderData(rowData)
    setCtxMenuAlive(true)
  }

  const handleDetail = (rowData: IOrderItem) => {
    setOrderData(rowData)
    setDraggableWindowAlive(true)
  }

  const handleDetailInFloatingWindow = () => {
    setDraggableWindowAlive(true)
  }

  const handleDetailInNewTab = () => {
    if (!orderData) return
    navigate(`/order/detail?orderId=${orderData.id}&robotId=${orderData.robotId}`)
  }

  const export2xlsx = () => {
    if (!orderList || !orderList.length) return
    const tableData = orderList.filter((item) => selectedRowKeys.includes(item.id))
    if (!tableData.length) return
    const filename = `订单数据__${getDate()}__${getTime().replace(/:/g, '-')}.xlsx`
    tableData2xlsx(tableData, filename)
  }

  const columns: ColumnsType<IOrderItem> = [
    { title: '订单号', dataIndex: 'id', width: 120 },
    { title: '机器人 ID', dataIndex: 'robotId', width: 100 },
    { title: '机器人名字', dataIndex: 'robotName', width: 150 },
    {
      title: '订单状态',
      dataIndex: 'state',
      width: 120,
      render: (state: number) => {
        const info = ORDER_STATE_2_TEXT_AND_TYPE.get(state)
        const color = STATE_COLOR[info?.type || 'info'] ?? 'blue'
        return <Tag color={color}>{info?.text}</Tag>
      },
    },
    { title: '订单日期', dataIndex: 'date', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            className="bg-(--color-green)"
            onClick={() => handleDetail(record)}
            onContextMenu={(ev) => handleCtxMenu(ev, record)}
          >
            详情
          </Button>
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
            <Button type="primary" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  return (
    <main>
      <Card className="mb-5 rounded-3xl!">
        <div className="grid grid-cols-3 justify-items-center gap-4">
          <Input
            placeholder="请输入订单号"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className="w-[70%]!"
          />
          <Select
            placeholder="请选择订单状态"
            value={formData.state}
            onChange={(val) => setFormData({ ...formData, state: val })}
            className="w-[70%]"
            allowClear
            options={ORDER_STATES.slice(1).map((state, idx) => {
              const info = ORDER_STATE_2_TEXT_AND_TYPE.get(idx + 1)
              const color = STATE_COLOR[info?.type || 'info'] ?? 'blue'
              return {
                label: <Tag color={color}>{state}</Tag>,
                value: idx + 1,
              }
            })}
          />
          <RangePicker
            className="w-[70%]"
            onChange={(_, dateStrings) => {
              setFormData({
                ...formData,
                startDate: dateStrings[0],
                endDate: dateStrings[1],
              })
            }}
          />
          <InputNumber
            placeholder="请输入机器人 ID"
            value={formData.robotId}
            onChange={(val) => setFormData({ ...formData, robotId: val ?? undefined })}
            className="w-[70%]!"
            controls={{ upIcon: '+', downIcon: '-' }}
          />
          <Input
            placeholder="请输入机器人名字"
            value={formData.robotName}
            onChange={(e) => setFormData({ ...formData, robotName: e.target.value })}
            className="w-[70%]!"
          />
          <div className="flex gap-4">
            <Button type="primary" className="bg-(--color-green)" onClick={loadData}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </div>
        </div>
      </Card>

      <Card className="mt-5 rounded-3xl!">
        <div className="mb-4 flex gap-4">
          <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBatchDelete}>
            批量删除
          </Button>
          <Button
            type="primary"
            icon={<ExcelOne />}
            onClick={export2xlsx}
            disabled={selectedRowKeys.length === 0}
          >
            导出订单数据到 Excel
          </Button>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={orderList}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageInfo.pageNum,
            pageSize: pageInfo.pageSize,
            total: pageInfo.total,
            onChange: handleCurrentChange,
            onShowSizeChange: (_, size) => handleSizeChange(size),
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {ctxMenuAlive && (
        <ul
          className="animate__animated animate__flipInX fixed z-10 list-none rounded-lg bg-slate-100 p-0 text-slate-500 shadow-lg"
          style={{ left: ctxMenuPos.x, top: ctxMenuPos.y }}
        >
          <li className="cursor-pointer rounded-lg px-2 py-1.25 hover:bg-(--color-green-light)">
            选择打开方式
          </li>
          <li>
            <hr />
          </li>
          <li
            className="cursor-pointer rounded-lg px-2 py-1.25 hover:bg-(--color-green-light)"
            onClick={handleDetailInFloatingWindow}
          >
            在悬浮窗中打开
          </li>
          <li
            className="cursor-pointer rounded-lg px-2 py-1.25 hover:bg-(--color-green-light)"
            onClick={handleDetailInNewTab}
          >
            在新标签页中打开
          </li>
        </ul>
      )}

      {draggableWindowAlive && orderData && (
        <DraggableWindow
          orderData={orderData}
          onCloseWindow={() => setDraggableWindowAlive(false)}
          header={<span>订单 {orderData.id} 详情</span>}
          footer={<div>查询时间: {`${getDate()} ${getTime()}`}</div>}
        />
      )}
    </main>
  )
}

export default OrderMain
