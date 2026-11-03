'use strict';

const assert = require('assert');
const data = require('../game/story-data.js');
const { StoryEngine } = require('../game/engine.js');

class MemoryStorage {
    constructor() { this.map = new Map(); }
    getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
    setItem(key, value) { this.map.set(key, String(value)); }
    removeItem(key) { this.map.delete(key); }
}

function createGame() {
    const storage = new MemoryStorage();
    const engine = new StoryEngine(data, { storage, playerName: '林夏' });
    engine.start('林夏', true);
    return { engine, storage };
}

function choose(engine, nodeId, choiceId) {
    assert(engine.state.activeNodes.includes(nodeId), `${nodeId} should be active; active=${engine.state.activeNodes.join(',')}`);
    engine.choose(nodeId, choiceId);
    engine.flushAllScheduled();
    return engine.state;
}

function reachTaskChoice(engine, taskChoice) {
    choose(engine, 'CH01-001', 'a');
    choose(engine, 'CH01-002', 'b');
    choose(engine, 'CH01-003', 'a');
    choose(engine, 'CH01-004', 'b');
    choose(engine, 'CH01-005', 'accept');
    choose(engine, 'CH01-006', 'a');
    assert.strictEqual(engine.state.characterMemory.jin.confirmedFacts, undefined, 'nationality must not be known before player says it');
    choose(engine, 'CH01-007', 'a');
    choose(engine, 'CH01-008', 'b');
    choose(engine, 'CH01-009', 'c');
    choose(engine, 'CH01-010', taskChoice);
    choose(engine, 'CH01-011', 'a');
    assert(engine.state.activeNodes.includes('CH01-014'));
}

function finishPresentationRoute() {
    const { engine } = createGame();
    reachTaskChoice(engine, 'presentation');
    choose(engine, 'CH01-014', 'a');
    choose(engine, 'CH01-015-P', 'thanks');
    choose(engine, 'CH01-017', 'b');
    choose(engine, 'CH01-018-P', 'question');
    choose(engine, 'CH01-019-P', 'a');
    assert.strictEqual(engine.state.chapterCompleted, true);
    assert.strictEqual(engine.state.goodnight.completed, true);
    assert.strictEqual(engine.state.playerTask, 'presentation');
    return engine;
}

function finishResearchRoute() {
    const { engine } = createGame();
    reachTaskChoice(engine, 'research');
    choose(engine, 'CH01-014', 'b');
    choose(engine, 'CH01-015-R', 'example');
    choose(engine, 'CH01-017', 'a');
    choose(engine, 'CH01-018-R', 'progress');
    choose(engine, 'CH01-019-R', 'b');
    choose(engine, 'CH01-019-FINAL', 'goodnight');
    assert.strictEqual(engine.state.chapterCompleted, true);
    assert.strictEqual(engine.state.playerTask, 'research');
    return engine;
}

function finishUndecidedRoute() {
    const { engine } = createGame();
    reachTaskChoice(engine, 'undecided');
    assert(engine.state.pendingTasks.includes('完成通识课第三组分工'), 'undecided task must remain pending');
    choose(engine, 'CH01-014', 'c');
    choose(engine, 'CH01-015-U', 'consider');
    choose(engine, 'CH01-017', 'c');
    choose(engine, 'CH01-018-U', 'presentation');
    choose(engine, 'CH01-019-U', 'a');
    assert.strictEqual(engine.state.chapterCompleted, true);
    assert.strictEqual(engine.state.storyFlags.taskConfirmedAtNight, true);
    return engine;
}

function finishLowInteractionRoute() {
    const { engine } = createGame();
    choose(engine, 'CH01-001', 'defer');
    choose(engine, 'CH01-002', 'defer');
    choose(engine, 'CH01-003', 'defer');
    choose(engine, 'CH01-004', 'a');
    choose(engine, 'CH01-005', 'accept');
    choose(engine, 'CH01-006', 'a');
    choose(engine, 'CH01-007', 'd');
    choose(engine, 'CH01-009', 'd');
    choose(engine, 'CH01-010', 'presentation');
    choose(engine, 'CH01-011', 'a');
    choose(engine, 'CH01-014', 'a');
    choose(engine, 'CH01-015-P', 'later');
    choose(engine, 'CH01-017', 'a');
    assert(engine.state.activeNodes.includes('CH01-018-D'));
    choose(engine, 'CH01-018-D', 'ok');
    choose(engine, 'CH01-019-D', 'a');
    assert.strictEqual(engine.state.chapterCompleted, true);
    assert.strictEqual(engine.state.storyFlags.lowInteraction, true);
    return engine;
}

function delayedFriendRoute() {
    const { engine } = createGame();
    choose(engine, 'CH01-001', 'a');
    choose(engine, 'CH01-002', 'a');
    choose(engine, 'CH01-003', 'b');
    choose(engine, 'CH01-004', 'c');
    choose(engine, 'CH01-005', 'not_now');
    assert.strictEqual(engine.state.friendRequestAccepted, false);
    assert.strictEqual(engine.state.messages.some((message) => message.threadId === 'jin'), false, 'no private chat before acceptance');
    assert(engine.state.activeNodes.includes('CH01-014'));
    choose(engine, 'CH01-014', 'a');
    choose(engine, 'CH01-015-G', 'presentation');
    choose(engine, 'CH01-017', 'b');
    choose(engine, 'CH01-018-G', 'group');
    choose(engine, 'CH01-REOFFER', 'later');
    assert.strictEqual(engine.state.chapterCompleted, false, 'chapter must not fake goodnight');
    assert.strictEqual(engine.state.goodnight.playerSaidGoodnight, false);
    choose(engine, 'CH01-REOFFER', 'accept');
    choose(engine, 'CH01-LATE-PRIVATE', 'thanks');
    choose(engine, 'CH01-019-D', 'a');
    assert.strictEqual(engine.state.friendRequestAccepted, true);
    assert.strictEqual(engine.state.chapterCompleted, true);
    return engine;
}

function taskChangeRoute() {
    const { engine } = createGame();
    reachTaskChoice(engine, 'presentation');
    choose(engine, 'CH01-014', 'a');
    choose(engine, 'CH01-015-P', 'change');
    assert.strictEqual(engine.state.playerTask, 'research');
    choose(engine, 'CH01-017', 'a');
    assert(engine.state.activeNodes.includes('CH01-018-R'));
    return engine;
}

(function run() {
    assert.strictEqual(data.gameTitle, '和校园里那个很受欢迎的男生谈恋爱');
    assert.strictEqual(Object.keys(data.nodes).length >= 25, true, 'expected a complete chapter graph');
    Object.values(data.nodes).forEach((node) => {
        ['id', 'chapterId', 'app', 'threadId', 'availableFrom', 'preconditions', 'npcMessages', 'playerChoices', 'effects', 'nextNodeId', 'delayedEffects', 'invalidationRules', 'convergenceRules'].forEach((key) => {
            assert(Object.prototype.hasOwnProperty.call(node, key), `${node.id} must define ${key}`);
        });
        node.playerChoices.forEach((choice) => {
            ['immediateEffect', 'stateEffect', 'delayedEffect', 'chapterCarryover', 'convergenceRule', 'invalidationRule'].forEach((key) => {
                assert(Object.prototype.hasOwnProperty.call(choice, key), `${node.id}/${choice.id} must define ${key}`);
            });
        });
    });

    const initial = createGame().engine;
    assert.strictEqual(initial.state.gameDate, '2026-10-26');
    assert.strictEqual(initial.state.gameTime, '08:12');
    assert.strictEqual(initial.state.storyFlags.forumUpdateAvailable, undefined, 'future forum post must be unavailable initially');
    assert.strictEqual(initial.state.messages.filter((m) => m.nodeId === 'CH01-001').length, 2);

    const presentation = finishPresentationRoute();
    const messageIds = presentation.state.messages.map((message) => message.id);
    assert.strictEqual(new Set(messageIds).size, messageIds.length, 'messages must be unique');
    assert.strictEqual(presentation.state.characterMemory.jin.confirmedFacts.playerFromChina.value, true);
    assert.strictEqual(presentation.state.characterMemory.friendA.confirmedFacts, undefined, 'friend A must not know private Jin facts');
    assert.strictEqual(presentation.enterChapterTwo(), true);
    assert.strictEqual(presentation.state.chapter, 2);
    assert.strictEqual(presentation.state.gameDate, '2026-10-27');

    finishResearchRoute();
    finishUndecidedRoute();
    finishLowInteractionRoute();
    delayedFriendRoute();
    taskChangeRoute();

    const { engine, storage } = createGame();
    choose(engine, 'CH01-001', 'a');
    const restored = new StoryEngine(data, { storage, playerName: 'ignored' });
    restored.start('ignored', false);
    assert.strictEqual(restored.state.playerName, '林夏');
    assert.strictEqual(restored.state.messages.length, engine.state.messages.length, 'save restore must not duplicate messages');

    console.log('Chapter 1 tests passed: presentation, research, undecided, low-interaction, delayed-friend, task-change, persistence, memory isolation.');
}());
