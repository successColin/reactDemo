/*
 * @Author: Fus
 * @Date:   2019-04-24 14:16:58
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-12-31 17:25:29
 * @Desc: 侧边栏
 */
import React, { Fragment } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import AutoResponsive from 'autoresponsive-react';
import { Layout, Menu, Icon, Tooltip, Anchor, message } from 'antd';
import { BaseContext } from '../../constants/global';
import CreateDrawer from '@/components/common/CreateDrawer/CreateDrawer';
import TranditionalMenu from './TranditionalMenu';
import ConcizeMenu from './ConcizeMenu';
import { CInput, CSpin } from '@/components/common/BasicWidgets';
import { updateCollectFunction, doSearchFunction } from '@/services/function';
import { getFunctionComDetail } from '@/utils/common';
import styles from './Sidebar.less';
import avatar from '@/assets/avatar.png';

const { Sider } = Layout;
const { Link } = Anchor;
const { SubMenu } = Menu;

// 显示菜单中心计时器
let timerShowMenuCenter = null;

@connect(state => ({
  global: state.global,
  user: state.user,
  mainPageConfig: state.global.mainPageConfig,
}))
class Sidebar extends React.Component {
  static contextType = BaseContext;
  state = {
    menuEntryEle: [], // 传统菜单dom结构
    selectedKeys: [], // 当前选中的菜单key
    currentAnchorLink: '',
    isHoverSider: false,
    keywords: '',
  };

  componentDidMount() {
    this.fetchFunctionList();
    const { global } = this.props;
    const { showMenuCenter } = global;
    this.setState({
      isHoverSider: showMenuCenter
    })
  }

  // 获取菜单数据
  fetchFunctionList = (keywords) => {
    this.setState({ loadingMenu: true });
    this.context.dispatch({
      type: 'user/getFunctionList',
      callback: resData => {
        const menuEntryEle = this.getMenuEntry(resData);
        this.setState({ menuEntryEle, loadingMenu: false, keywords: keywords ? keywords.keywords : null });
      },
    });
  };
  // 模糊查询
  getFunctionListBySearch = (keywords) => {
    this.setState({ loadingMenu: true });
    this.context.dispatch({
      type: 'user/getFunctionListBySearch',
      payload: keywords,
      callback: resData => {
        this.setState({ loadingMenu: false, keywords: keywords ? keywords.keywords : null });
      },
    });
  };
  // 传统菜单列表
  getMenuEntry = (data) => {
    return data.map(item => {
      const { children, id, name, iconName, frameBaseType, rootpath } = item;
      const level = rootpath.match(/\//ig).length;
      const isRoot = level === 2;
      const functionIconName = (!iconName || iconName.indexOf('_function') === -1) ? 'basic_function' : iconName;
      const iconCls = classNames({
        [styles.icon]: true,
        'iconfont': true,
        [`icon-${functionIconName}`]: true,
      });
      const titWrap = classNames({
        [styles.menuWrap]: true,
        [styles.rootLevel]: isRoot,
        'custom-tranditionalMenu': true,
      });
      if (item.children.length) {
        const arrowCls = classNames({
          'iconfont': true,
          'icon-arrow-open': true,
          'custon-menuArrow-icon': true,
          [styles.arrow]: true,
        });
        return (
          <SubMenu
            key={`menu_${item.id}`}
            title={
              <span className={titWrap} onClick={() => this.handleClickMenu(item)}>
                <i className={iconCls}/>
                <span>{item.name}</span>
                {isRoot && <span className={styles.menuIcon}>
                  <span className={arrowCls}/>
                </span>}
              </span>
            }
          >
            {this.getMenuEntry(item.children)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item
          key={`menu_${item.id}`}
          onClick={(e) => this.handleClickMenu(item)}
        >
          <span className={titWrap}>
            {isRoot && <i className={iconCls}/>}
            {item.name}
          </span>
        </Menu.Item>
      );
    });
  };
  // 点击收藏
  handleMark = (item) => {
    const { langLib } = this.context;
    const markedFunctionList = this.getMarkedMenu();
    const { id, collect } = item;
    const params = {
      functionId: id,
      collect: !collect || collect === 2 ? 1 : 2,
    };
    if(markedFunctionList.length >=10 && collect !== 1){
      message.warning(langLib['message.menu.collect']); // '暂未配置该图层'
      return
    }
    updateCollectFunction(params).then(res => {
      this.fetchFunctionList();
    });
  };
  // 生成收藏的菜单列表
  getMarkedMenu = () => {
    const collectedFunctionList = [];
    const {isHoverSider}=this.state
    const loopGetMenu = data => {
      data.forEach((item, index) => {
        if (item.collect === 1) {
          const functionIconName = (!item.iconName || item.iconName.indexOf('_function') === -1) ? `mark-menu-${index%10+1}` : item.iconName;
          const iconCls = classNames({
            'iconfont': true,
            'normal-menu-color': true,
            [`icon-${functionIconName}`]: true,
          });
          collectedFunctionList.push(
            <li key={`collect_${item.id}`}>
              <Tooltip placement="right">
                <span className={iconCls}/>
              </Tooltip>
              {isHoverSider && <span onClick={() => this.handleClickMenu(item)} className={`${styles.collectFunctionName} normal-menu-color`}>{item.name}</span>}
            </li>,
          );
        }
        item.children.length && loopGetMenu(item.children);
      }); 
    };
    const { functionList } = this.props.user;
    loopGetMenu(functionList);
    return collectedFunctionList;
  };
  // 折叠、展开菜单中心
  handleSwitchMenuCenter = (isShow, type) => {
    const { basicData = {} } = this.props.mainPageConfig;
    const { menuStyle } = basicData;
    const menuType = menuStyle === 1 ? 'showSidebar' : 'showMenuCenter';
    this.context.dispatch({
      type: 'global/updateState',
      payload: { [menuType]: isShow },
    });
    if (type&&type!=2) {
      this.restFunctionList();
    }
    if(type!=2){
      setTimeout(()=>{
        this.showHoverSider(false, isShow)
      },200)
    }
    this.setState({keywords: null})
  };
  // 重置菜单
  restFunctionList = () => {
    const { user } = this.props;
    const { functionList } = user;
    this.context.dispatch({
      type: 'user/updateState',
      payload: { searchFunctionList: functionList },
    });
  };
  // 折叠、展开主菜单
  handleSwitchSidebar = (isShow) => {
    this.context.dispatch({
      type: 'global/updateState',
      payload: { showSidebar: isShow },
    });
  };
  // 点击菜单
  handleClickMenu = (item, type) => {
    const { id } = item;
    this.setState({ selectedKeys: [`menu_${id}`] });
    const { tabKey, comKey, title } = getFunctionComDetail(item);
    if (!tabKey) return;
    this.context.dispatch({
      type: 'tabs/addTab',
      payload: {
        tabKey,
        comKey,
        title,
        functionData: item,
      },
    });
    if (type) { // 关闭的时候数据重置
      this.restFunctionList();
    }
    this.handleSwitchSidebar(false);
    this.handleSwitchMenuCenter(false);
  };

  getAutoResponsiveProps() {
    return {
      itemMargin: 10,
      containerWidth: 660,
      itemClassName: 'item',
      transitionDuration: '.8',
      transitionTimingFunction: 'easeIn',
    };
  }

  // 遍历生成子菜单
  mapToSetSubMenu = (data = []) => {
    const {currentAnchorLink} = this.state
    return data.map(liItem => {
      const { collect, rootpath, children } = liItem;
      const isMarked = collect && collect === 1;
      const iconCls = classNames({
        [styles.iconMark]: true,
        [styles.showMark]: isMarked,
        'iconfont': true,
        'icon-unMark': !isMarked,
        'icon-marked': isMarked,
      });
      const level = rootpath.match(/\//ig).length - 2;
      const liCls = classNames({
        [styles.liMenu]: true,
        [styles[`subMenuLi-level-${level}`]]: level > 0,
        [styles.currentAnchorLink]: currentAnchorLink == liItem.id,
      });
      return (
        <li key={liItem.id} title={liItem.name} className={liCls}>
          <div className={`${styles.titBox} titBox`}>
            <span
              className={styles.name}
              onClick={() => this.handleClickMenu(liItem, 1)}
            >
              {liItem.name}
            </span>
            <span
              className={iconCls}
              onClick={() => this.handleMark(liItem)}
            />
          </div>
          {children && this.mapToSetSubMenu(children)}
        </li>
      );
    });
  };
  // 获取菜单下所有子菜单数量
  getMainMenuChildrenLength = (mainMenu) => {
    let length = 0;
    const loopGetLength = data => {
      data.forEach(item => {
        length += 1;
        const { children } = item;
        children && children.length && loopGetLength(children);
      });
    };
    loopGetLength(mainMenu);
    return length;
  };
  // 渲染菜单中心列表
  renderFunctionList = () => {
    const { user } = this.props;
    const {currentAnchorLink} = this.state
    const { searchFunctionList } = user;
    return searchFunctionList.map(item => {
      const { id, children, name } = item;
      const allChildLength = this.getMainMenuChildrenLength(children);
      const height = allChildLength * 34 + 43 + 20;
      const { collect } = item;
      const isMarked = collect && collect === 1;
      const iconCls = classNames({
        [styles.iconMark]: true,
        [styles.showMark]: isMarked,
        'iconfont': true,
        'icon-unMark': !isMarked,
        'icon-marked': isMarked,
      });
      const liCls = classNames({
        [styles.tit]: true,
        [styles.liMenu]: true,
        [styles.currentAnchorLink]: currentAnchorLink == id,
        'currentAnchorLink': currentAnchorLink == id
      });
      const ulCls = classNames({
        ['item']: true,
      });
      return (
        <ul className={ulCls} id={`menu-${id}`} key={`tit_${item.id}`} style={{ width: 210, height, }}>
          <li className={liCls} title={name} onClick={() => this.handleClickMenu(item, 1)}>
            <div className={styles.titBox}>
              <span
                className={styles.name}
                onClick={() => this.handleClickMenu(item, 1)}
              >
                {item.name}
              </span>
              {/* <span
                className={iconCls}
                onClick={() => this.handleMark(item)}
              /> */}
            </div>
          </li>
          {this.mapToSetSubMenu(children)}
        </ul>
      );
    });
  };
  // 模糊查找
  doSearch = (e) => {
    const value = e.target.value;
    if (value) {
      this.getFunctionListBySearch({ keywords: value });
    } else {
      this.fetchFunctionList({ keywords: value });
    }
  };
  // 锚点跳转菜单样式
  showCurrentAnchor = (e, link) =>{
    this.setState({
      currentAnchorLink: link.href.split('-')[1]
    })
  }

  showHoverSider = (type, isShow = true) =>{
    const { global } = this.props;
    const { showMenuCenter } = global;
    if(showMenuCenter) return
    this.setState({
      isHoverSider: type
    })
  }
  getSearchFunctionListLength = (searchFunctionList)=>{
    let length = 0
    searchFunctionList.forEach(item=>{
      const len = this.getMainMenuChildrenLength(item.children)
      length += len
    })
    return length
  }
  handleClickMenuCenter = ()=>{
    const { global } = this.props;
    const { showMenuCenter } = global;
    this.handleSwitchMenuCenter(showMenuCenter?false:true,2)
  }
  render() {
    const { global, user, mainPageConfig } = this.props;
    const { menuEntryEle, selectedKeys, loadingMenu, isHoverSider, keywords } = this.state;
    const { showMenuCenter, showSidebar } = global;
    const { functionList, searchFunctionList } = user;
    const { basicData } = mainPageConfig;
    const { langLib } = this.context;
    const sidebarCls = classNames({
      [styles.sideWrap]: true,
      [styles.hide]: true,
      [styles.hoverSider]: isHoverSider,
      [styles.siderOpen]: showMenuCenter,
      'custom-sidebar-menu-hide': true,
    });
    const ancchorCls = classNames({
      [styles.anchor]: true,
      'custom-menu-anchor': true,
    });
    // 右侧一级菜单
    const renderMainMenu = functionList.map(item => (
      <Link key={`mainMenu-${item.id}`} href={`#/#menu-${item.id}`} title={item.name}/>
    ));
    const { menuStyle } = basicData;
    // 简约菜单
    if (menuStyle === 3) {
      return <ConcizeMenu functionList={functionList} handleClickMenu={this.handleClickMenu}/>;
    }
    const minorCls = classNames({
      [styles.turning]: showMenuCenter,
      [styles.menuMinor]: true,
      'iconfont icon-menu-minor': true,
    });
    const avatarCls = classNames({
      [styles.avatarOpen]: isHoverSider,
      [styles.avatar]: true,
      'custom-avatar center-menu-avatar': true,
      'waveClick': false
    });
    return (
      <Fragment>
        <Sider
          className={sidebarCls}
          collasped={true}
          trigger={null}
          onMouseEnter={() => this.showHoverSider(true, false)}
          onMouseLeave={() => this.showHoverSider(false, true)}
        >
          <div className={styles.avatarWrap} 
            onClick={()=>{this.handleClickMenuCenter()}} 
            // onMouseEnter={() => this.handleSwitchMenuCenter(true)  }
            // onMouseLeave={() => this.showHoverSider(false, true)}
            >
            <button className={avatarCls}>
              <span className="iconfont icon-menu-main"/>
              <span className={minorCls}/>
              {isHoverSider && <span className={styles.menuCenterName}>菜单中心</span>}
            </button>
          </div>
          <div className={`${styles.markedList} markedList`}>
            {this.getMarkedMenu()}
          </div>
        </Sider>
        {menuStyle === 1 && (
          <TranditionalMenu
            showSidebar={showSidebar}
            selectedK eys={selectedKeys}
            menuEntryEle={menuEntryEle}
            handleSwitchSidebar={this.handleSwitchSidebar}
          />
        )}
        <CreateDrawer
          visible={showMenuCenter}
          maskTransparent={false}
          className={styles.drawer}
          onClose={() => this.handleSwitchMenuCenter(false, 1)}
          placement="left"
          width={962}
          fromType="menuCenter"
          mask={true}
          closable={false}
        >
          <CSpin spinning={loadingMenu}>
            <span onClick={() => this.handleSwitchMenuCenter(false, 1)} className={`iconfont icon-close ${styles.closeMenuCenter}`}></span>
            <div className={styles.searchWrap}>
              <CInput onPressEnter={this.doSearch}
                      placeholder={langLib['form.placeholder.keywords']}
                      onChange={e => !e.target.value && this.doSearch(e)}
                      className={styles.inputWrap}
                      addonBefore={<span className="iconfont icon-search"></span>}
              />
            </div>
            <Anchor className={ancchorCls} onClick={(e, link) => this.showCurrentAnchor(e, link)} getContainer={() => document.getElementById('main-menu-container')}>
              {renderMainMenu}
            </Anchor>
            <div className={styles.main} id="main-menu-container">
              {!!keywords && <p className={styles.searchFunctionTip}>共找到<span>{this.getSearchFunctionListLength(searchFunctionList)}</span>个<span>{keywords}</span>相关结果</p>}
              {/* <CInput
                className={styles.search}
                prefix={<span className="iconfont icon-search" />}
                placeholder={langLib['form.placeholder.keywords']}
              /> */}
              <div className={styles.productList}>
                {/* <ul className={styles.nearly}>
                  <li className={styles.tit}>最近访问</li>
                  <li>流程档案<span className="iconfont icon-unMark" /></li>
                  <li>流程档案<span className="iconfont icon-unMark" /></li>
                  <li>流程档案<span className="iconfont icon-unMark" /></li>
                  <li>流程档案<span className="iconfont icon-unMark" /></li>
                  <li>流程档案<span className="iconfont icon-unMark" /></li>
                </ul> */}
                <div className={styles.blockWrap}>
                  <AutoResponsive ref="container" {...this.getAutoResponsiveProps()}>
                    {this.renderFunctionList()}
                  </AutoResponsive>
                </div>
              </div>
            </div>
          </CSpin>
        </CreateDrawer>
      </Fragment>
    );
  }
};

export default Sidebar;
