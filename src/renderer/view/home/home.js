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
      netPort: 8000,
      baudRate: 115200
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
      'comName',
      'windowSize',
      'serialState',
      'netState',
      'serialTime',
      'netTime',
      'averageDelay'
    ])
  },
  methods: {
    ...mapActions('home', ['actionWindowSize', 'actionSerial', 'actionNet']),
    handleSerial() {
      if (!this.comSelected || !this.baudRate) {
        this.$Message.warning('请选择串口参数')
        return
      }
      this.actionSerial({
        port: this.comSelected,
        baudRate: this.baudRate
      })
    },
    handleNet() {
      if (!this.netPort) {
        this.$Message.warning('请选择网络参数')
        return
      }
      this.actionNet(this.netPort)
    }
  }
}
