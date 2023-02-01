# Springboot-websocket

过渡阶段IM

前端仓库：https://gitee.com/beijing_hongye_huicheng/im

后端仓库：https://gitee.com/beijing_hongye_huicheng/springboot-websocket

部署方式：
1、导入数据库，配置resource目录下application.yml的数据库以及redis配置文件。

2、maven打包

3、启动jar包即可。

4、前端程序运行，测试环境需配置根目录 .env.development文件，正式环境需配置 .env 文件。

# 参考项目
项目前端参考：https://gitee.com/gzydong/LumenIM.git  功能更丰富，大家可以去学习一波


# IM体验
浏览器1打开地址：http://127.0.0.1:8000/message?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyQ29udGV4dCI6IntcInVzZXJuYW1lXCI6XCIxMzAxMTExMTExMVwiLFwibmlja05hbWVcIjpcIuW8oOS4ieWTiOWTiOWTiFwiLFwiZmFjZVwiOlwiaHR0cHM6Ly9saWxpc2hvcC1vc3Mub3NzLWNuLWJlaWppbmcuYWxpeXVuY3MuY29tLzQ1ZDUyOGYwMjRjZTQyMzI4NzYxNjFhZmQxN2Y0ZWExLmpwZ1wiLFwiaWRcIjpcIjEzNzY0MTc2ODQxNDAzMjY5MTJcIixcImxvbmdUZXJtXCI6ZmFsc2UsXCJyb2xlXCI6XCJTVE9SRVwiLFwic3RvcmVJZFwiOlwiMTM3NjQzMzU2NTI0NzQ3MTYxNlwiLFwic3RvcmVOYW1lXCI6XCLlrrblrrbkuZBcIixcImlzU3VwZXJcIjpmYWxzZX0iLCJzdWIiOiIxMzAxMTExMTExMSIsImV4cCI6MTY0NTQ2OTk1M30.fXpCZ2YiFYqACpmxVvKjIpXovfPRDJavHjftpQzdEps

浏览器2打开地址：http://127.0.0.1:8000/message?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyQ29udGV4dCI6IntcInVzZXJuYW1lXCI6XCIxMzAxMTExMTExMVwiLFwibmlja05hbWVcIjpcIuW8oOS4ieWTiOWTiOWTiFwiLFwiZmFjZVwiOlwiaHR0cHM6Ly9saWxpc2hvcC1vc3Mub3NzLWNuLWJlaWppbmcuYWxpeXVuY3MuY29tLzk2N2UzMzU1Yzg0NTRiNGFhMTk1N2M1NTQ5ZTZiNzIwLnBuZ1wiLFwiaWRcIjpcIjEzNzY0MTc2ODQxNDAzMjY5MTJcIixcImxvbmdUZXJtXCI6ZmFsc2UsXCJyb2xlXCI6XCJNRU1CRVJcIixcImlzU3VwZXJcIjpmYWxzZX0iLCJzdWIiOiIxMzAxMTExMTExMSIsImV4cCI6MTY0NTQ2OTAyNn0.GEkGpKRKF3rqzHRhaPCFilPpWe37cIXTT4KnwWR4Bt0&id=1376433565247471616

即可进行聊天。

# NGINX配置事例
线上NGINX配置在测试阶段出现问题，这里吧相关的配置贴出来供大家参考。
````
    server {
        listen       443 ssl;
        ssl_certificate "/etc/nginx/ssl/pickmall.cn.pem";
        ssl_certificate_key "/etc/nginx/ssl/pickmall.cn.key";
        ssl_session_cache shared:SSL:1m;
        ssl_session_timeout  10m;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        include /etc/nginx/default.d/*.conf;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        server_name  im-api.pickmall.cn;
        location / {
            proxy_pass http://127.0.0.1:8088;
        }
    }

    server {
        listen       443 ssl;
        ssl_certificate "/etc/nginx/ssl/pickmall.cn.pem";
        ssl_certificate_key "/etc/nginx/ssl/pickmall.cn.key";
        ssl_session_cache shared:SSL:1m;
        ssl_session_timeout  10m;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        include /etc/nginx/default.d/*.conf;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header REMOTE-HOST $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            server_name  im.pickmall.cn;
        try_files $uri $uri/ /index.html;
        root         /home/im/im/dist;
    }
````