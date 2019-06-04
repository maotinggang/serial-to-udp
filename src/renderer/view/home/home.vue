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
          <AutoComplete
            :disabled="netIsDisabled"
            v-model="hostIp"
            :data="hostIps"
            placeholder="host"
            style="width:120px"
          ></AutoComplete>：
          <Input :disabled="netIsDisabled" v-model="hostPort" style="width: 60px"/>
        </span>
        <Divider type="vertical"/>
        <span>
          服务器地址：
          <AutoComplete
            :disabled="netIsDisabled"
            v-model="serverIp"
            :data="hostIps"
            placeholder="server"
            style="width:120px"
          ></AutoComplete>：
          <Input :disabled="netIsDisabled" v-model="serverPort" style="width: 60px"/>
        </span>
        <Button type="primary" style=" margin-left: 10px;" @click="handleNet">{{netState}}</Button>
      </Col>
    </Row>
    <Row class="home-row">
      <Col style="height: 30px;">
        <span style="float: left; margin-left: 10px;margin-top: 5px;">
          <CheckboxGroup
            v-model="checkedDisplay"
            @on-change="checkedChange"
            style=" display: inline;"
          >
            <Checkbox label="hex">Hex</Checkbox>
            <Checkbox label="ascii">Ascii</Checkbox>
            <Checkbox label="timestamp">Timestamp</Checkbox>
          </CheckboxGroup>
        </span>
        <span style=" float: right; margin-right: 10px;">
          <Button type="success" @click="displayPause">{{displayState}}</Button>
          <Button style="margin-left: 10px;" type="warning" @click="displayClear">清空</Button>
        </span>
      </Col>
    </Row>
    <Row style=" position: fixed;">
      <Col
        :style="{wordWrap: 'break-word',wordBreak: 'break-all',padding:'5px',overflow: 'auto',height:windowSize.height-130+'px',width:windowSize.width+'px'}"
      >
        <p style="font-size: 15px;" v-for="item in infos" :key="item.id">{{ item }}</p>
      </Col>
    </Row>
  </div>
</template>

<script src="./home.js">
</script>

<style scoped src="./home.css">
</style>

