(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.TWSGameCore = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const SAVE_KEY = 'tws-phone.story-save.v1';
    const GAME_TITLE = '和校园里那个很受欢迎的男生谈恋爱';

    function clone(value) {
        return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    }

    function getPath(object, path) {
        return String(path).split('.').reduce((value, key) => value === undefined || value === null ? undefined : value[key], object);
    }

    function setPath(object, path, value) {
        const keys = String(path).split('.');
        const last = keys.pop();
        const target = keys.reduce((cursor, key) => {
            if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = {};
            return cursor[key];
        }, object);
        target[last] = value;
    }

    function compareTime(a, b) {
        return String(a || '').localeCompare(String(b || ''));
    }

    function initialState(playerName) {
        return {
            version: 1,
            gameTitle: GAME_TITLE,
            playerName: String(playerName || '').trim().slice(0, 20),
            chapter: 1,
            chapterLabel: '第一章',
            gameDate: '2026-10-26',
            gameTime: '08:12',
            playerTask: 'undecided',
            friendRequestAccepted: false,
            friendRequestStatus: 'pending',
            relationship: {
                jin: { familiarity: 0, trust: 0, comfort: 0, romanticInterest: 0 },
                friendA: { familiarity: 35, trust: 30, comfort: 35, romanticInterest: 0 },
                classmateA: { familiarity: 8, trust: 5, comfort: 4, romanticInterest: 0 }
            },
            characterMemory: { jin: {}, friendA: {}, classmateA: {}, group3: {} },
            messages: [],
            choices: [],
            events: [],
            activeNodes: [],
            deferredNodes: [],
            scheduledEvents: [],
            notifications: [],
            unreadByThread: {},
            threadSeenAt: {},
            forumInteractions: [],
            goodnight: { triggered: false, playerSaidGoodnight: false, npcSaidGoodnight: false, completed: false },
            pendingTasks: ['完成通识课第三组分工', '在合适的时机回复当天消息'],
            storyFlags: { privateChatStarted: false, firstChatClosed: false, afternoonStarted: false, eveningStarted: false, lowInteraction: false },
            progressedFrom: {},
            chapterCompleted: false,
            nextChapterUnlocked: false,
            lastThreadId: 'friendA',
            updatedAt: new Date().toISOString()
        };
    }

    class SaveManager {
        constructor(storage, key) {
            this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
            this.key = key || SAVE_KEY;
        }
        load() {
            if (!this.storage) return null;
            try {
                const value = JSON.parse(this.storage.getItem(this.key) || 'null');
                return value && typeof value === 'object' ? value : null;
            } catch (error) {
                return null;
            }
        }
        save(state) {
            state.updatedAt = new Date().toISOString();
            if (this.storage) this.storage.setItem(this.key, JSON.stringify(state));
            return state;
        }
        clear() {
            if (this.storage) this.storage.removeItem(this.key);
        }
    }

    class GameStore {
        constructor(saveManager, playerName) {
            this.saveManager = saveManager;
            this.state = saveManager.load() || initialState(playerName);
        }
        load() {
            this.state = this.saveManager.load() || this.state;
            return this.state;
        }
        save() {
            this.saveManager.save(this.state);
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tws-game-updated', { detail: clone(this.state) }));
            return this.state;
        }
        reset(playerName) {
            this.state = initialState(playerName);
            return this.save();
        }
    }

    class CharacterMemory {
        constructor(state) { this.state = state; }
        remember(character, kind, key, value, sourceNodeId) {
            if (!this.state.characterMemory[character]) this.state.characterMemory[character] = {};
            if (!this.state.characterMemory[character][kind]) this.state.characterMemory[character][kind] = {};
            this.state.characterMemory[character][kind][key] = { value: clone(value), sourceNodeId, recordedAt: `${this.state.gameDate}T${this.state.gameTime}` };
        }
        recall(character, kind, key) {
            return getPath(this.state.characterMemory, `${character}.${kind}.${key}.value`);
        }
    }

    class RelationshipManager {
        constructor(state) { this.state = state; }
        adjust(character, changes) {
            if (!this.state.relationship[character]) this.state.relationship[character] = { familiarity: 0, trust: 0, comfort: 0, romanticInterest: 0 };
            Object.keys(changes || {}).forEach((key) => {
                const current = Number(this.state.relationship[character][key] || 0);
                const delta = Number(changes[key] || 0);
                this.state.relationship[character][key] = Math.max(0, Math.min(100, current + delta));
            });
        }
    }

    class BranchResolver {
        constructor(state) { this.state = state; }
        passes(preconditions) {
            return (preconditions || []).every((condition) => {
                const actual = getPath(this.state, condition.path);
                if (condition.op === 'neq') return actual !== condition.value;
                if (condition.op === 'in') return (condition.value || []).includes(actual);
                if (condition.op === 'notIn') return !(condition.value || []).includes(actual);
                if (condition.op === 'gte') return Number(actual) >= Number(condition.value);
                if (condition.op === 'truthy') return Boolean(actual);
                if (condition.op === 'falsy') return !actual;
                return actual === condition.value;
            });
        }
        resolveNext(candidate) {
            if (!candidate) return null;
            if (typeof candidate === 'string') return candidate;
            const branches = Array.isArray(candidate) ? candidate : candidate.branches;
            const match = (branches || []).find((branch) => this.passes(branch.preconditions));
            return match ? match.nodeId : (candidate.fallback || null);
        }
    }

    class EventScheduler {
        constructor(state) { this.state = state; }
        schedule(nodeId, delayMs, sourceNodeId) {
            if (!nodeId) return;
            if (this.state.events.some((event) => event.id === nodeId) || this.state.scheduledEvents.some((event) => event.nodeId === nodeId)) return;
            this.state.scheduledEvents.push({ nodeId, dueAt: Date.now() + Math.max(0, Number(delayMs || 0)), sourceNodeId: sourceNodeId || null });
        }
        due(force) {
            const now = Date.now();
            return this.state.scheduledEvents.filter((event) => force || event.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
        }
        remove(nodeId) {
            this.state.scheduledEvents = this.state.scheduledEvents.filter((event) => event.nodeId !== nodeId);
        }
        invalidate(nodeIds) {
            const set = new Set(nodeIds || []);
            this.state.scheduledEvents = this.state.scheduledEvents.filter((event) => !set.has(event.nodeId));
        }
    }

    class StoryEngine {
        constructor(storyData, options) {
            if (!storyData || !storyData.nodes) throw new Error('缺少剧情数据');
            this.data = storyData;
            const config = options || {};
            this.saveManager = config.saveManager || new SaveManager(config.storage, config.key);
            this.store = new GameStore(this.saveManager, config.playerName || '');
        }
        get state() { return this.store.state; }
        reload() { this.store.load(); return this.state; }
        start(playerName, reset) {
            const loaded = this.saveManager.load();
            if (reset || !loaded) this.store.reset(playerName);
            else {
                this.store.state = loaded;
                if (playerName && !loaded.playerName) this.store.state.playerName = String(playerName).trim().slice(0, 20);
            }
            if (!this.state.events.length) this.deliver(this.data.initialNodeId);
            return this.state;
        }
        node(id) { return this.data.nodes[id] || null; }
        event(id) { return this.state.events.find((event) => event.id === id); }
        applyEffects(effects, sourceNodeId) {
            if (!effects) return;
            Object.entries(effects.set || {}).forEach(([path, value]) => setPath(this.state, path, clone(value)));
            Object.entries(effects.inc || {}).forEach(([path, value]) => setPath(this.state, path, Number(getPath(this.state, path) || 0) + Number(value || 0)));
            Object.entries(effects.relationship || {}).forEach(([character, changes]) => new RelationshipManager(this.state).adjust(character, changes));
            (effects.remember || []).forEach((memory) => new CharacterMemory(this.state).remember(memory.character, memory.kind, memory.key, memory.value, sourceNodeId));
            (effects.pendingAdd || []).forEach((task) => { if (!this.state.pendingTasks.includes(task)) this.state.pendingTasks.push(task); });
            (effects.pendingRemove || []).forEach((task) => { this.state.pendingTasks = this.state.pendingTasks.filter((item) => item !== task); });
            if (effects.invalidateNodes) new EventScheduler(this.state).invalidate(effects.invalidateNodes);
            if (effects.completeChapter) this.completeChapter();
        }
        addMessage(node, message, index, senderOverride) {
            const sender = senderOverride || message.sender;
            const id = message.id || `${node.id}:${sender}:${index}`;
            if (this.state.messages.some((item) => item.id === id)) return;
            const entry = {
                id,
                nodeId: node.id,
                chapterId: node.chapterId,
                threadId: message.threadId || node.threadId,
                sender,
                text: message.text || '',
                translation: message.translation || '',
                type: message.type || 'text',
                fileName: message.fileName || '',
                time: message.time || node.availableFrom.slice(11, 16),
                date: node.availableFrom.slice(0, 10),
                status: sender === 'player' ? 'sent' : 'unread',
                meta: clone(message.meta || {})
            };
            this.state.messages.push(entry);
            this.state.messages.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
            if (sender !== 'player') this.state.unreadByThread[entry.threadId] = Number(this.state.unreadByThread[entry.threadId] || 0) + 1;
        }
        addNotification(node) {
            if (!node.notification) return;
            const id = `notification:${node.id}`;
            if (this.state.notifications.some((item) => item.id === id)) return;
            this.state.notifications.push({ id, nodeId: node.id, app: node.app, threadId: node.threadId || null, title: node.notification.title, body: node.notification.body, time: node.availableFrom.slice(11, 16), read: false });
        }
        scheduleNext(candidate, delayMs, sourceNodeId) {
            const nextNodeId = new BranchResolver(this.state).resolveNext(candidate);
            if (!nextNodeId) return;
            new EventScheduler(this.state).schedule(nextNodeId, delayMs === undefined ? 650 : delayMs, sourceNodeId);
        }
        deliver(nodeId) {
            const node = this.node(nodeId);
            if (!node || this.event(nodeId)) return false;
            if (!new BranchResolver(this.state).passes(node.preconditions)) {
                if (node.invalidationRules && node.invalidationRules.fallbackNodeId) this.scheduleNext(node.invalidationRules.fallbackNodeId, 0, nodeId);
                return false;
            }
            const dateTime = node.availableFrom.split('T');
            this.state.gameDate = dateTime[0];
            this.state.gameTime = dateTime[1].slice(0, 5);
            (node.npcMessages || []).forEach((message, index) => this.addMessage(node, message, index));
            this.addNotification(node);
            this.applyEffects(node.effects, node.id);
            const event = { id: node.id, chapterId: node.chapterId, status: node.playerChoices && node.playerChoices.length ? 'waiting' : 'completed', triggeredAt: `${this.state.gameDate}T${this.state.gameTime}`, app: node.app, threadId: node.threadId || null };
            this.state.events.push(event);
            if (node.playerChoices && node.playerChoices.length) {
                if (!this.state.activeNodes.includes(node.id)) this.state.activeNodes.push(node.id);
                this.state.lastThreadId = node.threadId || this.state.lastThreadId;
            } else {
                (node.delayedEffects || []).forEach((effect) => this.scheduleNext(effect.nextNodeId, effect.delayMs, node.id));
                this.scheduleNext(node.nextNodeId, node.nextDelayMs, node.id);
            }
            this.store.save();
            return true;
        }
        choose(nodeId, choiceId) {
            this.reload();
            const node = this.node(nodeId);
            const choice = node && (node.playerChoices || []).find((item) => item.id === choiceId);
            const event = this.event(nodeId);
            if (!node || !choice || !event || !this.state.activeNodes.includes(nodeId)) throw new Error('这个选项当前不可用');
            const recordId = `${nodeId}:${choiceId}:${this.state.choices.filter((item) => item.nodeId === nodeId).length}`;
            this.state.choices.push({ id: recordId, nodeId, choiceId, text: choice.text || '', translation: choice.translation || '', deferred: Boolean(choice.defer), chosenAt: `${this.state.gameDate}T${this.state.gameTime}`, immediateEffect: choice.immediateEffect || null, stateEffect: choice.effects || null, delayedEffect: choice.delayedEffect || null, chapterCarryover: choice.chapterCarryover || null, convergenceRule: choice.convergenceRule || node.convergenceRules || null, invalidationRule: choice.invalidationRule || node.invalidationRules || null });
            if (choice.defer) {
                event.status = 'deferred';
                if (!this.state.deferredNodes.includes(nodeId)) this.state.deferredNodes.push(nodeId);
                this.applyEffects(choice.effects, nodeId);
                if (!this.state.progressedFrom[nodeId]) {
                    this.state.progressedFrom[nodeId] = true;
                    this.scheduleNext(choice.nextNodeId || node.nextNodeId, choice.delayMs, nodeId);
                }
                this.store.save();
                return this.state;
            }
            const wasDeferred = event.status === 'deferred';
            this.state.activeNodes = this.state.activeNodes.filter((id) => id !== nodeId);
            this.state.deferredNodes = this.state.deferredNodes.filter((id) => id !== nodeId);
            event.status = 'resolved';
            event.resolvedAt = `${this.state.gameDate}T${this.state.gameTime}`;
            if (choice.send !== false && (choice.text || choice.translation)) {
                this.addMessage(node, { sender: 'player', text: choice.text, translation: choice.translation, time: choice.time || this.state.gameTime }, `choice:${choice.id}`, 'player');
            }
            (choice.responseMessages || []).forEach((message, index) => this.addMessage(node, wasDeferred ? Object.assign({}, message, { time: this.state.gameTime }) : message, `response:${choice.id}:${index}`));
            this.applyEffects(choice.effects, nodeId);
            if (!this.state.progressedFrom[nodeId] || choice.resumeNext) this.scheduleNext(choice.nextNodeId || node.nextNodeId, choice.delayMs, nodeId);
            (choice.delayedEffects || []).forEach((effect) => this.scheduleNext(effect.nextNodeId, effect.delayMs, nodeId));
            this.store.save();
            return this.state;
        }
        runScheduler(force) {
            this.reload();
            const scheduler = new EventScheduler(this.state);
            const due = scheduler.due(Boolean(force));
            if (!due.length) return [];
            const delivered = [];
            due.forEach((item) => {
                scheduler.remove(item.nodeId);
                if (this.deliver(item.nodeId)) delivered.push(item.nodeId);
            });
            this.store.save();
            return delivered;
        }
        flushAllScheduled(limit) {
            const delivered = [];
            let guard = Number(limit || 100);
            while (guard-- > 0) {
                const batch = this.runScheduler(true);
                if (!batch.length) break;
                delivered.push(...batch);
            }
            return delivered;
        }
        markThreadRead(threadId) {
            this.reload();
            this.state.unreadByThread[threadId] = 0;
            this.state.threadSeenAt[threadId] = `${this.state.gameDate}T${this.state.gameTime}`;
            this.state.messages.forEach((message) => { if (message.threadId === threadId && message.sender !== 'player') message.status = 'read'; });
            this.state.notifications.forEach((notification) => { if (notification.threadId === threadId) notification.read = true; });
            this.store.save();
        }
        forumAction(postId, action, value) {
            this.reload();
            const existing = this.state.forumInteractions.find((item) => item.postId === postId);
            if (existing) existing[action] = value === undefined ? true : value;
            else this.state.forumInteractions.push({ postId, [action]: value === undefined ? true : value });
            this.store.save();
        }
        completeChapter() {
            this.state.goodnight.completed = true;
            this.state.chapterCompleted = true;
            this.state.nextChapterUnlocked = true;
            this.state.pendingTasks = this.state.pendingTasks.filter((task) => !/晚安|第一章/.test(task));
        }
        enterChapterTwo() {
            this.reload();
            if (!this.state.nextChapterUnlocked) return false;
            this.state.chapter = 2;
            this.state.chapterLabel = '第二章';
            this.state.gameDate = '2026-10-27';
            this.state.gameTime = '08:10';
            this.store.save();
            return true;
        }
        activeNodesForThread(threadId) {
            return this.state.activeNodes.map((id) => this.node(id)).filter((node) => node && node.threadId === threadId);
        }
    }

    function createBrowserAPI(storyData, profileName) {
        let instance = null;
        return {
            SAVE_KEY,
            GAME_TITLE,
            engine() {
                if (!instance) instance = new StoryEngine(storyData, { playerName: profileName || '' });
                return instance;
            },
            reset(name) {
                instance = new StoryEngine(storyData, { playerName: name || profileName || '' });
                instance.start(name || profileName || '', true);
                return instance;
            }
        };
    }

    return { SAVE_KEY, GAME_TITLE, initialState, SaveManager, GameStore, CharacterMemory, RelationshipManager, BranchResolver, EventScheduler, StoryEngine, createBrowserAPI, getPath, setPath };
}));
