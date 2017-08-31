import React from 'react';
import moment from 'moment';

const propTypes = {
  site: React.PropTypes.shape({
    publishedAt: React.PropTypes.string,
  }),
};

const getPublishedState = (site) => {
  if (site.publishedAt) {
    const formattedBuildTime = moment(site.publishedAt).format('MMMM Do YYYY, h:mm:ss a');
    return `This site was last published at ${formattedBuildTime}.`;
  }
  return 'Please wait for build to complete or check logs for error message.';
};

const PublishedState = ({ site = {} }) =>
  (<p>
    {getPublishedState(site)}
  </p>);

PublishedState.propTypes = propTypes;

export default PublishedState;
