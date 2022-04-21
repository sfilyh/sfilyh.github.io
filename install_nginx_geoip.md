# 为已安装的nginx 添加 geoip2



# 模块





**下面的教程，基于mmdblookup已安装好的情况，下面命令能正常执行**

```shell
mmdblookup --file /usr/local/geoip/GeoLite2-Country.mmdb  --ip 8.8.8.8 country iso_code
```



### 1、安装准备

#下载nginx源码 

```shell
wget http://nginx.org/download/nginx-1.14.0.tar.gz
tar zxvf nginx-1.14.0.tar.gz
cd nginx-1.14.0
```



#安装依赖

```shell
sudo apt -y install libxslt1-dev libxml2-dev libxml2 libgd-dev libgeoip-dev
```



### 2、通过源码编译nginx，获取geoip2模块



#使用nginx -V 查看旧nginx参数，configure时需要用到，如果不带上nginx -V的参数，编译出来的模块，旧nginx不认，会报"is not binary compatible"错误。

```
nginx -V
```

![image-20210306010709759](http://thbackup.oss-cn-beijing.aliyuncs.com/31508ca9-ae1a-5433-943f-3deb8a48246c.png)

```shell
sudo ./configure 【用nginx -V参数替换这里】 --add-dynamic-module=/home/www/gitSrc/nginx-geoip2/ngx_http_geoip2_module
```



#开始编译

```shell
# 替换后的命令
cd nginx-1.14.0

sudo ./configure --with-cc-opt='-g -O2 -fdebug-prefix-map=/build/nginx-GkiujU/nginx-1.14.0=. -fstack-protector-strong -Wformat -Werror=format-security -fPIC -Wdate-time -D_FORTIFY_SOURCE=2' --with-ld-opt='-Wl,-Bsymbolic-functions -Wl,-z,relro -Wl,-z,now -fPIC' --prefix=/usr/share/nginx --conf-path=/etc/nginx/nginx.conf --http-log-path=/var/log/nginx/access.log --error-log-path=/var/log/nginx/error.log --lock-path=/var/lock/nginx.lock --pid-path=/run/nginx.pid --modules-path=/usr/lib/nginx/modules --http-client-body-temp-path=/var/lib/nginx/body --http-fastcgi-temp-path=/var/lib/nginx/fastcgi --http-proxy-temp-path=/var/lib/nginx/proxy --http-scgi-temp-path=/var/lib/nginx/scgi --http-uwsgi-temp-path=/var/lib/nginx/uwsgi --with-debug --with-pcre-jit --with-http_ssl_module --with-http_stub_status_module --with-http_realip_module --with-http_auth_request_module --with-http_v2_module --with-http_dav_module --with-http_slice_module --with-threads --with-http_addition_module --with-http_geoip_module=dynamic --with-http_gunzip_module --with-http_gzip_static_module --with-http_image_filter_module=dynamic --with-http_sub_module --with-http_xslt_module=dynamic --with-stream=dynamic --with-stream_ssl_module --with-mail=dynamic --with-mail_ssl_module  --add-dynamic-module=/home/www/gitSrc/nginx-geoip2/ngx_http_geoip2_module

#configure成功后，执行make
sudo make
```



#make成功后，将ngx_http_geoip2_module.so拷贝到到旧nginx中

```shell
sudo cp ./objs/ngx_http_geoip2_module.so /usr/lib/nginx/modules/

sudo sh -c 'echo "load_module modules/ngx_http_geoip2_module.so;" > /usr/share/nginx/modules-available/mod-http-geoip2.conf'

sudo ln -s /usr/share/nginx/modules-available/mod-http-geoip2.conf /etc/nginx/modules-enabled/60-mod-http-geoip2.conf

```



**以上所有的操作，只为生成一个文件 ngx_http_geoip2_module.so ，并添加到旧nginx中。**



### 3、在旧nginx中使用geoip2

#开启全局配置，加载geoip2模块

```shell
vim /etc/nginx/nginx.conf

# 在文件头部添加下面一行代码，引入geoip模块
include /etc/nginx/modules-enabled/60-mod-http-geoip2.conf;
```

<img src="http://thbackup.oss-cn-beijing.aliyuncs.com/ac2ab8c7-c755-542b-9832-258b3fee97f3.png" alt="image-20210306004128288" style="zoom:50%;" />



#示例，在域名 geoip2.dhapi.com下面使用 geoip2功能;

```shell
# 新增一个nginx配置文件 geoip.conf
sudo vim /etc/nginx/conf.d/geoip.conf
```

#文件内容如下：

```nginx
geoip2 /usr/local/geoip/GeoLite2-Country.mmdb {
    $geoip2_country_code country iso_code;
}


server {
    listen       80;
    server_name  geoip2.dhapi.com;


    location / {
    
        index index.html index.htm;
        # 在response中添加header头，方便调试
        add_header country $geoip2_country_code;
    
        if ($geoip2_country_code = 'CN'){
            return 301 https://cn.dhapi.com;
        }
        if ($geoip2_country_code = 'DE'){
            return 301 https://de.dhapi.com;
        }
        if ($geoip2_country_code = 'US'){
            return 301 https://us.dhapi.com;
        }
        if ($geoip2_country_code = 'TW'){
            return 301 https://tw.dhapi.com;
        }
        if ($geoip2_country_code = 'MY'){
            return 301 https://my.dhapi.com;
        }
    
        return 301 https://uk.dhapi.com;
       
    }

}
```

重新加载**旧nginx**配置，访问 http://geoip2.dhapi.com ，验证跳转情况

```shell
sudo nginx -s reload
```







