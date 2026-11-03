(function(){
    'use strict';
    const engine=window.TWSGame.engine(); engine.runScheduler(false); engine.reload();
    const state=engine.state; document.getElementById('time').textContent=state.gameTime;
    const app=new URLSearchParams(location.search).get('app')||'settings';
    const title=document.getElementById('title'); const content=document.getElementById('content');
    const views={
        instagram:{title:'Instagram',html:'<article class="card social-post"><div class="social-image">☕</div><div class="social-copy"><h2>校园咖啡社</h2><p>期中周限定饮品。普通校园账号的公开动态，与主线人物无关。</p></div></article><article class="card"><h2>动态</h2><p>你关注的同学分享了图书馆窗外的晚霞。</p></article>'},
        x:{title:'X',html:'<article class="card"><h2>校园天气</h2><p>今天傍晚降温明显，请注意保暖。</p></article><article class="card"><h2>首尔生活</h2><p>地铁晚高峰部分线路客流较大。</p></article><article class="card"><h2>关注中</h2><p>这里展示普通公开信息，不会泄露玩家的私聊内容。</p></article>'},
        calendar:{title:'日历',html:`<article class="card calendar-day"><b>26</b><div><h2>2026年10月26日</h2><p>星期一 · ${state.chapterLabel}</p></div></article><article class="card"><h2>今天</h2><p>通识课第三组：确认分工与资料</p><p>${state.pendingTasks.map(item=>'• '+item).join('<br>')||'今天没有未完成事项'}</p></article>`},
        photos:{title:'相册',html:'<article class="card"><h2>最近项目</h2><div class="photo-grid"><div>🌆</div><div>📚</div><div>☕</div><div>🍜</div><div>🌙</div><div>🚌</div></div></article><article class="card"><p>第一章主线不会自动写入玩家没有拍摄的照片。</p></article>'},
        settings:{title:'设置',html:`<article class="card"><div class="setting-row"><span>玩家</span><b>${state.playerName}</b></div><div class="setting-row"><span>章节</span><span class="pill">${state.chapterLabel}</span></div><div class="setting-row"><span>游戏日期</span><span>${state.gameDate}</span></div><div class="setting-row"><span>本地存档</span><span class="pill">已开启</span></div></article><article class="card"><h2>章节</h2><p>第一章</p><p>第二章</p><p>第三章</p></article>`}
    };
    const view=views[app]||views.settings; title.textContent=view.title; document.title=view.title; content.innerHTML=view.html;
}());
