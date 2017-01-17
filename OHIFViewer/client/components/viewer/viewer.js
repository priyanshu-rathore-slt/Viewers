import { OHIF } from 'meteor/ohif:core';
import 'meteor/ohif:viewerbase';
import 'meteor/ohif:metadata';

OHIF.viewer = OHIF.viewer || {};
OHIF.viewer.defaultTool = 'wwwc';
OHIF.viewer.refLinesEnabled = true;
OHIF.viewer.cine = {
    framesPerSecond: 24,
    loop: true
};

OHIF.viewer.functionList = {
    toggleCineDialog: OHIF.viewerbase.viewportUtils.toggleCineDialog,
    toggleCinePlay: OHIF.viewerbase.viewportUtils.toggleCinePlay,
    clearTools: OHIF.viewerbase.viewportUtils.clearTools,
    resetViewport: OHIF.viewerbase.viewportUtils.resetViewport,
    invert: OHIF.viewerbase.viewportUtils.invert
};

Session.setDefault('activeViewport', false);
Session.setDefault('leftSidebar', false);
Session.setDefault('rightSidebar', false);

Template.viewer.onCreated(() => {
    const instance = Template.instance();

    instance.data.state = new ReactiveDict();
    instance.data.state.set('leftSidebar', Session.get('leftSidebar'));
    instance.data.state.set('rightSidebar', Session.get('rightSidebar'));

    const contentId = instance.data.contentId;

    if (ViewerData[contentId] && ViewerData[contentId].loadedSeriesData) {
        OHIF.log.info('Reloading previous loadedSeriesData');
        OHIF.viewer.loadedSeriesData = ViewerData[contentId].loadedSeriesData;
    } else {
        OHIF.log.info('Setting default ViewerData');
        OHIF.viewer.loadedSeriesData = {};
        ViewerData[contentId] = {};
        ViewerData[contentId].loadedSeriesData = OHIF.viewer.loadedSeriesData;

        // Update the viewer data object
        ViewerData[contentId].viewportColumns = 1;
        ViewerData[contentId].viewportRows = 1;
        ViewerData[contentId].activeViewport = 0;
    }

    Session.set('activeViewport', ViewerData[contentId].activeViewport || 0);

    // @TypeSafeStudies
    debugger;

    // Update the OHIF.viewer.Studies collection with the loaded studies
    OHIF.viewer.Studies.removeAll();

    ViewerData[contentId].studyInstanceUids = [];
    instance.data.studies.forEach(study => {
        study.selected = true;
        study.displaySets = OHIF.viewerbase.createStacks(study);
        // const studyMetadata = new OHIF.metadata.StudyMetadata(study);
        // study.displaySets = OHIF.viewerbase.sortingManager.getDisplaySets(studyMetadata);
        OHIF.viewer.Studies.insert(study);
        ViewerData[contentId].studyInstanceUids.push(study.studyInstanceUid);
    });

    Session.set('ViewerData', ViewerData);
});

Template.viewer.events({
    'click .js-toggle-studies'() {
        const instance = Template.instance();
        const current = instance.data.state.get('leftSidebar');
        instance.data.state.set('leftSidebar', !current);
    },
    'click .js-toggle-protocol-editor'() {
        const instance = Template.instance();
        const current = instance.data.state.get('rightSidebar');
        instance.data.state.set('rightSidebar', !current);
    },
});
