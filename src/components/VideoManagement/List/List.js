import React, { Component } from 'react';
import { Row, Col, Empty } from 'antd';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { CButton } from '@/components/common/BasicWidgets';
import { CSpin } from '@/components/common/BasicWidgets';
import { getVideoList, getUserInfo } from '@/services/videoManager';
import Styles from './List.less';

import OnLine from '@/assets/online.png';
import OutLine from '@/assets/outline.png';

@connect(state => ({
  userInfo: state.user.userInfo,
}))
class List extends Component {
  static contextType = BaseContext;

  constructor() {
    super();
    this.state = {
      videoVisible: false, // 会议弹框
      title: '', // 弹框标题
      spinning: false,
      list: [], // 会议数据
    };
  }

  componentDidMount() {
    console.log('did-----list');
    this.fetchVideoList();
  }

  // 获取列表
  fetchVideoList = () => {
    this.setState({ spinning: true });
    getVideoList({}).then((res = []) => {
        this.setState({ spinning: false, list: res });
      }, err => this.setState({ spinning: false }),
    );
  };

  handleMeeting = (item = {}) => {
    const { userInfo } = this.props;
    const { roomId = '65003', title = '标题' } = item;
    const { account, id, username: name, picpath } = userInfo;
    const { dispatch } = this.context;
    let user = {
      userID: account, // 用户id
      hasCamera: true, // 是否开启摄像头，默认true
      hasMicrophone: true, // 是否开启麦克风，默认true
      hasSpeaker: true, // 是否开启扬声器，默认true
      inviteType: 1, // 邀请人是否是被邀请，1：邀请人 2：被邀请
      userName: name, // 用户名称
      useravatar: picpath, // 用户头像
    };
    const params = {
      vedioVisible: true,
      vedioUserList: [user],
    };
    dispatch({
      type: 'global/updateState',
      payload: { ...params },
    });
  };
  // 会议列表中的人员列表
  renderUserList = (userList = []) => {
    return userList.map((item, index) => {
      return <img key={`index_${item.profileUrl}`} className={Styles.going} src={item.profileUrl || OnLine} alt=""/>;
    });
  };

  // 根据状态获取属性文本内容
  getInnerProps = (stateCode) => {
    if (stateCode === 'ONLINE') {
      return {
        text: '发起会议',
        type: 'danger',
        ghost: true,
        url: OnLine,
        color: 'green',
      };
    } else if (stateCode === 'BUSYING') {
      return {
        text: '参加会议',
        type: 'primary',
        url: OnLine,
        color: 'yellow',
      };
    } else if (stateCode === 'OFFLINE') {
      return {
        text: '视频会议',
        type: 'primary',
        disabled: true,
        url: OutLine,
        color: 'red',
      };
    }
  };

  // 会议列表
  renderList = () => {
    const { list } = this.state;
    return list.map(item => {
      const { stateCode } = item;
      const dom = item.conferenceInfo && item.conferenceInfo.userList ? this.renderUserList(item.conferenceInfo.userList || []) : '';
      const { text, url, color, ...rest } = this.getInnerProps(stateCode);
      return (
        <Col span={8} key={item.glassCode}>
          <div className={Styles.ColWrap}>
            <Row className={Styles.detial} gutter={24}>
              <Col span={7} className={Styles.avatar}><img src={url} alt=""/></Col>
              <Col span={11} className={Styles.titContent}>
                <div>{item.glassName || ''}</div>
                <div>{item.glassCode || ''}</div>
                <div><span>{item.onLineUser && item.onLineUser.name || ''}</span> <span
                  className={Styles.whitepace}>{item.onLineUser && item.onLineUser.account || ''}</span></div>
              </Col>
              <Col span={6} className={Styles.detialState}>
                <div><span className={Styles.stateColor} style={{ background: color }}></span> {item.stateName || ''}
                </div>
              </Col>
            </Row>
            <Row className={Styles.fork} gutter={24}>
              <Col span={16} className={Styles.forkLeft}>
                {dom}
                {item.conferenceInfo && item.conferenceInfo.userList ?
                  <span
                    className={Styles.num}>{item.conferenceInfo && item.conferenceInfo.userList.length ? `${item.conferenceInfo.userList.length}人正在会议` : ''}</span> : ''}
              </Col>
              <Col span={8} className={Styles.forkRight}>
                <CButton
                  {...rest}
                  onClick={() => this.handleMeeting()}
                >
                  <span className="iconfont icon-vedio-tell"></span>
                  {text}
                </CButton>
              </Col>
            </Row>
          </div>
        </Col>
      );
    });
  };

  render() {
    const { options: videoConfig, spinning, list } = this.state;
    const dom = list.length ? this.renderList() : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>;
    return <div className={Styles.listWrap}>
      <CSpin spinning={spinning}>
        <Row className={Styles.card} gutter={12}>
          {dom}
        </Row>
      </CSpin>
    </div>;
  }
}

export default List;
