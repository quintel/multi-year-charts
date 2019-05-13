import React, { Component } from 'react';

interface ExternalRedirectProps {
  to: string;
}

export default class ExternalRedirect extends Component<ExternalRedirectProps> {
  componentDidMount() {
    window.location.replace(this.props.to);
  }

  render() {
    return null;
  }
}
