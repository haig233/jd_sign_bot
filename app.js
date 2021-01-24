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
    let single, total
    let t = content.match(/【签到奖励】:.*/)
    if (t) {
      single = t[0].split("  ")[1]
      if (single !== "获取失败")
        single = "获得" + single
      else
        single = "签到奖励" + single
    } else {
      let t = content.match(/【签到概览】:.*/)
      single = t[0].split("  ")[1]
      single = "签到" + single
    }
    let t2 = content.match(/【账号总计】:.*京豆/)
    total = t2[0].split("  ")[1]
    if (total !== "获取失败") total = "总计" + total
    await sendNotify(`${single}___${total}`, content);
    console.log(`${single}___${total}`)
  }
}

start()
