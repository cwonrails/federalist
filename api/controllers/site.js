const authorizer = require('../authorizers/site');
const S3SiteRemover = require('../services/S3SiteRemover');
const SiteCreator = require('../services/SiteCreator');
const siteSerializer = require('../serializers/site');
const { User, Site, Build } = require('../models');

module.exports = {
  find: (req, res) => {
    User.findById(req.user.id, { include: [Site] })
      .then(user => siteSerializer.serialize(user.Sites))
      .then((sitesJSON) => {
        res.json(sitesJSON);
      }).catch((err) => {
        res.error(err);
      });
  },

  findOne: (req, res) => {
    let site;

    Promise.resolve(Number(req.params.id)).then((id) => {
      if (isNaN(id)) {
        throw 404;
      }
      return Site.findById(id);
    }).then((model) => {
      if (model) {
        site = model;
      } else {
        throw 404;
      }
      return authorizer.findOne(req.user, site);
    })
      .then(() => siteSerializer.serialize(site))
      .then((siteJSON) => {
        res.json(siteJSON);
      })
      .catch((err) => {
        res.error(err);
      });
  },

  destroy: (req, res) => {
    let site;
    let siteJSON;

    Promise.resolve(Number(req.params.id))
      .then((id) => {
        if (isNaN(id)) {
          throw 404;
        }
        return Site.findById(id);
      })
      .then((model) => {
        if (model) {
          site = model;
        } else {
          throw 404;
        }
        return siteSerializer.serialize(site);
      })
      .then((json) => {
        siteJSON = json;
        return authorizer.destroy(req.user, site);
      })
      .then(() => S3SiteRemover.removeSite(site))
      .then(() => site.destroy())
      .then(() => {
        res.json(siteJSON);
      })
      .catch((err) => {
        res.error(err);
      });
  },

  create: (req, res) => {
    authorizer.create(req.user, req.body)
      .then(() => SiteCreator.createSite({
        user: req.user,
        siteParams: req.body,
      }))
      .then(site => siteSerializer.serialize(site))
      .then((siteJSON) => {
        res.send(siteJSON);
      })
      .catch((err) => {
        res.error(err);
      });
  },

  update: (req, res) => {
    let site;
    const siteId = Number(req.params.id);

    Promise.resolve(siteId).then((id) => {
      if (isNaN(id)) {
        throw 404;
      }
      return Site.findById(id);
    }).then((model) => {
      site = model;
      if (!site) {
        throw 404;
      }
      return authorizer.update(req.user, site);
    })
      .then(() => {
        const params = Object.assign(site, req.body);
        return site.update({
          demoBranch: params.demoBranch,
          demoDomain: params.demoDomain,
          config: params.config,
          previewConfig: params.previewConfig,
          demoConfig: params.demoConfig,
          defaultBranch: params.defaultBranch,
          domain: params.domain,
          engine: params.engine,
        });
      })
      .then(model => Build.create({
        user: req.user.id,
        site: siteId,
        branch: model.defaultBranch,
      }))
      .then(() => {
        if (site.demoBranch) {
          return Build.create({
            user: req.user.id,
            site: siteId,
            branch: site.demoBranch,
          });
        }
        return null;
      })
      .then(() => siteSerializer.serialize(site))
      .then((siteJSON) => {
        res.send(siteJSON);
      })
      .catch((err) => {
        res.error(err);
      });
  },
};
