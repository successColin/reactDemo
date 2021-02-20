import React, { Component } from 'react';
import { Popover } from 'antd';
import { connect } from 'dva';
import { FormattedMessage } from 'react-intl';
import { getLanguagesPage, switchLangauge } from '@/services/language';
import styles from './LanguageSelect.less';
import { getCookie } from '@/utils/common';
import { BaseContext, DB_LANG_TYPE_TO_FRONT } from '@/constants/global';

@connect(state => ({}))
class SelectLanguage extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [], // 列表
      visible: false,
    };
  }

  componentDidMount() {
    getLanguagesPage({ pageSize: 99999, pageNum: 1, keyWords: '' }).then(res => {
      this.setState({
        list: res.list || [],
      });
    });
  }

  // 渲染语种
  renderList = () => {
    const { list } = this.state;
    return list.map(item => {
      return <div className={styles.list} onClick={() => {
        this.chooseItem(item);
      }} key={item.id}>{item.name}</div>;
    });
  };
  // Popover 显示隐藏
  watchChange = (visible) => {
    this.setState({ visible });
  };
  // 选中多语言
  chooseItem = (item) => {
    const { keycode } = item;
    this.setState({ visible: false });
    switchLangauge({ keycode }).then(res => {
      const { dispatch } = this.context;
      const eam_info = getCookie('eaminfo');
      const userInfo = eam_info ? JSON.parse(decodeURIComponent(unescape(eam_info))) : {};
      const { currentLanguage, token } = userInfo;
      userInfo.currentLanguage = keycode;
      this.setCookie('eaminfo', encodeURIComponent(escape(JSON.stringify(userInfo))), 2);
      // localStorage.setItem('token', token);
      // 中英文
      dispatch({
        type: 'global/updateLang',
        payload: {
          lang: DB_LANG_TYPE_TO_FRONT[keycode] || 'zh',
        },
      });
      dispatch({
        type: 'user/updateState',
        payload: { userInfo },
      });
       window.location.reload();
    });
  };
  // 保存cookie
  setCookie = (cName, value, expiredays) => {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = cName + '=' + decodeURIComponent(value) +
      ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString());
  };

  // 显示选中的语言
  showLanguage = () => {
    const eam_info = getCookie('eaminfo');
    const userInfo = eam_info ? JSON.parse(decodeURIComponent(unescape(eam_info))) : {};
    const { currentLanguage, token } = userInfo;
    const { list } = this.state;
    let langaugeName = list.find(item => item.keycode === currentLanguage);
    return langaugeName ? langaugeName.name : '中文';
    return langaugeName ? langaugeName.name : <FormattedMessage id="locale.zh"/>;
  };

  render() {
    const { visible } = this.state;
    return (<Popover
      content={
        this.renderList()
      }
      placement="bottomRight"
      visible={visible}
      onVisibleChange={(value) => {
        this.watchChange(value);
      }}
    >
      <div>{this.showLanguage()}</div>
    </Popover>);
  }
}

export default SelectLanguage;
