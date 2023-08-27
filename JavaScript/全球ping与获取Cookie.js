// ==UserScript==
// @name         全球ping与获取Cookie
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  对当前网址全球ping，判断使用什么网络能快速访问该网址，获取部分网站的Cookie。
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// @grant        none
// ==/UserScript==

// 警告：此脚本可以访问您在当前页面的所有 Cookie 信息。
// 警告：请不要在不可信的网站上使用此脚本，并在使用后记得删除。
// 警告：在获取 cookie 值时需要注意隐私和安全问题，同时也需要遵守网站的用户协议和隐私政策。请不要尝试绕过浏览器的限制或者使用未经授权的技术或工具来获取 Cookie 值。如果您有任何疑问，请联系网站管理员或者开发人员。

// 此注释用来测试 github 与 greasy fork 的自动更新

(function() {
    'use strict';

   const style = `
        #Multi-site {
            bottom: 85px;
            display: block;
            width: 78px;
            text-decoration: none;
            background = '#DCDCDC';
            box-sizing: content-box;
        }
        #fetch_cookie {
            bottom: 50px;
            width: 80px;
        }
        #Multi-site,#fetch_cookie {
            position: fixed;
            right: 10px;
            height: 30px;
            padding: 0;
            margin: 0;
            text-align: center;
            line-height: 30px;
            background: #eeeeee;
            border: 1px inset #C00000;
            border-radius: 5%;
            font-size: 12px;
            font-family: Arial, Helvetica;
            z-index: 9999;
        }
    `;

    // 全球ping当前网址
    var pings = document.createElement('div');
    pings.id = 'Multi-site';
    document.body.appendChild(pings);
    pings.innerHTML = `
            <a href="https://www.itdog.cn/ping/${window.location.host}" target="_self" title="全球在线多线路ping">全球 Ping</a>
    `;

    // 创建一个按钮来显示 cookie
    var button = document.createElement('button');
    button.id = 'fetch_cookie';
    button.textContent = '获取 Cookie';
    document.body.appendChild(button); // 将按钮添加到页面中

    document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);

    // 点击按钮后显示并复制 cookie 值
    button.addEventListener('click', function() {
    // 获取当前页面的所有 cookie，并将它们转换成对象格式
    var cookies = document.cookie.split(';');
    var cookieObj = {};
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split('=');
        cookieObj[cookie[0].trim()] = cookie[1].trim();
    }
    // 将 cookie 值转换成字符串格式并复制到剪贴板中
    var cookieStr = '';
    for (var key in cookieObj) {
        cookieStr += key + '=' + cookieObj[key] + '; ';
    }
    GM_setClipboard(cookieStr); // 复制到剪贴板

    // 在警告框中显示已复制的 cookie 值
    alert('已复制 cookie 到剪贴板。请不要在不可信的网站上使用此脚本，并在使用后记得删除。\n\n' + cookieStr);
    });
})();