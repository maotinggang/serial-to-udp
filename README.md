# net-delay

> An electron-vue project

#### Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

### 版本说明

v1.0.0

- 串口输入 GPGGA，频率越高越好；
- 网络协议为 YBCTCC；
- 平均延时每分钟延时的平均值，图表和数据每分 0 秒时进行更新；
- 采用网络 utc 与串口 utc 直接相减计算延时

v1.0.1

- 采用网络与串口相同 utc 时间点的系统时间计算延时；
