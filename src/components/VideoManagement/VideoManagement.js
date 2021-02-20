import React, { Component } from 'react';
import { Card } from 'antd';
import { FormattedMessage } from 'react-intl';

import List from './List/List';
import Historty from '@/components/VideoManagement/History/History';


import Styles from './VideoManagement.less';

const tabList = [
  {
    key: 'list',
    tab: <FormattedMessage id="video.spectacle.equipment"/>,
  },
  {
    key: 'history',
    tab: <FormattedMessage id="video.conference.history"/>,
  },
];

class VideoManagement extends Component {
  constructor() {
    super();
    this.state = {
      activeKey: 'list',
    };
  }

  // 切换选项卡
  changeTabKey = (activeKey) => {
    console.log(typeof activeKey, activeKey);
    this.setState({ activeKey });
  };
  // 获取组件内容
  getContent = (key) => {
    if (key === 'list') {
      return <List/>;
    }
    if (key === 'history') {
      return <Historty/>;
    }
  };

  render() {
    const { activeKey } = this.state;
    const content = this.getContent(activeKey);
    return (<div id="videoContent" className={`videoContentWrap ${Styles.videoContentWrap}`}>
      <Card
        className="videoCard"
        tabList={tabList}
        activeTabKey={activeKey}
        onTabChange={key => {
          this.changeTabKey(key, 'key');
        }}
      >
        {content}
      </Card>
    </div>);
  }
}

export default VideoManagement;
