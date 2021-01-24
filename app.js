// version v0.0.2
// create by ruicky
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync;
const fs = require('fs');
const rp = require('request-promise');
const download = require('download');

// 公共变量
const KEY = process.env.JD_COOKIE;
const serverJ = process.env.PUSH_KEY;
const DualKey = process.env.JD_COOKIE_2;


async function downFile() {
  const url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js'
  // const url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js';
  await download(url, './');
}

async function changeFile() {
  let content = await fs.readFileSync('./JD_DailyBonus.js', 'utf8')
  content = content.replace(/var Key = ''/, `var Key = '${KEY}'`);
  if (DualKey) {
    content = content.replace(/var DualKey = ''/, `var DualKey = '${DualKey}'`);
  }
  await fs.writeFileSync('./JD_DailyBonus.js', content, 'utf8')
}

async function sendNotify(text, desp) {
  const options = {
    uri: `https://sc.ftqq.com/${serverJ}.send`,
    form: {text, desp},
    json: true,
    method: 'POST'
  }
  await rp.post(options).then(res => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

async function start() {
  if (!KEY) {
    console.log('请填写 key 后在继续')
    return
  }
  // 下载最新代码
  await downFile();
  console.log('下载代码完毕')
  // 替换变量
  await changeFile();
  console.log('替换变量完毕')
  // 执行
  await exec("node JD_DailyBonus.js >> result.txt");
  console.log('执行完毕')

  if (serverJ) {
    const path = "./result.txt";
    let content = "";
    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
    }
    let thisTime, jingdou
    let reward = content.match(/【签到奖励】:.*/g)
    if (reward) {
      // 签到奖励匹配成功时,显示获得京豆数

      //移除标题文本/空格,从文本中分割出京豆,将钢镚丢弃
      thisTime = reward[0].split(":")[1]
        .replace(" ", "")
        .split("京豆")[0]
      if (thisTime !== "获取失败")
        thisTime = "获得" + thisTime + "京豆"
      else
        thisTime = "签到奖励获取失败"
    } else {
      // 签到奖励匹配失败时,显示成功/失败数
      let overview = content.match(/【签到概览】:.*/g)[0]
      //移除标题文本/空格
      thisTime = overview
        .replace(/\s+/g,"")
        .replace(",", "")
        .split(":")[1]
      thisTime = "签到" + thisTime
    }
    // 账号总计
    let total = content.match(/【账号总计】:.*/g)[0]
    //移除标题文本
    jingdou = total
      .replace(/\s+/g,"")
      .split(":")[1]
    if (jingdou !== "获取失败")
      jingdou = "总计" + jingdou.split("京豆")[0] + "京豆"
    else
      jingdou = "京豆数获取失败"
    await sendNotify(`${thisTime}___${jingdou}`, content);
    console.log(`${thisTime}___${jingdou}`)
  }
}

start()
