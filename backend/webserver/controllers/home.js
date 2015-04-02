'use strict';

var marked = require('marked'),
    fs = require('fs'),
    path = require('path');

/**
 *
 * @param {object} dependencies
 * @return {{meetings: meetings, liveconference: liveconference}}
 */
module.exports = function(dependencies) {

  var logger = dependencies('logger'),
      errors = require('../errors')(dependencies);

  function meetings(req, res) {
    if (req.conference) {
      return res.redirect('/' + req.conference._id);
    }

    var tosFile = path.normalize(path.join(__dirname, '../../i18n/tos/' + req.getLocale() + '.md'));

    fs.readFile(tosFile, {encoding: 'utf-8'}, function(err, contents) {
      if (err) {
        logger.error('Could not read terms of service from the filesystem using file %s.', tosFile, err);
      }

      res.render('meetings/index', {
        termsOfService: contents ? marked(contents) : ''
      });
    });
  }

  function liveconference(req, res) {
    return res.render('live-conference/index', {id: req.params.id});
  }

  function embedButton(req, res) {
    var widgetJs = path.normalize(path.join(__dirname, '../../../frontend/views/meetings/widget.js'));

    fs.readFile(widgetJs, {encoding: 'utf-8'}, function(err, contents) {
      if (err) {
        throw new errors.ServerError('Cannot read widget.js file. ', err);
      }

      res.set('Content-Type', 'application/javascript');
      res.send(contents.replace(/__\((.*)\)/g, function(match, group) {
        return req.__({
          locale: req.query.locale || req.getLocale(),
          phrase: group
        });
      }));
    });
  }

  return {
    meetings: meetings,
    liveconference: liveconference,
    embedButton: embedButton
  };
};
