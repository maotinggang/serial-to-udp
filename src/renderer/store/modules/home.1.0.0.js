import { EventBus } from '../../lib/event'
import math from 'lodash/math'
import string from 'lodash/string'
const SerialPort = require('serialport')
const net = require('net')
const state = {
  windowSize: { height: window.innerHeight, width: window.innerWidth },
  comName: [
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'COM10'
  ],
  serialState: '未连接',
  netState: '未开启',
  serialTime: '000000.00',
  netTime: '000000.00',
  averageDelay: 0,
  minuteDelay: []
}

const mutations = {
  WINDOW_SIZE(state, value) {
    state.windowSize = value
  },
  SERIAL_STATE(state, value) {
    state.serialState = value
  },
  NET_STATE(state, value) {
    state.netState = value
  },
  SERIAL_TIME(state, value) {
    state.serialTime = value
  },
  NET_TIME(state, value) {
    state.netTime = value
  },
  AVERAGE_DELAY(state) {
    state.averageDelay = math.round(math.mean(state.minuteDelay))
  },
  MINUTE_DELAY(state, value) {
    state.minuteDelay = value
  }
}

let port, server
const actions = {
  actionWindowSize({ commit }, value) {
    commit('WINDOW_SIZE', value)
  },
  actionSerial({ commit, state }, value) {
    if (state.serialState === '已连接') {
      port.close()
      commit('SERIAL_STATE', '未连接')
      port = null
      return
    }
    port = new SerialPort(value.port, {
      baudRate: value.baudRate,
      autoOpen: false
    })
    port.open(err => {
      if (err) {
        EventBus.$emit('message-box', '打开串口失败：' + err)
      } else {
        commit('SERIAL_STATE', '已连接')
        let alldata = ''
        port.on('data', data => {
          data = data.toString()
          // 拼包
          if (data[0] === '$') {
            alldata = data
          } else if (alldata.length > 0) {
            alldata += data
          }
          // 处理数据
          if (alldata[0] === '$' && alldata.length > 16) {
            // 解析gpgga
            let splits = string.split(alldata, ',', 2)
            alldata = ''
            if (splits[0] === '$GPGGA' || splits[0] === '$GNGGA') {
              commit('SERIAL_TIME', splits[1])
            }
          }
        })
      }
    })
  },
  actionNet({ commit, state }, value) {
    if (state.netState === '已开启') {
      server.close()
      commit('NET_STATE', '未开启')
      server = null
      return
    }
    server = net.createServer(socket => {
      // 接收数据
      let delay = []
      let alldata = ''
      socket.on('data', data => {
        data = data.toString()
        // 拼包
        if (data[0] === '$') {
          alldata = data
        } else if (alldata.length > 0) {
          alldata += data
        }
        // 解析YBCTCC
        if (alldata[0] === '$' && alldata.length > 24) {
          let splits = string.split(alldata, ',', 4)
          alldata = ''
          if (splits[0] === '$YBCTCC') {
            commit('NET_TIME', splits[3])
            // 每秒计算一次延迟，存储每秒延迟
            let utc = Number(splits[3])
            if (utc % 1 === 0) {
              delay.push((Number(state.serialTime) - utc) * 1000)
            }
            // 每分开始时计算上一分钟平均延时
            if (utc % 100 === 0) {
              commit('MINUTE_DELAY', delay)
              delay = []
              commit('AVERAGE_DELAY')
            }
          }
        }
      })

      socket.on('error', err => {
        if (err) {
          EventBus.$emit('message-box', '网络错误：' + err)
        }
        delay = []
      })
      // 连接断开
      socket.on('close', err => {
        EventBus.$emit(
          'message-box',
          '网络连接断开：' + err + ',' + socket.remoteAddress
        )
        delay = []
      })
      // 连接超时
      socket.setTimeout(10000, () => {
        socket.end()
      })
    })
    server.on('error', err => {
      EventBus.$emit('message-box', '网络服务错误：' + err)
      commit('NET_STATE', '未开启')
    })
    server.on('connection', socket => {
      EventBus.$emit('message-box', '设备连接IP:' + socket.remoteAddress)
    })
    server.listen(value, () => {})
    commit('NET_STATE', '已开启')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
