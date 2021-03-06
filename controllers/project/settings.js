"use strict";

/**
 * settings.js - project settings
 *
 * /project/:projectId/settings/* 
 * 
 * Copyright (C) 2016 Anton Zagorskii aka amberovsky. All rights reserved. Contacts: <amberovsky@gmail.com>
 */

/**
 * @param {Application} application - application
 */
module.exports.controller = function (application) {

    /**
     * Route to settings page
     *
     * @param {Object} request - expressjs request
     * @param {Object} response - expressjs response
     * @param {(null|ProjectLog)} projectLog - project log
     * @param {(null|string)} errorMsg - error message, if present
     * @param {(null|string)} successMsg - successs message, if present
     */
    function routeToSettingsPage(request, response, projectLog, errorMsg = null, successMsg = null) {
        response.render('project/settings.html.twig', {
            action: 'project.settings',
            projectLog: (projectLog === null) ? request.projectLogManager.create(request.project.getId()) : projectLog,
            error: errorMsg,
            success: successMsg
        });
    }

    /**
     * Project settings - page
     */
    application.getExpress().get('/project/:projectId/settings/', (request, response) => {
        if (!request.isUserAdminForThisProject) {
            return response.redirect('/');
        }

        request.projectLogManager.getByProjectId(request.project.getId(), (error, projectLog) => {
            if (error === null) {
                routeToSettingsPage(request, response, projectLog);
            } else {
                request.logger.error(error);

                routeToSettingsPage(request, response, null, 'Got error. Contact your system administrator');
            }
        });
    });

    /**
     * Project settings - handler
     */
    application.getExpress().post('/project/:projectId/settings/', (request, response) => {
        if (!request.isUserAdminForThisProject) {
            return response.redirect('/');
        }

        var logs = request.body.logs;

        if (typeof logs === 'undefined') {
            request.logger.error('Not enough data in the request');

            routeToSettingsPage(request, response, null, 'Not enough data in the request');
        }

        var projectLog = request.projectLogManager.create(request.project.getId());
        projectLog.setLogs(logs.trim());

        request.projectLogManager.update(projectLog, (error) => {
            if (error === null) {
                routeToSettingsPage(request, response, projectLog, null, 'Logs were updated');
            } else {
                request.logger.error(error);

                routeToSettingsPage(request, response, projectLog, 'Got error. Contact your system administrator');
            }
        });
    });

};
