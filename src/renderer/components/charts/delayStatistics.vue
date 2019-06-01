<template>
  <ve-pie :data="chartData" :grid="{top: 35,bottom: 15}" :height="height" :settings="chartSettings"></ve-pie>
</template>

<script>
  import collection from "lodash/collection";
  import { mapState } from "vuex";
  export default {
    props: {
      height: {
        type: String,
        default: "200px"
      }
    },
    data() {
      return {};
    },
    computed: {
      ...mapState("home", ["minuteDelay", "windowSize"]),
      chartSettings() {
        return {
          roseType: "radius",
          radius: this.windowSize.width / 7,
          offsetY: (this.windowSize.height - 170) / 2
        };
      },
      chartData() {
        let ret = {
          columns: ["delay", "times"],
          rows: [
            { delay: "<50", times: 0 },
            { delay: "50-100", times: 0 },
            { delay: "100-200", times: 0 },
            { delay: "200-500", times: 0 },
            { delay: "500-1000", times: 0 },
            { delay: ">1000", times: 0 }
          ]
        };
        let temp = collection.countBy(this.minuteDelay, o => {
          return o < 50;
        });
        ret.rows[0].times = temp.true;
        temp = collection.countBy(this.minuteDelay, o => {
          return o >= 50 && o < 100;
        });
        ret.rows[1].times = temp.true;
        temp = collection.countBy(this.minuteDelay, o => {
          return o >= 100 && o < 200;
        });
        ret.rows[2].times = temp.true;
        temp = collection.countBy(this.minuteDelay, o => {
          return o >= 200 && o < 500;
        });
        ret.rows[3].times = temp.true;
        temp = collection.countBy(this.minuteDelay, o => {
          return o >= 500 && o < 1000;
        });
        ret.rows[4].times = temp.true;
        temp = collection.countBy(this.minuteDelay, o => {
          return o >= 1000;
        });
        ret.rows[5].times = temp.true;
        return ret;
      }
    }
  };
</script>