import { EventBus } from '../../lib/event'
import math from 'lodash/math'
import string from 'lodash/string'
import collection from 'lodash/collection'
const SerialPort = require('serialport')
const net = require('net')
const state = {
  windowSize: { height: window.innerHeight, width: window.innerWidth },
  comNumber: 20,
  serialState: '未连接',
  serialIsDisabled: false,
  netState: '未开启',
  netIsDisabled: false,
  serialTime: '000000.00',
  netTime: '000000.00',
  averageDelay: 0,
  serialDelay: [],
  netDelay: [],
  minuteDelay: []
}

const mutations = {
  WINDOW_SIZE(state, value) {
    state.windowSize = value
  },
  SERIAL_STATE(state, value) {
    state.serialState = value
    state.serialIsDisabled = value !== '未连接'
  },
  NET_STATE(state, value) {
    state.netState = value
    state.netIsDisabled = value !== '未开启'
  },
  SERIAL_TIME(state, value) {
    state.serialTime = value
  },
  NET_TIME(state, value) {
    state.netTime = value
  },
  AVERAGE_DELAY(state) {
    state.minuteDelay = []
    collection.forEach(state.netDelay, value => {
      let temp = collection.find(state.serialDelay, ['utc', value.utc])
      if (temp) state.minuteDelay.push(value.time - temp.time)
    })
    state.averageDelay = math.round(math.mean(state.minuteDelay))
    state.serialDelay = []
    state.netDelay = []
  },
  SERIAL_DELAY(state, value) {
    if (state.serialDelay.length > 1000) {
      state.serialDelay = []
    }
    state.serialDelay.push(value)
  },
  NET_DELAY(state, value) {
    if (state.netDelay.length > 1000) {
      state.netDelay = []
    }
    state.netDelay.push(value)
  },
  CLEAN_DELAY(state) {
    state.serialDelay = []
    state.netDelay = []
    state.averageDelay = 0
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
      return
    }
    port = new SerialPort(value.port, {
      baudRate: value.baudRate,
      autoOpen: false
    })
    port.on('error', err => {
      EventBus.$emit('message-box', '串口错误：' + err)
      port.close()
    })
    port.open(err => {
      if (err) {
        EventBus.$emit('message-box', '打开串口失败：' + err)
      } else {
        commit('SERIAL_STATE', '已连接')
        // 发送gpgga指令
        port.write('log gpgga ontime 0.2\r\n', err => {
          if (err) {
            EventBus.$emit('message-box', '发送GPGGA指令失败：' + err)
          }
        })
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
              let utc = Number(splits[1])
              commit('SERIAL_TIME', utc)
              if (utc % 1 === 0) {
                // 获取系统时间，根据系统时间计算延时
                let time = new Date()
                commit('SERIAL_DELAY', { utc: utc, time: time.getTime() })
              }
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
      return
    }
    server = net.createServer(socket => {
      // 接收数据
      let alldata = ''
      socket.on('data', data => {
        data = data.toString()
        // 拼包
        if (data[0] === '$') {
          alldata = data
        } else if (alldata.length > 0) {
          alldata += data
        }
        // 解析YBCTCC或者GPGGA
        if (alldata[0] === '$' && alldata.length > 24) {
          let splits = string.split(alldata, ',', 4)
          alldata = ''
          let utc
          if (splits[0] === '$GPGGA' || splits[0] === '$GNGGA') {
            utc = Number(splits[1])
          } else if (splits[0] === '$YBCTCC') utc = Number(splits[3])
          else return
          commit('NET_TIME', utc)
          // 每秒计算一次延迟，存储每秒延迟
          if (utc % 1 === 0) {
            let time = new Date()
            commit('NET_DELAY', {
              utc: utc,
              time: time.getTime()
            })
          }
          // 每分开始时计算上一分钟平均延时
          if (utc % 100 === 0) {
            commit('AVERAGE_DELAY')
          }
        }
      })

      socket.on('error', err => {
        if (err) {
          EventBus.$emit('message-box', '网络错误：' + err)
        }
      })
      // 连接断开
      socket.on('close', err => {
        EventBus.$emit(
          'message-box',
          '网络连接断开：' + err + ',' + socket.remoteAddress
        )
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
      commit('CLEAN_DELAY')
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
