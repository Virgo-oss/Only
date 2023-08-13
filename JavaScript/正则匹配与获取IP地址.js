// ==UserScript==
// @name         正则匹配，显示IP地址和地理位置
// @namespace    http://tampermonkey.net/
// @version      1.08
// @description  正则表达式匹配, 在网页上显示IP地址和地理位置信息
// @author       You
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const style = `
        #ip_address {
            position: fixed;
            top: 5px;
            right: 13px;
            height: auto;
            width: 205px;
            padding: 5px;
            background: #eeeeee;
            border: 1px inset #C00000;
            box-sizing: content-box;
            font-family: Arial, Helvetica;
            z-index: 9999;
        }
        #ip_address a {
            position: fixed;
            top: 10px;
            right: 13px;
            text-decoration: none;
            font-size: 16px;
        }
        #ip_address p {
            margin: 0;
            padding: 0;
            line-height: 1.53846154;
            font-size: 14px;
        }
        #ip_address strong {
            margin: 0;
            padding: 0;
            font-size: 15px;
        }
    `;

    // 创建一个圆形按钮用于显示/隐藏输入框
    const buttonElem = document.createElement("button");
    buttonElem.id = "buttonElem";
    buttonElem.style.position = "fixed";
    buttonElem.style.color = "#fff";
    buttonElem.style.left = "2px";
    buttonElem.style.background = "#505050";
    buttonElem.style.borderRadius = "50%";
    buttonElem.style.width = "40px";
    buttonElem.style.height = "40px";
    buttonElem.style.border = "none";
    buttonElem.style.outline = "none";
    buttonElem.style.zIndex = "9999";
    document.body.appendChild(buttonElem);

    // 在页面上创建一个div元素用于输入正则表达式
    const regexInput = document.createElement("input");
    regexInput.id = "regex-input";
    regexInput.style.magin = 0;
    regexInput.style.position = "fixed";
    regexInput.style.background = "#fff";
    regexInput.style.boxSizing = "content-box";
    regexInput.placeholder = "请输入正则表达式...";
    regexInput.style.border = "1px solid #ec7259";
    regexInput.style.zIndex = "9999"; // 将输入框置于顶层
    regexInput.style.display = "none"; // 默认隐藏
    document.body.appendChild(regexInput);

    let currentIndex = 0;

    // 创建匹配结果列表容器元素
    const matchedResultElem = document.createElement("div");
    matchedResultElem.id = "matchedResultElem";
    matchedResultElem.style.position = "fixed";
    matchedResultElem.style.color = "black";
    matchedResultElem.style.background = "#f5f5f5";
    matchedResultElem.style.boxSizing = "content-box";
    matchedResultElem.style.overflow = "auto";
    // 在样式中添加 flex 布局
    matchedResultElem.style.display = "flex";
    matchedResultElem.classList.add("matched-result");
    matchedResultElem.style.zIndex = "9999";
    matchedResultElem.style.display = "none"; // 初始时隐藏匹配结果列表
    document.body.appendChild(matchedResultElem);

    const totalResultElem = document.createElement("span");
    totalResultElem.id = "totalResultElem";
    totalResultElem.style.position = "fixed";
    totalResultElem.style.color = "#747474";
    totalResultElem.style.background = "#ffffff";
    totalResultElem.style.textAlign = "right";
    totalResultElem.style.width = "auto";
    totalResultElem.style.zIndex = "9999";
    totalResultElem.style.display = "none";
    document.body.appendChild(totalResultElem);

    // 创建一个复制按钮
    const copyAllButtonElem = document.createElement("button");
    copyAllButtonElem.id = "copyAllButtonElem";
    copyAllButtonElem.textContent = "全部复制";
    copyAllButtonElem.style.background = "#ec7259";
    copyAllButtonElem.style.color = "#fff";
    copyAllButtonElem.style.borderRadius = "2px";
    copyAllButtonElem.style.border = "none";
    copyAllButtonElem.style.outline = "none";
    copyAllButtonElem.style.zIndex = "9999";

    buttonElem.style.transform = "translateX(-70%) translateY(50%)";
    buttonElem.style.opacity = 0.3;
    buttonElem.style.transition = "transform 0.5s ease, opacity 0.5s ease";

    // 获取输入框和页面内容
    const regexInputElem = document.getElementById("regex-input");

    // 给 全部复制 按钮绑定点击事件
    copyAllButtonElem.addEventListener('click', function () {
        // 获取匹配结果列表中所有 class 值为"regex-text"的元素
        const matchedTextElems = Array.from(matchedResultElem.querySelectorAll('.regex-text'));
        // 遍历元素，将所有文本连接起来
        const textToCopy = matchedTextElems.map((elem) => elem.innerText.trim()).join('\n');
        // 复制文本到剪贴板
        navigator.clipboard.writeText(textToCopy);
    });

    const ip_address = document.createElement('div');
    function showIPLocation(ip, location) {
        ip_address.id = 'ip_address';
        ip_address.style.display = 'none';
        // 备用网址：http://www.ip111.cn/
        ip_address.innerHTML = `
            <p><strong>IP地址：</strong>${ip}</p>
            <a href="https://ip.skk.moe/" target="_blank" title="全方位查询您的IP地址">【ip】</a>
            <p><strong>地理位置：</strong>${location}</p>
        `;
        document.body.appendChild(ip_address);
        document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);
    }

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://pro.ip-api.com/json/?fields=16985625&key=EEKS6bLi6D91G1p',
        onload: function(response) {
            const data = JSON.parse(response.responseText);
            const ip = data.query;
            let location = data.regionName;
            if (data.country === 'Hong Kong') {
                location = `${data.country} ${data.regionName}`;
            }
            else if (data.regionName.includes(data.city)) {
                location = `${data.country}, ${data.regionName}`;
            }
            else {
                location = `${data.country}, ${data.regionName}${data.city ? `, ${data.city}` : ''}`;
            }
            showIPLocation(ip, location);
        }
    });

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        function1();
    } else {
        function2();
    }

    function function1() {
        // 在手机浏览器中执行的函数
        buttonElem.style.top = "300px";

        regexInput.style.bottom = "5px";
        regexInput.style.left = "5px";
        regexInput.style.height = "30px";
        regexInput.style.width = "215px";
        regexInput.style.padding = "3px 31px 3px 5px";
        regexInput.style.outline = "none";
        regexInput.style.fontSize= "15px";

        totalResultElem.style.fontSize = "15px";
        totalResultElem.style.padding = "0 5px";
        totalResultElem.style.bottom = "6px";
        totalResultElem.style.right = "136px";
        totalResultElem.style.height = "36px";
        totalResultElem.style.lineHeight = "36px";

        matchedResultElem.style.bottom = "50px";
        matchedResultElem.style.left ="5px";
        matchedResultElem.style.padding = "3px";
        matchedResultElem.style.width = "245px";
        matchedResultElem.style.textAlign= "left";
        matchedResultElem.style.maxHeight = "180px";
        matchedResultElem.style.border = "1px inset #C00000";
        matchedResultElem.innerHTML = `
  <p style="height:15px; line-height:15px; font-size:16px; margin: 0 0 5px 0;">匹配结果：</p>
  <ul style="margin:0; padding: 0 0 0 3px;"></ul>
`;

        const next = document.createElement("button");
        next.textContent = "⇒";
        next.id = "nextAll";
        next.style.background = "#C8C8C8";
        next.style.borderRadius = "2px";
        next.style.border = "1px solid #ec7259";
        next.style.padding = "2px 3px";
        next.style.bottom = "5px";
        next.style.right = "80px";
        next.style.width = "50px";
        next.style.fontSize= "15px";
        next.style.height = "38px";
        next.style.display = "none";
        next.style.position = "fixed";
        next.style.zIndex = "9998";
        document.body.appendChild(next);

        copyAllButtonElem.style.padding = "2px 3px";
        copyAllButtonElem.style.bottom = "5px";
        copyAllButtonElem.style.right = "5px";
        copyAllButtonElem.style.width = "70px";
        copyAllButtonElem.style.fontSize= "15px";
        copyAllButtonElem.style.height = "38px";
        copyAllButtonElem.style.display = "none";
        copyAllButtonElem.style.position = "fixed";
        document.body.appendChild(copyAllButtonElem);

        // 监听输入框的值变化事件
        regexInputElem.addEventListener("input", () => {
            // 清空匹配结果列表中之前的结果
            const matchedListElem = matchedResultElem.querySelector("ul");
            const scrollTop = matchedResultElem.scrollTop;
            matchedListElem.innerHTML = "";
            // 获取输入框的值
            const regexStr = regexInputElem.value.trim();
            // 如果正则表达式为空，则隐藏匹配结果列表并返回
            if (!regexStr) {
                matchedResultElem.style.display = "none";
                totalResultElem.textContent = `0/0`;
                return;
            }

            // 创建正则表达式对象并进行匹配 排除空值
            const regex = new RegExp(regexStr, "g");
            const filteredText = document.body.innerText.match(regex);
            if (filteredText !== null) {
                // 使用 filteredText 变量，去除无用元素并过滤空元素
                currentIndex = 0;
                let matchedElems = filteredText
                .map(elem => elem.replace(/全部复制|⇒|匹配结果：|set 限制解除|【ip】|IP地址：.*|地理位置：.*/g, ''))
                .filter(elem => elem.trim() !== '' && !/^\d+\/\d+$/.test(elem));
                // 如果匹配结果中有两个 xN.00，则删除它们之间的所有匹配结果
                const regexToDelete = /x(\d+\.00)/i;
                const matchedIndexes = matchedElems.reduce((acc, elem, idx) => {
                    if (regexToDelete.test(elem)) {
                        acc.push(idx);
                    }
                    return acc;
                }, []);
                const len = matchedIndexes.length;
                if (len >= 2) {
                    const start = matchedIndexes[len - 2];
                    const end = matchedIndexes[len - 1];
                    matchedElems.splice(start, end - start + 1);
                }
                // 统计重复元素数量，并删除重复元素（保留第一个）
                const counted = new Map();
                matchedElems = matchedElems.filter((elem) => {
                    if (counted.has(elem)) {
                        counted.set(elem, counted.get(elem) + 1);
                        return false;
                    } else {
                        counted.set(elem, 1);
                        return true;
                    }
                }).map((elem) => {
                    const count = counted.get(elem);
                    return count > 1 ? `${elem}</span>【${count}】</li>` : elem;
                });
                matchedListElem.innerHTML = matchedElems ? matchedElems.map((elem, index) => `
            <li style="list-style:disc; font-size:15px; margin-bottom: 3px;">${index + 1}. <span class="regex-text">${elem}</span></li>
        `).join("") : "";
                matchedResultElem.style.display = "block";
                totalResultElem.textContent = `${currentIndex}/${matchedElems.length}`;
                matchedResultElem.scrollTop = scrollTop;
            } else {
                // 处理 filteredText 为空时的情况
                matchedResultElem.style.display = "none";
                totalResultElem.textContent = `0/0`;
            }
        });

        buttonElem.addEventListener("click", () => {
            // 将需要切换显示状态的元素存放到一个数组中
            const elemsToToggle = [regexInput, next, ip_address, totalResultElem, copyAllButtonElem];
            elemsToToggle.forEach((elem) => {
                elem.style.display = elem.style.display === "none" ? "block" : "none";
            });
            // 如果 regexInput 值不为空，则切换其显示状态
            if (regexInput.value.trim() !== '') {
                matchedResultElem.style.display = matchedResultElem.style.display === "block" ? "none" : "block";
            }
            // 鼠标光标聚焦到输入框中
            regexInput.focus();
        });

        buttonElem.addEventListener("click", (event) => {
            event.stopPropagation();
            buttonElem.style.transform = "translateX(0) translateY(50%)";
            buttonElem.style.opacity = 1;
        });
        document.addEventListener("click", () => {
            buttonElem.style.transform = "translateX(-70%) translateY(50%)";
            buttonElem.style.opacity = 0.3;
        });

        // 监听 next 按钮的单击事件
        next.addEventListener("click", () => {
            // 获取所有匹配结果元素
            const matchedElems = matchedResultElem.querySelectorAll(".regex-text");
            // 如果没有匹配结果，将索引值设置为-1，以便于后续获取第一个匹配结果
            if (matchedElems.length <= 0) {
                currentIndex = 0;
                return;
            }
            // 获取当前匹配结果对应的文本内容
            const currentText = matchedElems[currentIndex].textContent.trim();

            // 创建正则表达式对象并进行匹配（全局匹配）
            function escapeRegExp(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }
            const currentTextEscaped = escapeRegExp(currentText);
            const regex = new RegExp(`(${currentTextEscaped})`, "g");

            document.querySelectorAll('body *:not(.regex-text)').forEach((elem) => {
                const plainText = elem.textContent.trim(); // 获取元素的文本内容
                if (plainText == currentText) {
                    const rect = elem.getBoundingClientRect();
                    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    const top = rect.top + scrollTop - (window.innerHeight / 2);
                    const originalBackgroundColor = elem.style.backgroundColor; // 记录原始背景颜色
                    const originalColor = elem.style.color; // 记录原始文字颜色
                    elem.style.backgroundColor = '#b0b0b0'; // 更改背景颜色
                    elem.style.color = '#f4f4f4'; // 更改文字颜色
                    setTimeout(() => {
                        elem.style.backgroundColor = originalBackgroundColor; // 2秒后还原背景色
                        elem.style.color = originalColor; // 2秒后还原文字颜色
                    }, 2000);
                    window.scrollBy({ top: top - window.scrollY, behavior: 'smooth' }); // 改为 scrollBy 方法来滚动页面
                    return;
                }
            });
            // 计算下一个匹配结果的索引值
            currentIndex += 1;
            // 更新匹配结果总数
            totalResultElem.textContent = `${currentIndex}/${matchedElems.length}`;
            // 如果已经遍历完所有匹配结果，则重新开始遍历
            if (currentIndex >= matchedElems.length) {
                currentIndex = 0;
            }
        });
    }

    function function2() {
        // 在电脑浏览器中执行的函数
        buttonElem.style.top = "60px";

        regexInput.style.top = "90px";
        regexInput.style.height = "18px";
        regexInput.style.right = "12px";
        regexInput.style.width = "388px";
        regexInput.style.padding = "5px";

        totalResultElem.style.padding = "0 5px";
        totalResultElem.style.top= "91px";
        totalResultElem.style.right = "15px";
        totalResultElem.style.fontSize= "13px";
        totalResultElem.style.height = "27px";
        totalResultElem.style.lineHeight = "27px";

        matchedResultElem.style.top = "125px";
        matchedResultElem.style.right ="12px";
        matchedResultElem.style.padding = "5px";
        matchedResultElem.style.width = "346px";
        matchedResultElem.style.maxHeight = "305px";
        matchedResultElem.style.paddingRight = "45px";
        matchedResultElem.style.border = "2px inset #000";
        matchedResultElem.innerHTML = `
  <p style="height:30px; line-height:30px; font-size:16px; margin-bottom:5px;">匹配结果：</p>
  <ul style="margin:0; padding:0 0 0 3px;"></ul>
`;

        copyAllButtonElem.style.padding = "5px 8px";
        copyAllButtonElem.style.top = "5px";
        copyAllButtonElem.style.left= "320px";
        copyAllButtonElem.style.position = "absolute";
        copyAllButtonElem.style.cursor = "pointer";
        matchedResultElem.insertBefore(copyAllButtonElem, matchedResultElem.firstChild);

        // white-space: nowrap; text-overflow: ellipsis;
        // 监听输入框的值变化事件
        regexInputElem.addEventListener("input", () => {
            // 清空匹配结果列表中之前的结果
            const matchedListElem = matchedResultElem.querySelector("ul");
            const scrollTop = matchedResultElem.scrollTop;
            matchedListElem.innerHTML = "";

            // 获取输入框的值
            const regexStr = regexInputElem.value.trim();
            // 如果正则表达式为空，则隐藏匹配结果列表并返回
            if (!regexStr) {
                matchedResultElem.style.display = "none";
                totalResultElem.textContent = `0`;
                return;
            }

            // 创建正则表达式对象并进行匹配 排除空值
            const regex = new RegExp(regexStr, "g");
            const filteredText = document.body.innerText.match(regex);
            if (filteredText !== null) {
                // 使用 filteredText 变量，去除无用元素并过滤空元素
                currentIndex = 0;
                let matchedElems = filteredText
                .map(elem => elem.replace(/全部复制|⇒|匹配结果：|set 限制解除|【ip】|IP地址：.*|地理位置：.*/g, ''))
                .filter(elem => elem.trim() !== '' && !/^\d+\/\d+$/.test(elem));
                // 如果匹配结果中有两个 xN.00，则删除它们之间的所有匹配结果
                const regexToDelete = /x(\d+\.00)/i;
                const matchedIndexes = matchedElems.reduce((acc, elem, idx) => {
                    if (regexToDelete.test(elem)) {
                        acc.push(idx);
                    }
                    return acc;
                }, []);
                const len = matchedIndexes.length;
                if (len >= 2) {
                    const start = matchedIndexes[len - 2];
                    const end = matchedIndexes[len - 1];
                    matchedElems.splice(start, end - start + 1);
                }
                // 统计重复元素数量，并删除重复元素（保留第一个）
                const counted = new Map();
                matchedElems = matchedElems.filter((elem) => {
                    if (counted.has(elem)) {
                        counted.set(elem, counted.get(elem) + 1);
                        return false;
                    } else {
                        counted.set(elem, 1);
                        return true;
                    }
                }).map((elem) => {
                    const count = counted.get(elem);
                    return count > 1 ? `${elem}</span>【${count}】` : elem;
                });
                matchedListElem.innerHTML = matchedElems ? matchedElems.map((elem, index) => `
            <li style="list-style:none; font-size:15px; margin-bottom: 8px; display:flex;">
            ${index + 1}. <span class="regex-text">${elem}</span><button class="copy-button">复制</button></li>
        `).join("") : "";

                // 设置复制按钮固定在最右边
                matchedResultElem.querySelectorAll('.copy-button').forEach((btn) => {
                    btn.style.margin = '0 auto';
                    btn.style.position = 'absolute';
                    btn.style.right = '7px';
                });
                matchedResultElem.style.display = "block";
                totalResultElem.textContent = `${currentIndex}/${matchedElems.length}`;
                matchedResultElem.scrollTop = scrollTop;
            } else {
                // 处理 filteredText 为空时的情况
                matchedResultElem.style.display = "none";
                totalResultElem.textContent = `0`;
            }
        });

        buttonElem.addEventListener("click", () => {
            // 将需要切换显示状态的元素存放到一个数组中
            const elemsToToggle = [regexInput, ip_address, totalResultElem];
            elemsToToggle.forEach((elem) => {
                elem.style.display = elem.style.display === "none" ? "block" : "none";
            });
            // 如果 regexInput 值不为空，则切换其显示状态
            if (regexInput.value.trim() !== '') {
                matchedResultElem.style.display = matchedResultElem.style.display === "block" ? "none" : "block";
            }
            // 鼠标光标聚焦到输入框中
            regexInput.focus();
        });

        buttonElem.addEventListener("mouseover", function() {
            buttonElem.style.transform = "translateX(0) translateY(50%)";
            buttonElem.style.opacity = 1;
        });

        document.addEventListener("click", function(event) {
            if (!buttonElem.contains(event.target)) {
                buttonElem.style.transform = "translateX(-50%) translateY(50%)";
                buttonElem.style.opacity = 0.5;
            }
        });

        // 监听复制按钮的点击事件
        matchedResultElem.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-button')) {
                const textToCopy = e.target.previousElementSibling.textContent.trim();
                navigator.clipboard.writeText(textToCopy).then(() => {
                    console.log(`Text ${textToCopy} copied to clipboard`);
                }, (err) => {
                    console.error(`Error in copying text: ${err}`);
                });

                // 将匹配到的文本滚动到页面居中
                document.querySelectorAll(':not(.regex-text)').forEach((elem) => {
                    if (elem.innerText == textToCopy) {
                        const rect = elem.getBoundingClientRect();
                        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                        const top = rect.top + scrollTop - (window.innerHeight / 2);
                        const originalBackgroundColor = elem.style.backgroundColor;
                        const originalColor = elem.style.color;
                        elem.style.backgroundColor = '#b0b0b0';
                        elem.style.color = '#f4f4f4';
                        setTimeout(() => {
                            elem.style.backgroundColor = originalBackgroundColor;
                            elem.style.color = originalColor;
                        }, 2000);
                        window.scrollTo({top: top, behavior: 'smooth'});
                        return;
                    }
                });
            }
        });

    }

})();
