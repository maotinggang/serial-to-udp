import { DelayAverage, DelayStatistics } from '@/components/charts'
import { mapState, mapActions } from 'vuex'
import { EventBus } from '@/lib/event'

export default {
  name: 'home',
  components: {
    DelayAverage,
    DelayStatistics
  },
  data() {
    return {
      comSelected: '',
      baudRate: 115200,
      packageTime: 100,
      hostIp: '127.0.0.1',
      hostPort: 8080,
      serverIp: '127.0.0.1',
      serverPort: 8080
    }
  },
  created() {
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
      'serialTime',
      'netTime',
      'averageDelay'
    ])
  },
  methods: {
    ...mapActions('home', ['actionWindowSize', 'actionSerial', 'actionNet']),
    handleSerial() {
      if (!this.comSelected || !this.baudRate || !this.packageTime) {
        this.$Message.warning('请填写串口参数')
        return
      }
      this.actionSerial({
        port: this.comSelected,
        baudRate: this.baudRate,
        packageTime: this.packageTime
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
    }
  }
}
