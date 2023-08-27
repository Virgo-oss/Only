// ==UserScript==
// @name         优化部分网页体验（移动端）
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  删除:知乎的问题弹窗、盐选推荐，Ecosia的Cookie提示。优化：百家号、知乎全文展开，豆瓣相关直达，哔哩哔哩视频页下的相关视频直接播放，慢慢买界面
// @author       Your Name
// @match        *://*.ecosia.org/*
// @match        *://*.sm.cn/*
// @match        *://*.zhihu.com/*
// @match        *://m.douban.com/*
// @match        *://m.manmanbuy.com/*
// @match        *://*.csdn.net/*
// @match        *://*.jianshu.com/*
// @match        *://baijiahao.baidu.com/*
// @match        *://m.bilibili.com/video/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 获取当前网址域名
    var Current_url = window.location.host;

    var newStyle,noteContent,originalStyle,updatedStyle; // 声明变量
    // 判断当前域名是否符合正则表达式,并执行对应的函数
    if (/m\.bilibili/.test(Current_url)) {
        newStyle = `
            .fixed-module-margin[data-v-f28ccdde] {
                     margin-top: 53.13333vmin;
            }
        `;
        elementDetection();
    } else if (/baijiahao/.test(Current_url)) {
        newStyle = `
            #mainContentContainer {
                     height: auto;
            }
        `;
    } else if (/www\.zhihu/.test(Current_url)) {
        newStyle = `
            #root > .App {
                     height: auto;
            }
        `;
    } else if (/m\.manmanbuy/.test(Current_url)){
        newStyle = `
            .TalionNav-static {
                     margin-top: 0;
            }
            .foot_top,.foot_top a:nth-of-type(3) {
                     border: none;
                     height: 0;
            }
            .foot_top a:nth-of-type(1),.foot_top a:nth-of-type(2) {
                     position: absolute;
                     width: 45px;
                     height: 30px;
                     z-index: 9999;
                     color: #727272;
                     line-height: 30px;
                     top: 7px;
            }
            .foot_top a:nth-of-type(1) {
                     right: 50px;
            }
            .foot_top a:nth-of-type(2) {
                     right: 5px;
                     border: none;
            }
            .foot_top a:nth-of-type(3) {
                     display: none;
            }
            div.searchbox {
                     right: 15px;
                     width: 195px;
            }
        `;

    } else if (/m\.douban/.test(Current_url)) {
        newStyle = `
            .TalionNav-static {
                     margin-top: 0;
            }
        `;

        if (document.querySelector('a.item-containor')){

            noteContent = document.querySelector('.note-content');
            if (noteContent) {
                originalStyle = noteContent.getAttribute('style');// 获取原始style属性值
                updatedStyle = originalStyle.replace('max-height: 628px;', '');
            }

            // 相关下的链接直达
            document.querySelectorAll('a.item-containor').forEach(item => {
                const href = item.getAttribute('href');
                const newHref = href.match(/\/group\/topic\/(\d+)/)[0];
                item.setAttribute('href', `https://m.douban.com${newHref}`);
            });
        }

    } else if (/csdn/.test(Current_url)) {
        let csdnLogo = document.querySelector('a.logo.floatL');
        let logoHref = csdnLogo.getAttribute('href');
        csdnLogo.setAttribute('href', logoHref.replace('\/apps\/download\/\?code=1660790523&channelCode=1660790523', ''));

    }else if (/ecosia|zhihu/g.test(Current_url)) {
        elementDetection();
    }

    if (noteContent != null) {
        // 更新元素style属性值
        noteContent.setAttribute('style', updatedStyle);
    }
    if (newStyle != undefined){
        document.head.insertAdjacentHTML('beforeend', `<style class="newStyle">${newStyle.replace(/\;/g, ' !important;')}</style>`);
    }

    // 删除:"知乎-问题弹窗"、
    const widgetRemove = ['.OpenInAppButts', '.download-app-guidance'];
    widgetRemove.forEach(selector => {
        if (document.querySelector(selector)){
            let element = document.querySelector(selector);
            element && element.remove();
            console.log(1);
        }
    });


    //document.querySelectorAll('div.c-atom-afterclick-recomm-wrap').forEach(ad => ad.remove());

    function elementDetection() {

        // 创建一个 MutationObserver 实例
        const observer = new MutationObserver((mutationsList) => {
            // 遍历每个变动的记录
            for (let mutation of mutationsList) {
                // 检查是否有新节点添加到DOM中
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

                    dynamicDeletion();
                    // 删除:
                    if (document.querySelectorAll('div.launch-app-btn.v-card-toapp')) {
                        biliVideo();
                    }

                } else {
                    break;
                }
            }
        });
        // 监视整个文档的变化 配置观察选项，可用body或documentElement
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 删除动态节点："ecosia-Cookie提示"、
    function dynamicDeletion() {
        let Related_search = ['.KfeCollection-VipRecommendCard'];
        var elements = document.querySelectorAll(Related_search.join(','));
        elements.forEach(element => {
            element.remove();
        });
    }

    // 哔哩哔哩视频页下的相关视频直接播放
    function biliVideo(){
        /*
        link.href = '#'; // 设置 a 标签的 href 属性值
        link.className = 'launch-app-btn v-card-toapp'; // 设置 a 标签的 class 属性值
        while (divElement.firstChild) {  // 将 div 标签的内容移动到 a 标签内部
            link.appendChild(divElement.firstChild);
        }
        divElement.parentNode.replaceChild(link, divElement);  // 替换原来的 div 标签为新创建的 a 标签
    }
*/
        // 获取所有同时拥有 class 为 "launch-app-btn" 和 "v-card-toapp" 的 div 标签
        document.querySelectorAll('div.launch-app-btn.v-card-toapp').forEach((divElement) => {
            // 创建新的 a 标签元素
            const aElement = document.createElement('a');
            // 将 div 标签的内容复制到 a 标签中
            aElement.innerHTML = divElement.innerHTML;
            // 将 div 标签的样式复制到 a 标签中
            aElement.className = divElement.className;

            // 将 a 标签替换原来的 div 标签
            divElement.parentNode.replaceChild(aElement, divElement);
            // 为新的 a 标签添加单击事件
            aElement.addEventListener('click', () => {
                // 获取点击的 a 标签下的 img 标签
                const imgElements = aElement.querySelector('img');
                const src = imgElements.outerHTML.match(/src="\/\/i.\.(.*?)@480w_270h_1c"/i)[1];
                const alt = imgElements.getAttribute('alt');
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: 'https://api.bilibili.com/x/web-interface/wbi/search/all/v2?keyword=' + alt,
                    headers: {
                        'Origin': 'https://m.bilibili.com',
                        'Referer': 'https://m.bilibili.com/',
                        'Cookie': 'buvid3=D9E7CB43-28F6-6EFF-CAA1-8227E30C2F9022656infoc; b_lsid=61145284_18A0D728B58; _uuid=ED1051D1B-7873-D94A-6110D-AB13F448CC7A25226infoc; buvid_fp=013b80b8ce37ad71df3cab44b907cf14; buvid4=7CF39DE5-240A-8CC9-1706-D4A74BB9DEC825727-123081918-Pk1O31qDhl4kvWP6MQrTAr2B1S8WNBLUPOhB8QqF4Ft66MXX5vkcWQ%3D%3D; sid=4om8je3l; rpdid=0zbfAHUrwQ|uEGs7g64|2kN|3w1QxjFJ',
                        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0'
                    },
                    timeout: 15000,
                    responseType: "json",
                    onload: function(response) {
                        const blData = response.response;
                        const searchList = blData.data.result[11].data;
                        let num = 0;
                        for (let x of searchList) {
                            const bvidUrl = 'https://m.bilibili.com/video/' + searchList[num].bvid;
                            const searchPic = searchList[num].pic.replace(/\/\/i.\./, '');
                            if (searchPic == src){
                                window.location.href = bvidUrl;
                            }
                            num++;
                        }
                    }
                });
            });
        });
    };

})();
