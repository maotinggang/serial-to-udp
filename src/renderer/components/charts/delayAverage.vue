<template>
  <ve-line
    :title="title"
    :data="chartData"
    :grid="{top: 35,bottom: 5}"
    :legend-visible="false"
    :height="height"
    :settings="chartSettings"
  ></ve-line>
</template>

<script>
  import { mapState } from "vuex";
  export default {
    props: {
      height: {
        type: String,
        default: "400px"
      }
    },
    data() {
      return {
        chartSettings: {
          metrics: ["延时"],
          dimension: ["time"]
        },
        title: {
          text: "延时量 (ms)",
          left: "40px",
          textStyle: { fontWeight: "lighter", fontSize: 15 }
        }
      };
    },
    computed: {
      ...mapState("home", ["minuteDelay"]),
      chartData() {
        let ret = {
          columns: ["time", "延时"],
          rows: []
        };
        this.minuteDelay.forEach((element, key) => {
          ret.rows.push({ time: key, 延时: element });
        });
        return ret;
      }
    }
  };
</script>