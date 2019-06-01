<template>
  <div>
    <Row class="home-row">
      <Col>
        设备串口：
        <Select :disabled="serialIsDisabled" v-model="comSelected" style="width:80px">
          <Option v-for="item in comNumber" :value="`COM${item}`" :label="`COM${item}`"></Option>
        </Select>
        <Divider type="vertical"/>
        <span>
          波特率：
          <Input :disabled="serialIsDisabled" v-model="baudRate" style="width: 60px"/>
        </span>
        <Divider type="vertical"/>
        <span>
          打包间隔(ms)：
          <Input :disabled="serialIsDisabled" v-model="packageTime" style="width: 60px"/>
        </span>
        <Button type="primary" style="margin-left: 10px;" @click="handleSerial">{{serialState}}</Button>
      </Col>
    </Row>
    <Row class="home-row">
      <Col>
        <span>
          本地地址：
          <Input :disabled="netIsDisabled" v-model="hostIp" style="width: 120px"/>：
          <Input :disabled="netIsDisabled" v-model="hostPort" style="width: 60px"/>
        </span>
        <Divider type="vertical"/>
        <span>
          服务器地址：
          <Input :disabled="netIsDisabled" v-model="serverIp" style="width: 120px"/>：
          <Input :disabled="netIsDisabled" v-model="serverPort" style="width: 60px"/>
        </span>
        <Button type="primary" style=" margin-left: 10px;" @click="handleNet">{{netState}}</Button>
      </Col>
    </Row>
    <Row style="text-align: center;">
      <Col span="12">
        <Card :padding="0">
          <p slot="title" :padding="0">
            <Button type="primary" size="small">暂停</Button>
          </p>
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

