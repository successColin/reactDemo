import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Styles from './MessageTemplate.less';
import { getMessageDetial } from '@/services/leftListFrame';

class MessageTemplate extends Component {
  constructor() {
    super();
    this.state = {
      data: {}, // 詳情
    };
  }

  // 获取详情
  getDetial = (params) => {
    getMessageDetial(params).then(res => {
      this.setState({
        data: res,
      });
    });
  };

  render() {
    const { data } = this.state;
    return (
      <div className={Styles.content}>
        <div className={Styles.contentBox}>
          <div className={Styles.title}>【<FormattedMessage id="news.message.title"/>】<FormattedMessage id="news.message.check"/> {data.messagesender || ''} <FormattedMessage id="news.message.submit"/> {data.messageSubject || ''} <FormattedMessage id="news.message.send"/> {''} <FormattedMessage id="news.message.to"/> {data.sendTime || ''}</div>
          <div className={Styles.substance}>
            <div>
              {/* <div>xxx,您好!</div> */}
              <div className={Styles.text} dangerouslySetInnerHTML={{ __html: data.messageContent || '' }}>

              </div>
              <div className={Styles.common}><FormattedMessage id="news.message.reduce"/> <span className={Styles.red}><FormattedMessage id="news.message.todo"/></span></div>
              <div className={Styles.box}>
                <div className={Styles.boxLeft}><FormattedMessage id="news.message.Process.title"/>：</div>
                <div className={Styles.boxRight}>{data.messageSubject || ''}</div>
              </div>
              <div className={Styles.box}>
                <div className={Styles.boxLeft}><FormattedMessage id="news.message.Process.sponsor"/>：</div>
                <div className={Styles.boxRight}>{data.messagesender || ''}</div>
              </div>
              <div className={Styles.box}>
                <div className={Styles.boxLeft}><FormattedMessage id="news.message.starttime"/>：</div>
                <div className={Styles.boxRight}>{data.sendTime || ''}</div>
              </div>
              <div className={Styles.box}>
                <div className={Styles.boxLeft}><FormattedMessage id="news.message.handler"/>：</div>
                <div className={Styles.boxRight}><FormattedMessage id="news.message.cooperate"/></div>
              </div>
              <div className={Styles.attention}>
                {/* 免责申明：本电子邮件及其附件可能包含华润三九医药股份有限公司的保密信息，*/}
                <FormattedMessage id="news.message.note"/>              </div>
            </div>
          </div>

        </div>
      </div>);
  }
}

export default MessageTemplate;
