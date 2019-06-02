import { EventBus } from '../../lib/event'
const dgram = require('dgram')
const SerialPort = require('serialport')
const moment = require('moment')
const state = {
  windowSize: { height: window.innerHeight, width: window.innerWidth },
  comNumber: 20,
  serialState: '未连接',
  serialIsDisabled: false,
  packageTime: 50,
  netState: '未开启',
  netIsDisabled: false,
  infos: [],
  displayState: '暂停'
}

let hex = true
let ascii = false
let timestamp = false
let isDisplay = true
const mutations = {
  WINDOW_SIZE(state, value) {
    state.windowSize = value
  },
  SERIAL_STATE(state, value) {
    state.serialState = value
    state.serialIsDisabled = value !== '未连接'
  },
  PACKAGE_TIME(state, value) {
    state.packageTime = value
  },
  NET_STATE(state, value) {
    state.netState = value
    state.netIsDisabled = value !== '未开启'
  },
  DISPLAY_STATE(state) {
    isDisplay = !isDisplay
    state.displayState = isDisplay ? '暂停' : '开启'
  },
  DISPLAY_CLEAR(state) {
    state.infos = []
  },
  DISPLAY_CONTENT(state, value) {
    if (!isDisplay) return
    if (state.infos.length > 1000) state.infos = []
    let now = ''
    if (timestamp) now = moment().format('YYYY-MM-DD HH:mm:ss.SSS')
    if (hex) {
      state.infos.unshift(
        `${value.type}-Hex[${now}]:  ${value.data.toString('hex')}`
      )
    }
    if (ascii) {
      state.infos.unshift(
        `${value.type}-Ascii[${now}]: ${value.data.toString()}`
      )
    }
  }
}

let port
let socket
let serverIp = '47.92.151.105'
let serverPort = '8000'
const actions = {
  actionWindowSize({ commit }, value) {
    commit('WINDOW_SIZE', value)
  },
  actionCheckedChange({ commit }, value) {
    if (value[0] === 'hex' || value[1] === 'hex' || value[2] === 'hex') {
      hex = true
    } else hex = false
    if (value[0] === 'ascii' || value[1] === 'ascii' || value[2] === 'ascii') {
      ascii = true
    } else ascii = false
    if (
      value[0] === 'timestamp' ||
      value[1] === 'timestamp' ||
      value[2] === 'timestamp'
    ) {
      timestamp = true
    } else timestamp = false
  },
  actionDisplayPause({ commit }) {
    commit('DISPLAY_STATE')
  },
  actionDisplayClear({ commit }) {
    commit('DISPLAY_CLEAR')
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
      commit('SERIAL_STATE', '未连接')
    })
    port.open(err => {
      if (err) EventBus.$emit('message-box', '打开串口失败：' + err)
      else commit('SERIAL_STATE', '已连接')
    })
    // Read data that is available but keep the stream in "paused mode"
    port.on('readable', () => {
      setTimeout(() => {
        let msg = port.read()
        socket.send(msg, serverPort, serverIp, err => {
          if (err) console.error(`socket-send:${err}`)
          else commit('DISPLAY_CONTENT', { type: 'Send', data: msg })
        })
      }, value.packageTime)
    })
    // let allData
    // port.on('data', data => {
    //   if (!allData) {
    //     allData = data
    //     // 串口接收数据分段，延时等待接收完整后再进行处理
    //     setTimeout(() => {
    //       netData.push(allData)
    //       allData = null
    //     }, value.packageTime)
    //   } else {
    //     allData = Buffer.concat([allData, data])
    //   }
    // })
  },
  actionNet({ commit, state }, value) {
    if (state.netState === '已开启') {
      socket.close()
      commit('NET_STATE', '未开启')
      return
    }
    socket = dgram.createSocket('udp4')
    serverIp = value.serverIp
    serverPort = value.serverPort
    socket.on('error', err => {
      console.error(`socket:${err}`)
      commit('NET_STATE', '未开启')
      socket.close()
    })
    socket.on('message', msg => {
      if (!port.isOpen) return
      port.write(msg, err => {
        if (err) console.error(`port-write:${err}`)
        else commit('DISPLAY_CONTENT', { type: 'Receive', data: msg })
      })
    })
    socket.bind(
      {
        address: value.hostIp,
        port: value.hostPort
      },
      () => {
        commit('NET_STATE', '已开启')
      }
    )
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
