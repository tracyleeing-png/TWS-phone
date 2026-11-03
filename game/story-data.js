(function (root, factory) {
    const data = factory();
    if (typeof module === 'object' && module.exports) module.exports = data;
    if (root) root.TWSStoryData = data;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const t = (sender, text, translation, time, extra) => Object.assign({ sender, text, translation: translation || '', time }, extra || {});
    const deferChoice = (nextNodeId) => ({ id: 'defer', label: '暂时不回复', text: '', translation: '', defer: true, nextNodeId, delayMs: 700, effects: { inc: { 'storyFlags.deferredCount': 1 } }, immediateEffect: '保留当前待回复节点，不发送消息', stateEffect: '记录延迟回复', delayedEffect: `继续调度 ${nextNodeId}`, chapterCarryover: '该消息保持待回复', convergenceRule: '不阻断后续独立事件', invalidationRule: '不会伪造玩家回复' });
    const base = (node) => {
        const normalized = Object.assign({ chapterId: 1, app: 'kakaotalk', threadId: null, availableFrom: null, preconditions: [], npcMessages: [], playerChoices: [], effects: {}, nextNodeId: null, delayedEffects: [], invalidationRules: { uniqueEventId: true }, convergenceRules: '保留历史后进入下一有效节点' }, node);
        normalized.playerChoices = normalized.playerChoices.map((choice) => Object.assign({
            immediateEffect: choice.defer ? '保存当前位置，等待玩家回来' : '把玩家选择写入聊天记录',
            stateEffect: '保存该选择产生的剧情状态',
            delayedEffect: choice.nextNodeId ? '在满足时间与前置条件后进入后续节点' : '不自动推进其他节点',
            chapterCarryover: '保留消息、选择和人物记忆到后续章节',
            convergenceRule: '保留本路线历史后进入下一有效节点',
            invalidationRule: '互斥路线不会重复执行'
        }, choice));
        return normalized;
    };

    const nodes = {};

    nodes['CH01-001'] = base({
        id: 'CH01-001', threadId: 'friendA', availableFrom: '2026-10-26T08:12',
        notification: { title: '好友A', body: '你那边开始开暖气了吗？' },
        npcMessages: [t('friendA', '你那边开始开暖气了吗？', '', '08:12'), t('friendA', '我昨天晚上差点冻死。', '', '08:12')],
        playerChoices: [
            { id: 'a', text: '还没有，我也快冻死了。', responseMessages: [t('friendA', '首尔这个天气真的太突然了，你今晚多穿一点。', '', '08:14')], nextNodeId: 'CH01-002', delayMs: 850, effects: { relationship: { friendA: { comfort: 1 } } }, immediateEffect: '发送实际聊天消息', stateEffect: '好友知道玩家住处也冷', delayedEffect: '进入上午作业消息', chapterCarryover: '保留普通生活话题', convergenceRule: '汇合至上午课程线', invalidationRule: '不涉及金道勋' },
            { id: 'b', text: '开了吧？我还没注意。', responseMessages: [t('friendA', '你也太迟钝了吧，回去摸一下暖气片。', '', '08:14')], nextNodeId: 'CH01-002', delayMs: 850, effects: { relationship: { friendA: { familiarity: 1 } } } },
            { id: 'c', text: '你是不是又没关窗户哈哈哈。', responseMessages: [t('friendA', '……被你发现了。昨晚通风以后真的忘了关。', '', '08:14')], nextNodeId: 'CH01-002', delayMs: 850, effects: { relationship: { friendA: { comfort: 1 } } } },
            deferChoice('CH01-002')
        ], nextNodeId: 'CH01-002'
    });

    nodes['CH01-002'] = base({
        id: 'CH01-002', threadId: 'classmateA', availableFrom: '2026-10-26T10:34',
        notification: { title: '同学A', body: '昨天的作业你做到哪里啦？' },
        npcMessages: [t('classmateA', '혹시 어제 과제 어디까지 하셨어요?', '昨天的作业你做到哪里啦？', '10:34')],
        playerChoices: [
            { id: 'a', text: '저 아직 다 못 했어요 ㅠㅠ', translation: '我还没做完呜呜。', responseMessages: [t('classmateA', '저도 마지막 문제 남았어요. 같이 힘내요!', '我也还剩最后一道题。一起加油吧！', '10:36')], nextNodeId: 'CH01-003', delayMs: 850, effects: { set: { 'storyFlags.assignmentStatus': 'unfinished' }, remember: [{ character: 'classmateA', kind: 'heardStatements', key: 'assignmentProgress', value: 'unfinished' }] } },
            { id: 'b', text: '거의 다 했어요!', translation: '差不多做完啦！', responseMessages: [t('classmateA', '와 빠르네요! 저는 아직 조금 남았어요.', '哇，好快！我还剩一点。', '10:36')], nextNodeId: 'CH01-003', delayMs: 850, effects: { set: { 'storyFlags.assignmentStatus': 'almostDone' }, relationship: { classmateA: { familiarity: 1 } } } },
            { id: 'c', text: '어떤 과제 말씀하시는 거예요?', translation: '你说的是哪个作业？', responseMessages: [t('classmateA', '전공 수업 과제요! 어제 올라온 거요.', '专业课作业！昨天发布的那个。', '10:36')], nextNodeId: 'CH01-003', delayMs: 850, effects: { set: { 'storyFlags.assignmentStatus': 'clarified' } } },
            deferChoice('CH01-003')
        ], nextNodeId: 'CH01-003'
    });

    nodes['CH01-003'] = base({
        id: 'CH01-003', threadId: 'friendA', availableFrom: '2026-10-26T12:15',
        notification: { title: '好友A', body: '我找到一家还不错的火锅店。' },
        npcMessages: [t('friendA', '火锅照片', '', '12:15', { type: 'photo', meta: { visual: 'hotpot' } }), t('friendA', '我找到一家还不错的火锅店。', '', '12:15'), t('friendA', '下次带你来。', '', '12:15')],
        playerChoices: [
            { id: 'a', text: '啊啊啊看着就好吃。', responseMessages: [t('friendA', '对吧！锅底比我预想的好吃。', '', '12:17')], nextNodeId: 'CH01-004', delayMs: 850 },
            { id: 'b', text: '什么时候去！', responseMessages: [t('friendA', '我先看看这周课表，确定以后再约你。', '', '12:17')], nextNodeId: 'CH01-004', delayMs: 850, effects: { pendingAdd: ['等待好友A确认火锅时间'] } },
            { id: 'c', text: '你怎么背着我吃这么好。', responseMessages: [t('friendA', '临时被同学拉来的，下次一定叫你。', '', '12:17')], nextNodeId: 'CH01-004', delayMs: 850 },
            deferChoice('CH01-004')
        ], nextNodeId: 'CH01-004'
    });

    nodes['CH01-004'] = base({
        id: 'CH01-004', threadId: 'group3', availableFrom: '2026-10-26T14:09',
        notification: { title: '通识课第三组', body: '我们先确定一下展示分工吧？' },
        npcMessages: [t('memberB', '우리 발표 역할 먼저 정할까요?', '我们先确定一下展示分工吧？', '14:09'), t('memberC', '자료 조사랑 발표 나눠서 하면 될 것 같아요.', '资料搜集和展示分开负责应该就行。', '14:10'), t('jin', '자료 정리는 제가 할게요.', '资料整理我来做吧。', '14:11')],
        playerChoices: [
            { id: 'a', text: '네! 저는 남은 역할 먼저 확인해 볼게요.', translation: '好！我先确认一下剩下的分工。', responseMessages: [t('memberD', '좋아요. 발표랑 자료 조사가 아직 남았어요.', '好，展示和资料搜集还没有确定。', '14:13')], nextNodeId: 'CH01-005', delayMs: 700 },
            { id: 'b', text: '자료 관련해서 필요한 거 있으면 말씀해 주세요.', translation: '资料方面有需要的话请告诉我。', responseMessages: [t('jin', '네, 먼저 파일 정리해서 공유할게요.', '好，我先整理文件再分享。', '14:13')], nextNodeId: 'CH01-005', delayMs: 700, effects: { relationship: { jin: { familiarity: 1 } } } },
            { id: 'c', text: '네 알겠습니다!', translation: '好的，知道了！', responseMessages: [t('memberB', '그럼 가능한 역할 하나씩 말해 주세요!', '那大家说一下自己能负责的角色吧！', '14:13')], nextNodeId: 'CH01-005', delayMs: 700 },
            deferChoice('CH01-005')
        ], nextNodeId: 'CH01-005'
    });

    const friendRequestNext = { branches: [{ preconditions: [{ path: 'storyFlags.afternoonStarted', op: 'truthy' }], nodeId: 'CH01-LATE-PRIVATE' }], fallback: 'CH01-006' };
    nodes['CH01-005'] = base({
        id: 'CH01-005', app: 'kakaotalk', threadId: 'friendRequest', availableFrom: '2026-10-26T14:18',
        notification: { title: 'KakaoTalk', body: '金道勋发送了好友申请' },
        npcMessages: [t('system', '金道勋因课程 PDF 向你发送了好友申请。', '', '14:18', { type: 'friendRequest' })],
        playerChoices: [
            { id: 'accept', label: '接受', text: '', translation: '', send: false, resumeNext: true, nextNodeId: friendRequestNext, delayMs: 450, effects: { set: { friendRequestAccepted: true, friendRequestStatus: 'accepted', 'storyFlags.privateChatStarted': true }, relationship: { jin: { familiarity: 1 } }, pendingRemove: ['接受或稍后处理金道勋的好友申请'] }, immediateEffect: '接受好友申请', stateEffect: '建立金道勋私聊渠道', delayedEffect: '按当前时间进入初次或延迟私聊', chapterCarryover: '记录接受时间', convergenceRule: '私聊可用', invalidationRule: '接受前不会生成私聊' },
            { id: 'later', label: '稍后接受', text: '', translation: '', send: false, defer: true, nextNodeId: 'CH01-012', delayMs: 900, effects: { set: { friendRequestStatus: 'later' }, pendingAdd: ['接受或稍后处理金道勋的好友申请'], inc: { 'storyFlags.deferredCount': 1 } } },
            { id: 'not_now', label: '暂时不接受', text: '', translation: '', send: false, defer: true, nextNodeId: 'CH01-012', delayMs: 900, effects: { set: { friendRequestStatus: 'notAccepted' }, pendingAdd: ['接受或稍后处理金道勋的好友申请'] } }
        ], nextNodeId: 'CH01-012'
    });

    nodes['CH01-006'] = base({
        id: 'CH01-006', threadId: 'jin', availableFrom: '2026-10-26T14:20', preconditions: [{ path: 'friendRequestAccepted', value: true }],
        notification: { title: '金道勋', body: '麻烦确认一下是不是这个！' },
        npcMessages: [t('jin', '교양수업_1주차.pdf', '通识课_第1周.pdf', '14:20', { type: 'file', fileName: '교양수업_1주차.pdf' }), t('jin', '이거 맞는지 확인해 주세요!', '麻烦确认一下是不是这个！', '14:20')],
        playerChoices: [
            { id: 'a', text: '네 맞아요! 감사합니다 ㅎㅎ', translation: '嗯是这个！谢谢哈哈。', responseMessages: [t('jin', '다행이네요 ㅎㅎ', '那就好哈哈。', '14:21')], nextNodeId: 'CH01-007', delayMs: 400, effects: { set: { 'storyFlags.pdfStatus': 'confirmed' }, relationship: { jin: { trust: 1 } } } },
            { id: 'b', text: '잠깐 확인해 볼게요!', translation: '我先确认一下！', responseMessages: [t('jin', '네, 천천히 확인해 주세요!', '好，慢慢确认就可以！', '14:21'), t('jin', '파일 첫 페이지에 수업명이 적혀 있어요.', '文件第一页写着课程名称。', '14:21')], nextNodeId: 'CH01-007', delayMs: 500, effects: { set: { 'storyFlags.pdfStatus': 'checked' } } },
            { id: 'c', text: '어? 제가 찾던 파일이랑 다른 것 같아요.', translation: '咦？好像和我要找的文件不一样。', responseMessages: [t('jin', '아, 제가 다른 주차 파일을 보냈네요. 잠시만요!', '啊，我发成其他周的文件了。稍等一下！', '14:21'), t('jin', '교양수업_1주차_수정.pdf', '通识课_第1周_修正版.pdf', '14:22', { type: 'file', fileName: '교양수업_1주차_수정.pdf' }), t('jin', '이번 파일이 맞을 거예요.', '这次的文件应该对了。', '14:22')], nextNodeId: 'CH01-007', delayMs: 550, effects: { set: { 'storyFlags.pdfStatus': 'corrected' }, relationship: { jin: { trust: 1 } } } },
            deferChoice('CH01-012')
        ], nextNodeId: 'CH01-007'
    });

    nodes['CH01-007'] = base({
        id: 'CH01-007', threadId: 'jin', availableFrom: '2026-10-26T14:22', preconditions: [{ path: 'friendRequestAccepted', value: true }],
        npcMessages: [t('jin', '아까 중국어 하시는 것 같던데, 혹시 중국에서 오셨어요?', '刚才好像听见你说中文，是从中国来的吗？', '14:22')],
        playerChoices: [
            { id: 'a', text: '네 맞아요 ㅎㅎ 중국에서 왔어요.', translation: '嗯是的哈哈，我从中国来的。', responseMessages: [t('jin', '그렇군요! 한국 생활은 좀 익숙해지셨어요?', '原来如此！在韩国生活习惯一些了吗？', '14:23')], nextNodeId: 'CH01-008', delayMs: 350, effects: { remember: [{ character: 'jin', kind: 'confirmedFacts', key: 'playerFromChina', value: true }], relationship: { jin: { familiarity: 1 } } } },
            { id: 'b', text: '어떻게 아셨어요? ㅋㅋ', translation: '你怎么知道的哈哈？', responseMessages: [t('jin', '아까 통화하실 때 중국어가 들렸어요 ㅋㅋ', '刚才你打电话时我听到中文了哈哈。', '14:23')], nextNodeId: 'CH01-008', delayMs: 350, effects: { remember: [{ character: 'jin', kind: 'heardStatements', key: 'playerLikelyFromChina', value: true }] } },
            { id: 'c', text: '네 ㅎㅎ 왜요?', translation: '嗯哈哈，怎么啦？', responseMessages: [t('jin', '그냥 궁금했어요. 한국어를 잘하셔서요!', '只是有点好奇。因为你韩语说得很好！', '14:23')], nextNodeId: 'CH01-008', delayMs: 350, effects: { remember: [{ character: 'jin', kind: 'confirmedFacts', key: 'playerFromChina', value: true }] } },
            { id: 'd', text: 'ㅎㅎ 비밀이에요.', translation: '哈哈，是秘密。', responseMessages: [t('jin', '아 그렇군요 ㅎㅎ 더 안 물어볼게요.', '啊这样呀哈哈，那我不多问了。', '14:23')], nextNodeId: 'CH01-009', delayMs: 350, effects: { remember: [{ character: 'jin', kind: 'subjectiveImpressions', key: 'respectsPrivacy', value: true }] } }
        ], nextNodeId: 'CH01-008'
    });

    nodes['CH01-008'] = base({
        id: 'CH01-008', threadId: 'jin', availableFrom: '2026-10-26T14:23', preconditions: [{ path: 'friendRequestAccepted', value: true }],
        npcMessages: [t('jin', '한국에는 언제 오셨어요?', '你是什么时候来韩国的？', '14:23')],
        playerChoices: [
            { id: 'a', text: '작년에 왔어요!', translation: '去年来的！', responseMessages: [t('jin', '그럼 이제 거의 1년 되셨겠네요.', '那现在差不多快一年了。', '14:23')], nextNodeId: 'CH01-009', delayMs: 320, effects: { remember: [{ character: 'jin', kind: 'heardStatements', key: 'arrivalTime', value: 'lastYear' }] } },
            { id: 'b', text: '온 지 한 1년 정도 됐어요.', translation: '来了一年左右了。', responseMessages: [t('jin', '1년이면 학교 생활도 많이 익숙해지셨겠어요.', '一年左右的话，校园生活应该习惯不少了。', '14:23')], nextNodeId: 'CH01-009', delayMs: 320, effects: { remember: [{ character: 'jin', kind: 'heardStatements', key: 'arrivalTime', value: 'aboutOneYear' }] } },
            { id: 'c', text: '얼마 안 됐어요 ㅎㅎ', translation: '没来多久哈哈。', responseMessages: [t('jin', '아직 적응 중이시겠네요.', '那应该还在适应中。', '14:23')], nextNodeId: 'CH01-009', delayMs: 320, effects: { remember: [{ character: 'jin', kind: 'heardStatements', key: 'arrivalTime', value: 'recently' }] } },
            { id: 'd', text: '그건 비밀이에요 ㅋㅋ', translation: '这个是秘密哈哈。', responseMessages: [t('jin', '네 알겠습니다 ㅋㅋ', '好，知道了哈哈。', '14:23')], nextNodeId: 'CH01-009', delayMs: 320 }
        ], nextNodeId: 'CH01-009'
    });

    nodes['CH01-009'] = base({
        id: 'CH01-009', threadId: 'jin', availableFrom: '2026-10-26T14:24', preconditions: [{ path: 'friendRequestAccepted', value: true }],
        npcMessages: [t('jin', '수업 들을 때는 괜찮으세요?', '上课听讲还适应吗？', '14:24')],
        playerChoices: [
            { id: 'a', text: '네 ㅎㅎ 이제 좀 익숙해졌어요.', translation: '嗯哈哈，现在慢慢习惯了。', responseMessages: [t('jin', '다행이네요. 그래도 자료 필요하면 말씀해 주세요.', '那就好。不过需要资料的话可以告诉我。', '14:24')], nextNodeId: 'CH01-010', delayMs: 350, effects: { remember: [{ character: 'jin', kind: 'heardStatements', key: 'classAdjustment', value: 'adjusted' }] } },
            { id: 'b', text: '가끔 어려울 때도 있어요 ㅠㅠ', translation: '有时候还是会觉得难呜呜。', responseMessages: [t('jin', '그럴 수 있죠. 이번 수업 자료는 제가 정리해서 같이 공유할게요.', '会这样的。这次课程资料我整理好后一起分享。', '14:24')], nextNodeId: 'CH01-010', delayMs: 350, effects: { remember: [{ character: 'jin', kind: 'heardStatements', key: 'classAdjustment', value: 'sometimesDifficult' }], pendingAdd: ['查看金道勋整理的课程资料'], relationship: { jin: { trust: 1 } } } },
            { id: 'c', text: '교수님 말씀이 너무 빠르세요 ㅋㅋ', translation: '教授说话太快了哈哈。', responseMessages: [t('jin', '맞아요 ㅋㅋ 저도 가끔 놓쳐요. 필요한 부분은 같이 확인해요.', '是的哈哈，我有时也会漏掉。需要的部分我们一起确认。', '14:24')], nextNodeId: 'CH01-010', delayMs: 350, effects: { remember: [{ character: 'jin', kind: 'heardStatements', key: 'classAdjustment', value: 'professorTooFast' }] } },
            { id: 'd', text: '괜찮아요!', translation: '还好！', responseMessages: [t('jin', '다행이에요!', '那就好！', '14:24')], nextNodeId: 'CH01-010', delayMs: 350 }
        ], nextNodeId: 'CH01-010'
    });

    const taskChoice = (id, task, text, translation, reply, next) => ({ id, text, translation, responseMessages: [t('jin', reply[0], reply[1], '14:26')], nextNodeId: next || 'CH01-011', delayMs: 350, effects: Object.assign({ set: { playerTask: task }, relationship: { jin: { familiarity: 1, trust: 1 } } }, task === 'undecided' ? { pendingAdd: ['完成通识课第三组分工'] } : { pendingRemove: ['完成通识课第三组分工'] }) });
    nodes['CH01-010'] = base({
        id: 'CH01-010', threadId: 'jin', availableFrom: '2026-10-26T14:25', preconditions: [{ path: 'friendRequestAccepted', value: true }],
        npcMessages: [t('jin', '혹시 어떤 역할 맡고 싶으세요?', '你比较想负责哪部分呢？', '14:25')],
        playerChoices: [
            taskChoice('presentation', 'presentation', '발표 제가 해도 돼요 ㅎㅎ', '展示我来做也可以哈哈。', ['오 좋아요! 그럼 발표 부탁드릴게요 ㅎㅎ', '噢好呀！那展示拜托你啦哈哈。']),
            taskChoice('research', 'research', '저 자료 조사할게요!', '我来负责资料搜集吧！', ['좋아요! 그럼 자료 조사 부탁드릴게요.', '好呀！那资料搜集拜托你了。']),
            taskChoice('undecided', 'undecided', '아직 잘 모르겠어요 ㅠㅠ', '我还没想好呜呜。', ['네 괜찮아요 ㅎㅎ 정해지면 알려 주세요!', '嗯没关系哈哈，决定好了告诉我就行！']),
            { id: 'ask', text: '어떤 역할이 남았어요?', translation: '还有哪些分工没确定呀？', responseMessages: [t('jin', '발표랑 자료 조사가 아직 남았어요. 편한 쪽으로 골라도 돼요!', '展示和资料搜集还没确定。选你方便的就可以！', '14:26')], nextNodeId: 'CH01-010B', delayMs: 280 }
        ], nextNodeId: 'CH01-011'
    });
    nodes['CH01-010B'] = base({
        id: 'CH01-010B', threadId: 'jin', availableFrom: '2026-10-26T14:26', preconditions: [{ path: 'friendRequestAccepted', value: true }],
        npcMessages: [],
        playerChoices: [
            taskChoice('presentation', 'presentation', '그럼 제가 발표할게요 ㅎㅎ', '那我来展示吧哈哈。', ['좋아요! 발표 자료는 제가 정리해서 드릴게요.', '好！展示资料我整理好后发给你。']),
            taskChoice('research', 'research', '그럼 제가 자료 조사할게요!', '那我来负责资料搜集！', ['좋아요. 조사 범위는 제가 정리해서 알려 드릴게요.', '好。搜集范围我整理后告诉你。']),
            taskChoice('undecided', 'undecided', '조금만 더 생각해 볼게요.', '我再考虑一下。', ['네, 괜찮아요. 오늘 안에만 알려 주세요!', '好，没关系。今天之内告诉我就可以！'])
        ], nextNodeId: 'CH01-011'
    });

    nodes['CH01-011'] = base({
        id: 'CH01-011', threadId: 'jin', availableFrom: '2026-10-26T14:28', preconditions: [{ path: 'friendRequestAccepted', value: true }],
        npcMessages: [t('jin', '저야말로 잘 부탁드려요 ㅎㅎ', '我才是要请你多多关照哈哈。', '14:28'), t('jin', '정리하다가 궁금한 거 있으면 편하게 연락 주세요!', '整理过程中有什么疑问可以随时联系我！', '14:28'), t('jin', '그럼 다음 수업 때 봬요 👋', '那下次上课见！', '14:28')],
        playerChoices: [
            { id: 'a', text: '네! 다음에 봬요 ㅎㅎ', translation: '嗯！下次见哈哈。', responseMessages: [t('jin', '네, 다음에 봬요!', '好，下次见！', '14:29')], nextNodeId: 'CH01-012', delayMs: 1000, effects: { set: { 'storyFlags.firstChatClosed': true } } },
            { id: 'b', text: '잘 부탁드려요!', translation: '请多多关照！', responseMessages: [t('jin', '저도 잘 부탁드려요 ㅎㅎ', '我也请你多多关照哈哈。', '14:29')], nextNodeId: 'CH01-012', delayMs: 1000, effects: { set: { 'storyFlags.firstChatClosed': true }, relationship: { jin: { comfort: 1 } } } },
            { id: 'c', label: '不回复，退出聊天', text: '', translation: '', defer: true, nextNodeId: 'CH01-012', delayMs: 1000, effects: { set: { 'storyFlags.firstChatClosed': true }, inc: { 'storyFlags.deferredCount': 1 } } }
        ], nextNodeId: 'CH01-012'
    });

    nodes['CH01-012'] = base({
        id: 'CH01-012', app: 'system', threadId: null, availableFrom: '2026-10-26T14:28',
        notification: { title: '第一章', body: '下午暂时没有新消息，可以自由查看手机。' },
        effects: { pendingAdd: ['留意下午的新消息'] },
        delayedEffects: [{ nextNodeId: 'CH01-013', delayMs: 1600 }]
    });

    nodes['CH01-013'] = base({
        id: 'CH01-013', app: 'forum', threadId: null, availableFrom: '2026-10-26T15:35',
        notification: { title: '校园论坛', body: '你关注的校园版有新帖子和评论。' },
        effects: { set: { 'storyFlags.forumUpdateAvailable': true, 'storyFlags.afternoonStarted': true }, pendingRemove: ['留意下午的新消息'] },
        delayedEffects: [{ nextNodeId: 'CH01-014', delayMs: 900 }]
    });

    nodes['CH01-014'] = base({
        id: 'CH01-014', threadId: 'classmateA', availableFrom: '2026-10-26T16:12',
        notification: { title: '同学A', body: '通识课小组分工定下来了吗？' },
        npcMessages: [t('classmateA', '교양 수업 조별 역할은 정해졌어요?', '通识课小组分工定下来了吗？', '16:12')],
        playerChoices: [
            { id: 'a', text: '네, 과제 얘기하고 있었어요.', translation: '嗯，刚才在聊作业。', responseMessages: [t('classmateA', '다행이네요. 저희 조도 이제 정하려고요.', '那就好。我们组也正准备确定。', '16:14')], nextNodeId: { branches: [{ preconditions: [{ path: 'friendRequestAccepted', value: false }], nodeId: 'CH01-015-G' }, { preconditions: [{ path: 'playerTask', value: 'presentation' }], nodeId: 'CH01-015-P' }, { preconditions: [{ path: 'playerTask', value: 'research' }], nodeId: 'CH01-015-R' }], fallback: 'CH01-015-U' }, delayMs: 850 },
            { id: 'b', text: '혹시 다른 조는 보통 어떻게 나눠요?', translation: '其他小组通常怎么分工呀？', responseMessages: [t('classmateA', '발표 한 명, 자료 조사 두 명 정도인 것 같아요.', '好像通常是一人展示、两人搜集资料。', '16:14')], nextNodeId: { branches: [{ preconditions: [{ path: 'friendRequestAccepted', value: false }], nodeId: 'CH01-015-G' }, { preconditions: [{ path: 'playerTask', value: 'presentation' }], nodeId: 'CH01-015-P' }, { preconditions: [{ path: 'playerTask', value: 'research' }], nodeId: 'CH01-015-R' }], fallback: 'CH01-015-U' }, delayMs: 850 },
            { id: 'c', text: '아직이요. 다른 수업 과제는 다 하셨어요?', translation: '还没呢。其他课程作业做完了吗？', responseMessages: [t('classmateA', '아니요 ㅠㅠ 오늘 밤에 해야 해요.', '还没有呜呜，今晚得做。', '16:14')], nextNodeId: { branches: [{ preconditions: [{ path: 'friendRequestAccepted', value: false }], nodeId: 'CH01-015-G' }, { preconditions: [{ path: 'playerTask', value: 'presentation' }], nodeId: 'CH01-015-P' }, { preconditions: [{ path: 'playerTask', value: 'research' }], nodeId: 'CH01-015-R' }], fallback: 'CH01-015-U' }, delayMs: 850 },
            deferChoice({ branches: [{ preconditions: [{ path: 'friendRequestAccepted', value: false }], nodeId: 'CH01-015-G' }, { preconditions: [{ path: 'playerTask', value: 'presentation' }], nodeId: 'CH01-015-P' }, { preconditions: [{ path: 'playerTask', value: 'research' }], nodeId: 'CH01-015-R' }], fallback: 'CH01-015-U' })
        ]
    });

    const afternoonNext = 'CH01-016';
    nodes['CH01-015-P'] = base({ id: 'CH01-015-P', threadId: 'jin', availableFrom: '2026-10-26T17:42', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'playerTask', value: 'presentation' }], notification: { title: '金道勋', body: '展示用的资料初稿发给你了。' }, npcMessages: [t('jin', '발표자료_초안.pdf', '展示资料_初稿.pdf', '17:42', { type: 'file', fileName: '발표자료_초안.pdf' }), t('jin', '발표할 때 참고할 부분 표시해 뒀어요.', '我标出了展示时可以参考的部分。', '17:42')], playerChoices: [
        { id: 'thanks', text: '자료 감사합니다! 조금 있다가 볼게요.', translation: '谢谢资料！我一会儿看。', responseMessages: [t('jin', '네, 급하지 않으니까 편할 때 보세요.', '好，不着急，方便时看就可以。', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { relationship: { jin: { trust: 1 } } } },
        { id: 'focus', text: '발표에서 특히 강조할 부분이 있을까요?', translation: '展示时有特别需要强调的部分吗？', responseMessages: [t('jin', '두 번째 사례를 중심으로 설명하면 좋을 것 같아요.', '以第二个案例为重点说明应该不错。', '17:44')], nextNodeId: afternoonNext, delayMs: 800 },
        { id: 'later', text: '지금은 못 봐서 조금 있다가 확인할게요.', translation: '我现在看不了，稍后确认。', responseMessages: [t('jin', '네 괜찮아요. 확인하고 궁금한 점 있으면 말씀해 주세요.', '没关系。确认后有疑问告诉我就好。', '17:44')], nextNodeId: afternoonNext, delayMs: 800 },
        { id: 'change', text: '생각해 보니 자료 조사를 맡아도 될까요?', translation: '想了想，我可以改成负责资料搜集吗？', responseMessages: [t('jin', '네, 괜찮아요. 그럼 발표 역할은 단체방에서 다시 조정할게요.', '可以，没关系。那展示分工我们在群里重新调整。', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { set: { playerTask: 'research', 'storyFlags.taskChanged': true }, invalidateNodes: ['CH01-018-P', 'CH01-019-P'] } },
        deferChoice(afternoonNext)
    ] });
    nodes['CH01-015-R'] = base({ id: 'CH01-015-R', threadId: 'jin', availableFrom: '2026-10-26T17:42', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'playerTask', value: 'research' }], notification: { title: '金道勋', body: '资料搜集范围整理好了。' }, npcMessages: [t('jin', '자료 조사는 국내 사례 두 개랑 해외 사례 한 개 정도면 될 것 같아요.', '资料搜集大概需要两个韩国案例和一个海外案例。', '17:42')], playerChoices: [
        { id: 'confirm', text: '네! 그 범위로 찾아볼게요.', translation: '好！我就按这个范围找。', responseMessages: [t('jin', '감사합니다. 링크만 정리해도 충분해요.', '谢谢。只整理链接也可以。', '17:44')], nextNodeId: afternoonNext, delayMs: 800 },
        { id: 'example', text: '해외 사례는 어떤 쪽이 좋을까요?', translation: '海外案例选哪一类比较好？', responseMessages: [t('jin', '대학생 관련 사례면 주제에 잘 맞을 것 같아요.', '大学生相关案例应该比较切题。', '17:44')], nextNodeId: afternoonNext, delayMs: 800 },
        { id: 'time', text: '오늘은 시간이 조금 더 필요할 것 같아요.', translation: '我今天可能还需要一些时间。', responseMessages: [t('jin', '괜찮아요. 내일까지 천천히 찾아 주세요.', '没关系，明天之前慢慢找就好。', '17:44')], nextNodeId: afternoonNext, delayMs: 800 },
        { id: 'change', text: '제가 발표를 맡는 쪽으로 바꿔도 될까요?', translation: '我可以改成负责展示吗？', responseMessages: [t('jin', '네, 좋아요. 그럼 자료 조사 역할은 단체방에서 다시 정할게요.', '可以。那资料搜集分工我们在群里重新确定。', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { set: { playerTask: 'presentation', 'storyFlags.taskChanged': true }, invalidateNodes: ['CH01-018-R', 'CH01-019-R'] } },
        deferChoice(afternoonNext)
    ] });
    nodes['CH01-015-U'] = base({ id: 'CH01-015-U', threadId: 'group3', availableFrom: '2026-10-26T17:42', preconditions: [{ path: 'playerTask', value: 'undecided' }], notification: { title: '通识课第三组', body: '还有人没确定分工吗？' }, npcMessages: [t('memberB', '아직 역할 안 정하신 분 계세요?', '还有人没确定分工吗？', '17:42')], playerChoices: [
        { id: 'presentation', text: '저 발표 맡을게요 ㅎㅎ', translation: '我负责展示吧哈哈。', responseMessages: [t('jin', '좋아요! 발표 자료는 제가 정리해서 공유할게요.', '好！展示资料我整理后分享。', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { set: { playerTask: 'presentation' }, pendingRemove: ['完成通识课第三组分工'] } },
        { id: 'research', text: '저 자료 조사할게요!', translation: '我负责资料搜集！', responseMessages: [t('memberC', '좋아요. 조사 범위는 같이 정리해요.', '好，搜集范围我们一起整理。', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { set: { playerTask: 'research' }, pendingRemove: ['完成通识课第三组分工'] } },
        { id: 'consider', text: '죄송해요 ㅠㅠ 조금만 더 생각해 봐도 될까요?', translation: '不好意思呜呜，可以再让我考虑一下吗？', responseMessages: [t('memberB', '네, 오늘 저녁까지만 알려 주세요!', '好，今晚之前告诉我们就可以！', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { set: { playerTask: 'undecided' } } },
        deferChoice(afternoonNext)
    ] });
    nodes['CH01-015-G'] = base({ id: 'CH01-015-G', threadId: 'group3', availableFrom: '2026-10-26T17:42', preconditions: [{ path: 'friendRequestAccepted', value: false }], notification: { title: '通识课第三组', body: '课程资料与分工需要在群里确认。' }, npcMessages: [t('jin', '친구 추가 전이라 필요한 내용은 여기 단체방에 공유할게요.', '好友申请处理前，必要内容我会发在这个群里。', '17:42'), t('memberB', '역할도 오늘 안에 정하면 좋을 것 같아요.', '分工最好也在今天之内确定。', '17:43')], playerChoices: [
        { id: 'presentation', text: '저 발표 맡을게요.', translation: '我负责展示。', responseMessages: [t('jin', '네, 발표 자료는 단체방에 올릴게요.', '好，展示资料我会发在群里。', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { set: { playerTask: 'presentation' }, pendingRemove: ['完成通识课第三组分工'] } },
        { id: 'research', text: '저 자료 조사할게요.', translation: '我负责资料搜集。', responseMessages: [t('memberC', '좋아요. 범위는 같이 정리해요.', '好，范围我们一起整理。', '17:44')], nextNodeId: afternoonNext, delayMs: 800, effects: { set: { playerTask: 'research' }, pendingRemove: ['完成通识课第三组分工'] } },
        { id: 'undecided', text: '조금만 더 생각해 볼게요.', translation: '我再考虑一下。', responseMessages: [t('memberB', '네, 저녁에 다시 확인해요.', '好，晚上再确认。', '17:44')], nextNodeId: afternoonNext, delayMs: 800 },
        deferChoice(afternoonNext)
    ] });

    nodes['CH01-016'] = base({ id: 'CH01-016', app: 'calendar', threadId: null, availableFrom: '2026-10-26T18:36', notification: { title: '日历', body: '今晚：确认通识课小组任务（尚未完成时可稍后处理）' }, effects: { pendingAdd: ['晚间确认课程任务'] }, delayedEffects: [{ nextNodeId: 'CH01-017', delayMs: 900 }] });

    const eveningBranch = { branches: [
        { preconditions: [{ path: 'friendRequestAccepted', value: false }], nodeId: 'CH01-018-G' },
        { preconditions: [{ path: 'storyFlags.deferredCount', op: 'gte', value: 3 }], nodeId: 'CH01-018-D' },
        { preconditions: [{ path: 'playerTask', value: 'presentation' }], nodeId: 'CH01-018-P' },
        { preconditions: [{ path: 'playerTask', value: 'research' }], nodeId: 'CH01-018-R' }
    ], fallback: 'CH01-018-U' };
    nodes['CH01-017'] = base({ id: 'CH01-017', threadId: 'friendA', availableFrom: '2026-10-26T19:04', notification: { title: '好友A', body: '你今天怎么样？' }, npcMessages: [t('friendA', '你今天怎么样？', '', '19:04'), t('friendA', '我今天真的累死了。', '', '19:04')], playerChoices: [
        { id: 'a', text: '我也累死了。', responseMessages: [t('friendA', '那我们两个今晚都早点休息。', '', '19:06')], nextNodeId: eveningBranch, delayMs: 900 },
        { id: 'b', text: '今天小组作业好多。', responseMessages: [t('friendA', '刚开学没多久就这么忙？你们组分工顺利吗？', '', '19:06')], nextNodeId: eveningBranch, delayMs: 900, effects: { remember: [{ character: 'friendA', kind: 'heardStatements', key: 'hasGroupAssignment', value: true }] } },
        { id: 'c', text: '你先说说你怎么了。', responseMessages: [t('friendA', '连上三节课，还临时帮社团改了海报。现在只想躺着。', '', '19:06')], nextNodeId: eveningBranch, delayMs: 900, effects: { relationship: { friendA: { trust: 1 } } } },
        deferChoice(eveningBranch)
    ] });

    const goodnightBranch = { branches: [
        { preconditions: [{ path: 'storyFlags.deferredCount', op: 'gte', value: 3 }], nodeId: 'CH01-019-D' },
        { preconditions: [{ path: 'playerTask', value: 'presentation' }], nodeId: 'CH01-019-P' },
        { preconditions: [{ path: 'playerTask', value: 'research' }], nodeId: 'CH01-019-R' }
    ], fallback: 'CH01-019-U' };

    nodes['CH01-018-P'] = base({ id: 'CH01-018-P', threadId: 'jin', availableFrom: '2026-10-26T20:16', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'playerTask', value: 'presentation' }], notification: { title: '金道勋', body: '展示资料的重点我又标了一下。' }, npcMessages: [t('jin', '발표 자료에서 사례 부분을 조금 더 정리했어요.', '我又整理了一下展示资料里的案例部分。', '20:16')], playerChoices: [
        { id: 'thanks', text: '정리해 주셔서 감사해요!', translation: '谢谢你整理！', responseMessages: [t('jin', '아니에요. 발표할 때 편하시면 좋겠어요.', '没事。希望能让你展示时更方便。', '20:18')], nextNodeId: goodnightBranch, delayMs: 950 },
        { id: 'question', text: '두 번째 사례부터 설명하면 될까요?', translation: '从第二个案例开始说明可以吗？', responseMessages: [t('jin', '네, 그 순서가 더 이해하기 쉬울 것 같아요.', '可以，那个顺序应该更容易理解。', '20:18')], nextNodeId: goodnightBranch, delayMs: 950 },
        { id: 'tomorrow', text: '나머지는 내일 다시 확인해도 될까요?', translation: '剩下的明天再确认可以吗？', responseMessages: [t('jin', '물론이죠. 오늘은 여기까지만 해도 돼요.', '当然可以。今天做到这里就够了。', '20:18')], nextNodeId: goodnightBranch, delayMs: 950 },
        deferChoice(goodnightBranch)
    ], effects: { set: { 'storyFlags.eveningStarted': true } } });
    nodes['CH01-018-R'] = base({ id: 'CH01-018-R', threadId: 'jin', availableFrom: '2026-10-26T20:16', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'playerTask', value: 'research' }], notification: { title: '金道勋', body: '资料搜集进度怎么样？不用今晚全部完成。' }, npcMessages: [t('jin', '자료 조사 진행은 괜찮으세요? 오늘 다 안 하셔도 돼요.', '资料搜集进展还好吗？不用今天全部完成。', '20:16')], playerChoices: [
        { id: 'progress', text: '국내 사례 하나 찾았어요!', translation: '我找到一个韩国案例了！', responseMessages: [t('jin', '좋아요! 링크만 보내 주시면 제가 정리할게요.', '好！把链接发给我，我来整理。', '20:18')], nextNodeId: goodnightBranch, delayMs: 950, effects: { set: { 'storyFlags.researchProgress': 'oneCase' } } },
        { id: 'requirements', text: '자료 출처는 논문으로만 찾아야 할까요?', translation: '资料来源必须只找论文吗？', responseMessages: [t('jin', '기사나 학교 자료도 괜찮을 것 같아요.', '新闻报道或学校资料应该也可以。', '20:18')], nextNodeId: goodnightBranch, delayMs: 950 },
        { id: 'tomorrow', text: '오늘은 여기까지 하고 내일 더 찾아볼게요.', translation: '今天先到这里，明天再继续找。', responseMessages: [t('jin', '네, 내일 같이 확인해요.', '好，明天一起确认。', '20:18')], nextNodeId: goodnightBranch, delayMs: 950 },
        deferChoice(goodnightBranch)
    ], effects: { set: { 'storyFlags.eveningStarted': true } } });
    nodes['CH01-018-U'] = base({ id: 'CH01-018-U', threadId: 'jin', availableFrom: '2026-10-26T20:16', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'playerTask', value: 'undecided' }], notification: { title: '金道勋', body: '小组分工今晚需要确认一下。' }, npcMessages: [t('jin', '혹시 역할은 결정하셨어요? 아직이면 천천히 말씀해 주세요.', '分工决定好了吗？还没决定的话慢慢告诉我就好。', '20:16')], playerChoices: [
        { id: 'presentation', text: '저 발표 맡을게요 ㅎㅎ', translation: '我负责展示吧哈哈。', responseMessages: [t('jin', '알려 주셔서 감사해요 ㅎㅎ 발표 자료는 제가 정리할게요.', '谢谢你告诉我哈哈。展示资料我来整理。', '20:18')], nextNodeId: 'CH01-019-U', delayMs: 950, effects: { set: { playerTask: 'presentation', 'storyFlags.taskConfirmedAtNight': true }, pendingRemove: ['完成通识课第三组分工'] } },
        { id: 'research', text: '저 자료 조사할게요!', translation: '我负责资料搜集吧！', responseMessages: [t('jin', '알려 주셔서 감사해요! 범위는 제가 정리해서 보낼게요.', '谢谢你告诉我！范围我整理后发你。', '20:18')], nextNodeId: 'CH01-019-U', delayMs: 950, effects: { set: { playerTask: 'research', 'storyFlags.taskConfirmedAtNight': true }, pendingRemove: ['完成通识课第三组分工'] } },
        { id: 'consider', text: '죄송해요 ㅠㅠ 조금만 더 생각해 봐도 될까요?', translation: '不好意思呜呜，可以再让我考虑一下吗？', responseMessages: [t('jin', '네, 괜찮아요. 내일 오전에 정해도 돼요.', '没关系，明天上午决定也可以。', '20:18')], nextNodeId: 'CH01-019-D', delayMs: 950, effects: { set: { playerTask: 'undecided' }, pendingAdd: ['明天上午确认小组分工'] } },
        deferChoice('CH01-019-D')
    ], effects: { set: { 'storyFlags.eveningStarted': true } } });
    nodes['CH01-018-D'] = base({ id: 'CH01-018-D', threadId: 'jin', availableFrom: '2026-10-26T20:16', preconditions: [{ path: 'friendRequestAccepted', value: true }], notification: { title: '金道勋', body: '关于课程资料，有一件事需要确认。' }, npcMessages: [t('jin', '오늘 공유한 자료는 확인 가능하실 때 봐 주세요.', '今天分享的资料方便时确认就好。', '20:16')], playerChoices: [
        { id: 'ok', text: '네, 확인해 볼게요.', translation: '好，我会确认。', responseMessages: [t('jin', '네 감사합니다.', '好，谢谢。', '20:18')], nextNodeId: 'CH01-019-D', delayMs: 950 },
        { id: 'tomorrow', text: '내일 확인해도 될까요?', translation: '明天确认可以吗？', responseMessages: [t('jin', '네, 내일까지 확인해 주시면 돼요.', '可以，明天之前确认就行。', '20:18')], nextNodeId: 'CH01-019-D', delayMs: 950 },
        deferChoice('CH01-019-D')
    ], effects: { set: { 'storyFlags.lowInteraction': true, 'storyFlags.eveningStarted': true } } });

    nodes['CH01-018-G'] = base({ id: 'CH01-018-G', threadId: 'group3', availableFrom: '2026-10-26T20:16', preconditions: [{ path: 'friendRequestAccepted', value: false }], notification: { title: '通识课第三组', body: '课程资料已整理，需要确认发送方式。' }, npcMessages: [t('jin', '자료를 정리했는데, 파일이 커서 개인 채팅으로 보내는 게 편할 것 같아요.', '资料整理好了，不过文件比较大，私聊发送可能更方便。', '20:16'), t('jin', '불편하시면 여기 단체방에 올려도 괜찮아요.', '如果不方便，加在这个群里也可以。', '20:16')], playerChoices: [
        { id: 'accept', text: '그럼 친구 추가할게요.', translation: '那我加好友。', responseMessages: [t('jin', '네, 감사합니다. 바로 보내 드릴게요.', '好，谢谢。我马上发给你。', '20:18')], nextNodeId: 'CH01-LATE-PRIVATE', delayMs: 500, effects: { set: { friendRequestAccepted: true, friendRequestStatus: 'accepted', 'storyFlags.privateChatStarted': true }, relationship: { jin: { familiarity: 1 } } } },
        { id: 'group', text: '단체방에 올려 주셔도 괜찮아요.', translation: '发在群里也可以。', responseMessages: [t('jin', '네, 그럼 압축해서 단체방에 올릴게요.', '好，那我压缩后发到群里。', '20:18'), t('jin', '교양수업_자료.zip', '通识课_资料.zip', '20:19', { type: 'file', fileName: '교양수업_자료.zip' })], nextNodeId: 'CH01-REOFFER', delayMs: 900, effects: { set: { friendRequestStatus: 'notAccepted' }, pendingAdd: ['私人晚安互动尚未完成'] } },
        { id: 'later', label: '暂时不回复', text: '', translation: '', defer: true, nextNodeId: 'CH01-REOFFER', delayMs: 900, effects: { set: { friendRequestStatus: 'later' }, pendingAdd: ['私人晚安互动尚未完成'] } }
    ], effects: { set: { 'storyFlags.eveningStarted': true } } });

    nodes['CH01-REOFFER'] = base({ id: 'CH01-REOFFER', threadId: 'group3', availableFrom: '2026-10-26T21:32', preconditions: [{ path: 'friendRequestAccepted', value: false }], npcMessages: [t('jin', '개인적으로 확인할 내용이 생기면 친구 신청은 그대로 둘게요. 편할 때 받아 주세요.', '之后如果有需要单独确认的内容，好友申请我会保留。方便时再接受就好。', '21:32')], playerChoices: [
        { id: 'accept', text: '지금 추가할게요.', translation: '我现在加。', responseMessages: [t('jin', '네, 감사합니다!', '好，谢谢！', '21:33')], nextNodeId: 'CH01-LATE-PRIVATE', resumeNext: true, delayMs: 450, effects: { set: { friendRequestAccepted: true, friendRequestStatus: 'accepted', 'storyFlags.privateChatStarted': true } } },
        { id: 'later', label: '继续保留申请', text: '', translation: '', defer: true, effects: { set: { friendRequestStatus: 'later' }, pendingAdd: ['接受好友申请后完成第一章晚安互动'] } }
    ] });

    nodes['CH01-LATE-PRIVATE'] = base({ id: 'CH01-LATE-PRIVATE', threadId: 'jin', availableFrom: '2026-10-26T21:34', preconditions: [{ path: 'friendRequestAccepted', value: true }], notification: { title: '金道勋', body: '课程资料我发过来了。' }, npcMessages: [t('jin', '교양수업_자료.pdf', '通识课_资料.pdf', '21:34', { type: 'file', fileName: '교양수업_자료.pdf' }), t('jin', '늦게 보내서 죄송해요. 필요한 내용은 파일에 표시해 뒀어요.', '不好意思这么晚才发。需要的内容我已经标在文件里了。', '21:34')], playerChoices: [
        { id: 'thanks', text: '괜찮아요! 보내 주셔서 감사합니다.', translation: '没关系！谢谢你发给我。', responseMessages: [t('jin', '네, 그럼 오늘은 여기까지만 확인해요.', '好，那今天先确认到这里吧。', '21:35')], nextNodeId: 'CH01-019-D', delayMs: 500, effects: { relationship: { jin: { trust: 1 } } } },
        { id: 'tomorrow', text: '내일 확인하고 연락드릴게요.', translation: '我明天确认后联系你。', responseMessages: [t('jin', '네, 천천히 확인해 주세요.', '好，慢慢确认就可以。', '21:35')], nextNodeId: 'CH01-019-D', delayMs: 500 }
    ] });

    const finishEffects = { set: { 'goodnight.triggered': true, 'goodnight.playerSaidGoodnight': true, 'goodnight.npcSaidGoodnight': true }, relationship: { jin: { comfort: 1, familiarity: 1 } }, pendingRemove: ['晚间确认课程任务', '私人晚安互动尚未完成', '接受好友申请后完成第一章晚安互动'], completeChapter: true };
    const finalNext = 'CH01-019-FINAL';
    nodes['CH01-019-P'] = base({ id: 'CH01-019-P', threadId: 'jin', availableFrom: '2026-10-26T21:30', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'playerTask', value: 'presentation' }], notification: { title: '金道勋', body: '今天也辛苦啦！' }, npcMessages: [t('jin', '일단 자료는 여기까지 정리했어요!', '资料暂时整理到这里啦！', '21:30'), t('jin', '나머지는 내일 확인해도 될 것 같아요 ㅎㅎ', '剩下的明天再确认应该也可以哈哈。', '21:30'), t('jin', '오늘도 고생 많으셨어요!', '今天也辛苦啦！', '21:31')], playerChoices: [
        { id: 'a', text: '도훈 씨도 고생 많으셨어요 ㅎㅎ 푹 쉬세요!', translation: '道勋你也辛苦啦哈哈，好好休息！', responseMessages: [t('jin', '감사합니다 ㅎㅎ 좋은 밤 보내세요!', '谢谢哈哈，祝你晚上愉快！', '21:32')], effects: finishEffects },
        { id: 'b', text: '자료 정리해 주셔서 감사해요!', translation: '谢谢你整理资料！', responseMessages: [t('jin', '아니에요 ㅎㅎ 오늘은 푹 쉬세요.', '没事哈哈，今天好好休息。', '21:32')], nextNodeId: finalNext, delayMs: 350 },
        { id: 'c', text: '그럼 내일 다시 확인해요 ㅎㅎ', translation: '那我们明天再确认吧哈哈。', responseMessages: [t('jin', '네, 내일 다시 연락드릴게요. 좋은 밤 보내세요!', '好，明天再联系。祝你晚上愉快！', '21:32')], nextNodeId: finalNext, delayMs: 350 }
    ], effects: { set: { 'goodnight.triggered': true } } });
    nodes['CH01-019-R'] = base({ id: 'CH01-019-R', threadId: 'jin', availableFrom: '2026-10-26T21:30', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'playerTask', value: 'research' }], notification: { title: '金道勋', body: '今天找资料辛苦啦！' }, npcMessages: [t('jin', '오늘 자료 찾느라 고생하셨어요!', '今天找资料辛苦啦！', '21:30'), t('jin', '나머지는 내일 같이 확인해 봐요 ㅎㅎ', '剩下的明天再一起确认吧哈哈。', '21:31')], playerChoices: [
        { id: 'a', text: '네 ㅎㅎ 도훈 씨도 푹 쉬세요!', translation: '嗯哈哈，道勋你也好好休息！', responseMessages: [t('jin', '감사합니다. 좋은 밤 보내세요!', '谢谢。祝你晚上愉快！', '21:32')], effects: finishEffects },
        { id: 'b', text: '네! 내일 자료 더 찾아볼게요.', translation: '好！明天我再找些资料。', responseMessages: [t('jin', '무리하지 마세요 ㅎㅎ 내일 천천히 해요.', '别太勉强哈哈，明天慢慢来。', '21:32')], nextNodeId: finalNext, delayMs: 350 },
        { id: 'c', text: '오늘 도와주셔서 감사해요!', translation: '谢谢你今天帮忙！', responseMessages: [t('jin', '저도 도움 많이 받았어요. 푹 쉬세요!', '我也得到很多帮助。好好休息！', '21:32')], nextNodeId: finalNext, delayMs: 350 }
    ], effects: { set: { 'goodnight.triggered': true } } });
    nodes['CH01-019-U'] = base({ id: 'CH01-019-U', threadId: 'jin', availableFrom: '2026-10-26T21:30', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'storyFlags.taskConfirmedAtNight', value: true }], notification: { title: '金道勋', body: '谢谢你告诉我哈哈。' }, npcMessages: [t('jin', '알려 주셔서 감사해요 ㅎㅎ', '谢谢你告诉我哈哈。', '21:30'), t('jin', '그럼 내일 자료 정리해서 공유할게요!', '那我明天整理好资料分享给你！', '21:31')], playerChoices: [
        { id: 'a', text: '네 감사합니다! 좋은 밤 보내세요 ㅎㅎ', translation: '嗯谢谢！晚安哈哈。', responseMessages: [t('jin', '네, 좋은 밤 보내세요!', '好，祝你晚上愉快！', '21:32')], effects: finishEffects },
        { id: 'b', text: '늦게 연락드려서 죄송해요 ㅠㅠ', translation: '不好意思这么晚联系呜呜。', responseMessages: [t('jin', '괜찮아요 ㅎㅎ 아직 안 늦었어요. 푹 쉬세요!', '没关系哈哈，还不算晚。好好休息！', '21:32')], nextNodeId: finalNext, delayMs: 350 },
        { id: 'c', text: '네! 그럼 내일 연락드릴게요.', translation: '好！那我明天再联系你。', responseMessages: [t('jin', '네, 내일 봬요. 좋은 밤 보내세요!', '好，明天见。祝你晚上愉快！', '21:32')], nextNodeId: finalNext, delayMs: 350 }
    ], effects: { set: { 'goodnight.triggered': true } } });
    nodes['CH01-019-D'] = base({ id: 'CH01-019-D', threadId: 'jin', availableFrom: '2026-10-26T21:30', preconditions: [{ path: 'friendRequestAccepted', value: true }], notification: { title: '金道勋', body: '今天也辛苦了。' }, npcMessages: [t('jin', '네 그럼 내일 확인해 볼게요!', '嗯，那我明天确认一下！', '21:30'), t('jin', '오늘도 수고하셨어요.', '今天也辛苦了。', '21:31')], playerChoices: [
        { id: 'a', text: '네! 좋은 밤 보내세요.', translation: '嗯！晚安。', responseMessages: [t('jin', '네, 좋은 밤 보내세요.', '好，祝你晚上愉快。', '21:32')], effects: finishEffects },
        { id: 'b', text: '감사합니다 ㅎㅎ', translation: '谢谢哈哈。', responseMessages: [t('jin', '아니에요. 푹 쉬세요!', '没事。好好休息！', '21:32')], nextNodeId: finalNext, delayMs: 350 },
        { id: 'c', text: '내일 뵐게요!', translation: '明天见！', responseMessages: [t('jin', '네, 내일 봬요. 좋은 밤 보내세요!', '好，明天见。祝你晚上愉快！', '21:32')], nextNodeId: finalNext, delayMs: 350 }
    ], effects: { set: { 'goodnight.triggered': true } } });
    nodes['CH01-019-FINAL'] = base({ id: 'CH01-019-FINAL', threadId: 'jin', availableFrom: '2026-10-26T21:33', preconditions: [{ path: 'friendRequestAccepted', value: true }, { path: 'chapterCompleted', value: false }], npcMessages: [], playerChoices: [
        { id: 'goodnight', text: '네, 도훈 씨도 푹 쉬세요!', translation: '嗯，道勋你也好好休息！', responseMessages: [t('jin', '감사합니다. 내일 봬요!', '谢谢。明天见！', '21:34')], effects: finishEffects },
        { id: 'tomorrow', text: '네! 내일 봬요. 좋은 밤 보내세요!', translation: '好！明天见，晚安！', responseMessages: [t('jin', '네, 좋은 밤 보내세요!', '好，祝你晚上愉快！', '21:34')], effects: finishEffects }
    ], effects: { set: { 'goodnight.npcSaidGoodnight': true } } });

    return {
        gameTitle: '和校园里那个很受欢迎的男生谈恋爱',
        initialNodeId: 'CH01-001',
        threads: {
            friendA: { id: 'friendA', name: '好友A', subtitle: '中国好友', kind: 'direct', avatar: 'friend' },
            classmateA: { id: 'classmateA', name: '同学A', subtitle: '同校同学', kind: 'direct', avatar: 'classmate' },
            group3: { id: 'group3', name: '通识课第三组', subtitle: '5名成员', kind: 'group', avatar: 'group' },
            jin: { id: 'jin', name: '金道勋', koreanName: '김도훈', subtitle: '大三', kind: 'direct', avatar: '../img/jin-dohun-avatar.jpg' },
            friendRequest: { id: 'friendRequest', name: '好友申请', kind: 'system', avatar: 'request' }
        },
        nodes
    };
}));
