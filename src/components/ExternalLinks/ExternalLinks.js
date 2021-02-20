import React, { Component } from 'react';

class ExternalLinks extends Component {
  render() {
    const { url } = this.props;
    return (
      <iframe src={url} frameBorder={0} style={{ 'width': '100%', 'height': 'calc(100% - 5px)' }}></iframe>
    );
  }
}

export default ExternalLinks;
