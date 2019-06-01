<template>
  <div>
    <Row class="home-row">
      <Col span="14">设备串口：
        <Select v-model="comSelected" style="width:80px">
          <Option v-for="item in comName" :value="item" :label="item"></Option>
        </Select>
        <span>波特率：
          <Input v-model="baudRate" style="width: 60px"/>
        </span>
        <Button type="primary" style="margin-left: 10px;" @click="handleSerial">{{serialState}}</Button>
      </Col>
      <Col span="10">
        <span class="home-text">
          串口UTC时间：
          {{serialTime}}
        </span>
      </Col>
    </Row>
    <Row class="home-row">
      <Col span="14">网络端口：
        <Input v-model="netPort" style="width: 80px"/>
        <Button type="primary" style=" margin-left: 10px;" @click="handleNet">{{netState}}</Button>
      </Col>
      <Col span="10">
        <span class="home-text">
          网络UTC时间：
          {{netTime}}
        </span>
      </Col>
    </Row>
    <Row style="text-align: center;">
      <Col span="12">
        <Card :padding="2">
          <p slot="title">平均延时(ms)：{{averageDelay}}</p>
          <delay-average :height="windowSize.height - 170 + 'px'"></delay-average>
        </Card>
      </Col>
      <Col span="12">
        <Card :padding="2">
          <p slot="title">延时统计(ms)</p>
          <delay-statistics :height="windowSize.height - 170 + 'px'"></delay-statistics>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script src="./home.js">
</script>

<style scoped src="./home.css">
</style>

