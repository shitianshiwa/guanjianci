# guanjianci

# 除非是第一次使用go-cqhttp，否则启动插件里面的go-cqhttp前，先把device.json（虚拟设备信息）文件复制过去，防止出现频繁使用新设备登录QQ，导致机器人QQ被冻结！

# 注意！如果使用npm i 安装模块，要修改node_modules\cqhttp\src\main.js 第77行 return Promise.resolve(data.data); 为 return Promise.resolve(data); 否则脚本会报错
https://github.com/shitianshiwa/guanjianci

 该插件适配于go-cqhttp：https://github.com/Mrs4s/go-cqhttp/ 以提供v0.9.27 windows 64位 & linux-amd64 不推荐使用windows 32位 
https://github.com/Mrs4s/go-cqhttp/issues/93
可以修改
"enable_db": true 为false
关闭后将无法使用 回复/撤回 等上下文相关接口
 
config.json为go-cqhttp.exe的配置文件

 "uin": 机器人QQ号 ，"password":登陆密码
 
 其它选项含义找：https://github.com/Mrs4s/go-cqhttp/blob/master/docs/config.md

 使用nodesdk：https://github.com/howmanybots/cqhttp-node-sdk
 
 关于cqhttp：https://github.com/richardchien/coolq-http-api
 
 credentials.js 为配置文件，admin需要填上机器人的主人QQ
 
 db为存储文件夹，里面存着关键词回复内容和QQ成员变动后的回复词
 
 windows需要安装 ：https://nodejs.org/en/ 已提供node-v13.9.0-x64安装包(32位暂没有，只能自行下载)
 
 //然后点击build.bat自动安装所需模块
 已提供下载好的node_modules_x64.7z , 解压到压缩包的目录,文件夹名必须为node_modules，不能出现 node_modules_x64/node_modules 的情况，会报错

 点击start.bat启动
 ----------
 Ubuntu 18.04的安装使用方法
 
 sudo apt update
 
 sudo apt install nodejs npm -y
 
 sudo npm install -g n
 
 sudo n stable
 
 sudo npm i -g npm
 
 查看node版本
 
 node -v
 
 npm -v
 
 npx -v
 
 cd 插件所在的路径
 
 node i 安装
 
 node index 启动

 使用 ./go-cqhttp 启动机器人框架

# 相关目录
*https://github.com/shitianshiwa/guanjianci

*https://github.com/shitianshiwa/bili-dynamic-forward

https://github.com/Mrs4s/go-cqhttp/

https://github.com/richardchien/coolq-http-api

https://github.com/shitianshiwa/node-cq-websocket

https://github.com/shitianshiwa/CQ-picfinder-robot

https://github.com/shitianshiwa/Wecab

https://github.com/shitianshiwa/ELF_RSS

https://github.com/shitianshiwa/rsshub2qq

https://github.com/shitianshiwa/cqhttp-node-sdk

https://github.com/shitianshiwa/docker-wine-coolq-dotnet48-autoins 

待补充。。。
