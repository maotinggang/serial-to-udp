import { mapState, mapActions } from 'vuex'
import { EventBus } from '@/lib/event'
const collection = require('lodash/collection')
const os = require('os')
export default {
  name: 'home',
  data() {
    return {
      comSelected: '',
      baudRate: 115200,
      packageTime: 50,
      hostIp: '127.0.0.1',
      hostIps: [],
      hostPort: 8080,
      serverIp: '47.92.151.105',
      serverPort: 8000,
      checkedDisplay: ['hex']
    }
  },
  watch: {
    // 使用箭头函数时this无法识别
    infosChange: function() {
      this.$nextTick(() => {
        let infosArea = document.getElementById('infos-display')
        infosArea.scrollTop = infosArea.scrollHeight
      })
    }
  },
  created() {
    // 读取设备ip
    let netParams = os.networkInterfaces()
    collection.forEach(netParams, value => {
      let temp = collection.filter(value, { family: 'IPv4' })
      if (temp[0].address) this.hostIps.push(temp[0].address)
    })
    // 监听错误事件
    EventBus.$on('message-box', value => {
      this.$Message.warning({
        content: value,
        duration: 5
      })
    })
    // 监听窗口尺寸变化
    window.onresize = () => {
      this.actionWindowSize({
        height: window.innerHeight,
        width: window.innerWidth
      })
    }
    window.onload = () => {
      this.actionWindowSize({
        height: window.innerHeight,
        width: window.innerWidth
      })
    }
  },
  computed: {
    ...mapState('home', [
      'comNumber',
      'windowSize',
      'serialState',
      'serialIsDisabled',
      'netState',
      'netIsDisabled',
      'displayState',
      'infos'
    ]),
    infosChange() {
      return this.infos
    }
  },
  methods: {
    ...mapActions('home', [
      'actionCheckedChange',
      'actionDisplayPause',
      'actionDisplayClear',
      'actionWindowSize',
      'actionSerial',
      'actionNet'
    ]),
    handleSerial() {
      if (!this.comSelected || !this.baudRate || !this.packageTime) {
        this.$Message.warning('请填写串口参数')
        return
      }
      this.actionSerial({
        port: this.comSelected,
        baudRate: this.baudRate,
        packageTime: this.packageTime < 50 ? 50 : this.packageTime
      })
    },
    handleNet() {
      if (
        !this.hostIp ||
        !this.hostPort ||
        !this.serverIp ||
        !this.serverPort
      ) {
        this.$Message.warning('请填写网络参数')
        return
      }
      this.actionNet({
        hostIp: this.hostIp,
        hostPort: this.hostPort,
        serverIp: this.serverIp,
        serverPort: this.serverPort
      })
    },
    checkedChange(value) {
      this.actionCheckedChange(value)
    },
    displayPause() {
      this.actionDisplayPause()
    },
    displayClear() {
      this.actionDisplayClear()
    }
  }
}
