import { Component } from 'react';
import { Row, Col, List, Icon } from 'antd';
import { connect } from 'dva';
import { FormattedMessage } from 'react-intl';
import { CInputNumber } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import { CSearch, CSpin, CMessage } from '@/components/common/BasicWidgets';
import TreeFooter from '@/components/common/TreeFooter/TreeFooter';
import { BTN_ELEMENT_TYPE } from '@/constants/element';
import styles from './LeftList.less';


@connect(state => ({
  activeTabData: state.tabs.activeTabData,
}))
class LeftList extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      hasMore: true,
    };
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.leftList,
    });
  }

  // 上一页下一页
  changePage = (type) => {
    const { pageSize = 10, total = 0, setFrameState, leftList = [], pageNum } = this.props;
    if (type === '+') {
      this.onLoadMore();
    }
    if (type === '-') {
      setFrameState({
        pageNum: pageNum - 2,
      }, () => {
        this.onLoadMore();
      });
    }
  };

  // 输入框中的分页
  changePageSize = (value) => {
    const { pageSize = 10, total = 0, setFrameState, pageNum } = this.props;
    const totalPage = Math.ceil(total / pageSize);
    console.log(value, totalPage);
    if (value < 0 || value > totalPage) return;
    setFrameState({
      pageNum: value - 1,
    });
  };

  // 失去焦点的时候获取数据
  onLoadMore = () => {
    const { pageSize = 10, total = 0, setFrameState, leftList = [], pageNum } = this.props;
    const totalPage = Math.ceil(total / pageSize);
    const currentPage = Math.ceil(leftList.length / pageSize);
    // if (pageNum === currentPage) return;
    if (pageNum < 0 || pageNum > totalPage) return;
    this.props.getLeftList();
  };
  // 渲染列中的数据
  renderRow = (item, currentEle, data, color, priorityColor, iconName) => {
    return currentEle.map((items, index) => {
      let value = items.relationColumnName ? JSON.parse(data[items.id]) : {};
      const { basetype } = items;
      let typeColor = basetype === 20 ? color : (basetype === 21 ? priorityColor : '');
      let displayName = items.canDisplayName ? items.displayName + ':' : null;
      let icon = index === 0 && !iconName ?
        <span
          className={`iconfont icon-list-first ${styles.firstIcon}`}></span> : null;
      return (items.visiabled ?
        < Col key={index} title={value.name}
              span={items.columnSpan}>{icon}{displayName} {!!typeColor &&
        <span style={{ background: typeColor }} className={styles.stateName}></span>} {value.name || ''}</Col> : null);
    });
  };

  // 选中背景色
  setBackGround = (item, index) => {
    const { data } = this.state;
    this.props.updateSelectList(data[index]);
  };

  // 渲染整个列
  renderList = (item, current) => {
    const { elementMap, listTab, leftStatusList, activeTreeNode } = this.props;
    const { langLib } = this.context;
    let currentEle = elementMap[listTab[0].id].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype));
    let data = {};
    let idEle = currentEle.find(item => item.relationColumnName === 'id');
    if (!idEle) {
      console.log(langLib['message.error.left.noId']);
      return;
    }
    ;
    currentEle.forEach(items => {
      if (items.visiabled) {
        for (let key in item) {
          if (Number(key).toString() !== 'NaN') {
            // data[obj.relationColumnName] = item[key];
            data[key] = item[key];
          } else {
            let control = currentEle.find((item) => item.relationColumnName === key);
            if (control) {
              data[control.id] = item[key];
            }
          }
        }
      }
    });
    let typeEle = currentEle.find(item => item.basetype === 22);
    let iconName = '';
    if (typeEle) {
      iconName = (data[typeEle.id] && JSON.parse(data[typeEle.id]).iconname);
    }
    let stateEle = currentEle.find(item => item.basetype === 20);
    let priorityEle = currentEle.find(item => item.basetype === 21);
    let stateColor = (stateEle && data[stateEle.id] && JSON.parse(data[stateEle.id]).color) || '';
    let priorityColor = (priorityEle && data[priorityEle.id] && JSON.parse(data[priorityEle.id]).color) || '';
    let activeId = activeTreeNode && JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]).id : '';

    let listId = idEle && JSON.parse(item[idEle.id]).id;
    return (<Row className={listId === activeId ? 'active' : ''}
                 key={item.listId}
                 onClick={() => this.setBackGround(item, current)}
    >
      <Col span={iconName ? 5 : 0}>
        <span style={{ 'color': stateColor || priorityColor }}
              className={`iconfont ${iconName.indexOf('bundle') > -1 ? 'iconfont-app icon-' + iconName : 'icon-' + iconName}`}></span>
      </Col>
      <Col span={iconName ? 19 : 24} className={styles.leftList}>
        {this.renderRow(item, currentEle, data, stateColor, priorityColor, iconName)}
      </Col>
    </Row>);
  };
  // 点击新增
  addNew = () => {
    this.props.add();
  };


  render() {
    const { langLib } = this.context;
    const {
      loading, treeData, activeTreeNode = {}, showCreate, element, pageNum,
      pageSize = 10, total = 0, activeTabData,
    } = this.props;
    const { attributes } = activeTabData.functionData;

    const { data = [] } = this.state;
    const totalPage = Math.ceil(total / pageSize);
    const currentPage = Math.ceil(data.length / pageSize);
    const loadMore =
      (
        <div className={styles.inputWrap}>
          <button onClick={() => this.changePage('-')} className={styles.buttonRest}
                  disabled={currentPage === 1 || currentPage === 0}>
            <span className="iconfont icon-left"></span>
          </button>
          <span>{total}</span>
          <FormattedMessage
            id="global.lines"/>

          &nbsp;
          <CInputNumber min={0} max={totalPage} className={styles.inputChange} value={currentPage}
                        onBlur={this.onLoadMore} onChange={this.changePageSize}/> &nbsp;/{totalPage}
          <button onClick={() => this.changePage('+')} className={styles.buttonRest}
                  disabled={currentPage === totalPage}>
            <span className="iconfont icon-right"></span>
          </button>
        </div>
      );
    return (
      <div className={styles.wrap}>
        <div className={styles.searchWrap}>
          <CSearch
            className={styles.search}
            placeholder={langLib['form.placeholder.keywords']}
            onSearch={() => this.props.setFrameState({ pageNum: 0 }, () => this.props.getLeftList())}
            onChange={(e) => this.props.setFrameState({ keyword: e.target.value })}
          />
          {showCreate && !!attributes.canadd ? <Row className={styles.addNew}>
            <div className={styles.addNewBtn} onClick={() => this.addNew()}>
              <Icon className={`${styles.addnewBtnIco} custom-color`} type="plus-square"/>
              <span>{element[0].displayName}</span>
            </div>
          </Row> : null}
        </div>
        <div className={showCreate && !!attributes.canadd ? styles.left : styles.leftNomal}>
          <CSpin spinning={loading}>
            <List
              split={false}
              itemLayout="horizontal"
              // loadMore={loadMore}
              dataSource={data}
              renderItem={(item, index) => (
                <List.Item key={item.keycode}>
                  {this.renderList(item, index)}
                </List.Item>
              )}
            />
          </CSpin>
        </div>
        {loadMore}
        <TreeFooter/>
      </div>
    );
  }
}

export default LeftList;
