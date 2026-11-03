(function () {
    'use strict';
    if (!window.TWSGameCore || !window.TWSStoryData) throw new Error('剧情运行时加载顺序错误');
    const profile = window.TWSProfile && window.TWSProfile.load ? window.TWSProfile.load() : null;
    const api = window.TWSGameCore.createBrowserAPI(window.TWSStoryData, profile ? profile.name : '');
    const engine = api.engine();
    if (profile) engine.start(profile.name, false);
    window.TWSGame = api;
    window.TWSGameData = window.TWSStoryData;
}());
