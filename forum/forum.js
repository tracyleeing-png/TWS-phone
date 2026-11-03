(function(){
    'use strict';
    const engine=window.TWSGame.engine(); engine.runScheduler(false); engine.reload();
    const app=document.getElementById('app'); document.getElementById('time').textContent=engine.state.gameTime;
    const posts=[
        {id:'f-1403',time:'14:03',title:'在通识课上看到金道勋了',ko:'교양 수업에서 김도훈 봄',body:'今天在大教室看到他了，好像在和小组成员讨论作业。只是目击，不清楚具体情况。',likes:18,comments:['他这学期也选了那门通识课吗？','匿名信息看看就好，别当成事实。'],jin:true},
        {id:'f-1351',time:'13:51',title:'有人认识金道勋学长吗？',ko:'김도훈 선배 아는 사람?',body:'想问一下他是不是学生会的人。',likes:7,comments:['不是学生会，听说参加过校庆志愿者。'],jin:true},
        {id:'f-1326',time:'13:26',title:'已经开始担心期中考试了',ko:'중간고사 벌써 걱정됨',body:'才十月底，我已经看不懂复习范围了。',likes:31,comments:['同感。','图书馆今晚还有位置吗？']},
        {id:'f-1248',time:'12:48',title:'有人去过学校门口新开的意面店吗？',ko:'학교 앞 새로 생긴 파스타집 가본 사람?',body:'午休路过看到排队，想知道值不值得去。',likes:22,comments:['奶油意面还可以。','晚上人更多。']},
        {id:'f-1535',time:'15:35',title:'图书馆四楼插座修好了吗？',ko:'도서관 4층 콘센트 고쳤나요?',body:'上周去的时候一整排都不能用。',likes:4,comments:['下午看见工作人员在修。'],future:true},
        {id:'f-1542',time:'15:42',title:'通识课小组展示一般要做几页？',ko:'교양 발표 보통 몇 장 해요?',body:'教授只说了时间，没有写PPT页数。',likes:11,comments:['按时间准备比较好，十分钟大概八到十页。'],future:true}
    ];
    let current=null;
    const interaction=(id)=>engine.state.forumInteractions.find(item=>item.postId===id)||{};
    const visible=()=>posts.filter(post=>engine.state.gameTime>=post.time);
    function header(title,back){return `<header class="head">${back?'<button id="back">‹</button>':''}<h1>${title}</h1><button aria-label="搜索">⌕</button></header>`;}
    function renderList(){
        engine.reload(); current=null;
        const availablePosts=visible();
        app.innerHTML=`<div class="screen">${header('校园论坛',false)}<main class="feed">${availablePosts.length?availablePosts.map(post=>{const i=interaction(post.id);return `<button class="post" data-id="${post.id}"><span class="meta"><span>匿名 · ${post.time}</span><span class="tag">校园生活</span></span><h2>${post.title}</h2><p>${post.ko}</p><footer><span>♡ ${post.likes+(i.liked?1:0)}</span><span>评论 ${post.comments.length+(i.comments||[]).length}</span><span>${i.bookmarked?'已收藏':'收藏'}</span></footer></button>`;}).join(''):'<p class="empty">暂时没有新帖子</p>'}</main></div>`;
        app.querySelectorAll('.post').forEach(button=>button.addEventListener('click',()=>renderDetail(button.dataset.id)));
    }
    function renderDetail(id){
        engine.reload(); current=posts.find(post=>post.id===id); if(!current)return renderList();
        const i=interaction(id); const extra=i.comments||[];
        app.innerHTML=`<div class="screen">${header('帖子',true)}<main class="detail"><article class="detail-card"><span class="meta">匿名 · ${current.time}</span><h2>${current.title}</h2><p>${current.ko}</p><p>${current.body}</p></article><div class="actions"><button id="like" class="${i.liked?'active':''}">${i.liked?'已点赞':'点赞'} ${current.likes+(i.liked?1:0)}</button><button id="bookmark" class="${i.bookmarked?'active':''}">${i.bookmarked?'已收藏':'收藏'}</button></div><section class="comments">${[...current.comments,...extra].map((comment,index)=>`<article class="comment"><b>匿名${index+1}</b><p>${comment}</p></article>`).join('')||'<p class="empty">还没有评论</p>'}<form class="comment-form"><input maxlength="120" placeholder="匿名评论" aria-label="匿名评论"><button>发送</button></form></section></main></div>`;
        document.getElementById('back').addEventListener('click',renderList);
        document.getElementById('like').addEventListener('click',()=>{engine.forumAction(id,'liked',!i.liked);renderDetail(id);});
        document.getElementById('bookmark').addEventListener('click',()=>{engine.forumAction(id,'bookmarked',!i.bookmarked);renderDetail(id);});
        app.querySelector('form').addEventListener('submit',(event)=>{event.preventDefault();const input=event.target.querySelector('input');const text=input.value.trim();if(!text)return;const latest=interaction(id);const comments=(latest.comments||[]).concat(text);engine.forumAction(id,'comments',comments);renderDetail(id);});
    }
    renderList();
}());
