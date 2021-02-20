/*
 * @Author: jwk
 * @Date:   2020-03-17 9:20:23
 * @Desc: 语种列表
 */
import React, { Component, Fragment } from 'react';
import { Input, Pagination } from 'antd';
import { connect } from 'dva';
import CModal from '@/components/common/CreateModal/CreateModal';
import { FormattedMessage } from 'react-intl';
import styles from './History.less';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { BaseContext } from '@/constants/global';
import { getVideoHistory } from '@/services/videoManager';
import { getSeconds } from '@/utils/common';

import { CTable } from '@/components/common/BasicWidgets';

const InputGroup = Input.Group;
const { Search } = Input;

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class Historty extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [],
      count: 0, // 列表数量
      visible: false,  // 新增弹框
      title: '', // 弹框名称
      pageSize: 10, // 默认分页10
      keyWords: '',
      pageNum: 1, // 默认第一页
      loading: false,
      selected: [], // 选中的行
      selectedRowKeys: [], // 勾选中的行
      selectedItems: [], // 勾选中的下拉框
      filterVisible: false, // 高级筛选
      searchValue: { keywords: '' },
    };
    this.player = null;
  }

  componentDidMount() {
    this.getList();
  }

  componentWillUnmount() {
    this.player = null;
  }

  // 获取数据
  getList = () => {
    const { pageSize, pageNum, searchValue, sortedInfo = {} } = this.state;
    this.setState({ loading: true });
    const { order } = sortedInfo;
    let orderBy = !order ? '' : order === 'ascend' ? 'conferenceId asc' : 'conferenceId desc';
    getVideoHistory({ pageSize, pageNum, ...searchValue, orderBy }).then((res = {}) => {
      this.setState({ loading: false, list: res.list || [], count: res.total });
    }, err => {
      this.setState({ loading: false });
    });
  };

  // 关联
  add = () => {
    const { selectedItems, selected } = this.state;
    if (!selectedItems.length || !selected.length) {
      const { langLib } = this.context;
      CMessage(langLib['message.error.msg'], 'error');
      return;
    }
    this.setState({
      visible: true,
      title: <FormattedMessage id="settingForm.relationLanguageTemplate"/>,
    });
  };

  // 单选
  onClickRow = (record, selectedRows) => {
    let { selected } = this.state;
    if (selectedRows) {
      if (selected.findIndex(item => item.elementid === record.elementid) !== -1) {
        selected.splice(selected.findIndex(item => item.elementid === record.elementid), 1);
      } else {
        selected.push(record);
      }
      this.setState({
        selected: [...selected],
      });
    }
  };
  // 全选或者反选
  onClickRowAll = (record, selectedRows, arr) => {
    let { selected } = this.state;
    if (record) {
      selectedRows.forEach(item => {
        let index = selected.findIndex(items => items.elementid === item.elementid);
        if (index === -1) {
          selected.push(item);
        }
      });
      this.setState({
        selected: [...selected],
      });
    } else {
      arr.forEach(item => {
        let index = selected.findIndex(items => items.elementid === item.elementid);
        if (index !== -1) {
          selected.splice(index, 1);
        }
      });
      this.setState({
        selected: [...selected],
      });
    }
  };
  // 进行筛选
  Change = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
      pageNum: 1, // 默认第一页
    }, () => {
      this.getList();
    });
  };
  // 点击行
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selected } = this.state;
        if (selected.find((item) => item.elementid === record.elementid)) {
          selected.splice(selected.findIndex((item) => item.elementid === record.elementid), 1);
        } else {
          selected.push(record);
        }
        this.setState({
          selected: [...selected],
        });
      },
    };
  };

  // 切页
  changePage = (page, pageSize) => {
    this.setState({
      pageNum: page,
      pageSize,
    }, () => {
      this.getList();
    });
  };
  // 关联模板时选择的字段
  handleChange = (selectedItems) => {
    this.setState({
      selectedItems,
    });
  };

  // 更新状态
  updateState = (obj, callback) => {
    this.setState({
      ...obj,
    }, () => {
      if (callback) {
        callback();
      }
    });
  };
  // 播放记录
  showDetial = (record) => {
    // const { fileId = 5285890812250459511 } = record;
    const { fileId, appId, glassesName, createTime } = record;
    const title = `${createTime || ''}${glassesName || ''}的视频记录`;
    this.setState({ title, visible: true }, () => {
      setTimeout(() => {
        this.player = window.TCPlayer('player-container-id', { // player-container-id 为播放器容器ID，必须与html中一致
          // fileID: '5285890812259221452', // 请传入需要播放的视频filID 必须
          // appID: '1304311177', // 请传入点播账号的appID 必须
          fileID: fileId, // 请传入需要播放的视频filID 必须
          appID: appId, // 请传入点播账号的appID 必须
          // 其他参数请在开发文档中查看
          controls: true,
          playbackRates: [0.5, 1, 1.25, 1.5, 2],
          controlBar: {
            QualitySwitcherMenuButton: true,
          },
          plugins: {
            ContinuePlay: {
              // auto: true // 是否在播放时自动续播
            },
            ProgressMarker: true,
            ContextMenu: {
              statistic: true,
              levelSwitch: {
                open: true, // 打开切换提示
                // switchingText: '开始', // 开始切换时文案
                // switchedText: '成功', // 切换成功时文案
                // switchErrorText: '失败', // 切换失败时文案
              },
            },
          },
        });
      }, 200);
    });
  };

  render() {
    const { list, visible, pageSize, count, pageNum, loading, selected, title, sortedInfo = {} } = this.state;
    const { langLib } = this.context;
    console.log(pageNum, 'render');
    const { form, functionData } = this.props;
    const { canmodify, candelete } = functionData.attributes;
    const columns = [
      {
        title: <FormattedMessage id="video.history.roomid"/>,
        dataIndex: 'roomId',
        width: 100,
      },
      {
        title: <FormattedMessage id="video.spectacle.equipment.keycode"/>,
        dataIndex: 'glassesCode',
        width: 150,
      },
      {
        title: <FormattedMessage id="video.spectacle.equipment"/>,
        dataIndex: 'glassesName',
        width: 150,
      },
      {
        title: <FormattedMessage id="video.history.add"/>,
        dataIndex: 'inviteUserName',
        width: 150,
      },
      {
        title: <FormattedMessage id="video.history.users"/>,
        dataIndex: 'userList',
        render: (text, record) => {
          const { conferenceUserNames } = record;
          return <span>{conferenceUserNames}</span>;
        },
      },
      {
        title: <FormattedMessage id="video.history.longtime"/>,
        dataIndex: 'duration',
        width: 100,
        render: (text, record) => {
          const { duration = 0 } = record;
          return <span>{getSeconds(duration)}</span>;
        },
      },
      {
        title: <FormattedMessage id="video.history.time"/>,
        dataIndex: 'createTime',
        width: 150,
        sorter: (a, b) => {
        },
        sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order,
        // ellipsis: true,
      },
      {
        title: <FormattedMessage id="global.operator"/>,
        dataIndex: 'placeholdertext',
        width: 150,
        render: (text, record) => {
          const { fileId, appId, glassesName, createTime } = record;
          const dom = fileId && appId ?
            <span className={styles.pointer} onClick={() => this.showDetial(record)}>查看回放</span> : null;
          return dom;
        },
      },
    ];

    const rowSelection = {
      type: 'checkbox',
      columnWidth: '50px',
      selectedRowKeys: selected.map(item => item.elementid),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRowAll(record, selected, selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
    };
    return <div className={`${styles.box} boxClass`}>
      <div className={`${styles.headerForm} headerFormClass`}>
        <InputGroup compact className={styles.highSearch}>
          <Search
            placeholder={langLib['form.placeholder.keywords']}
            onSearch={value => {
              this.setState({ pageNum: 1, searchValue: { keywords: value } }, () => {
                this.getList();
              });
            }}
            onChange={e => {
              let value = e.target.value;
              this.setState({ searchValue: { keywords: value } });
            }}
            style={{ width: 200 }}
          />
        </InputGroup>
      </div>
      <div style={{ 'height': 'calc(100% - 47px - 50px)' }}>
        <CTable
          className={styles.table}
          columns={columns}
          rowKey={record => record.roomId}
          dataSource={list}
          scroll={{ y: 'calc(100% - 42px)' }}
          pagination={false}
          onRow={this.clickRow}
          loading={loading}
          rowSelection={rowSelection}
          onChange={this.Change}
        />
      </div>
      <div className={`${styles.footer} footerClass`}>
        <Pagination
          pageSize={pageSize}
          current={pageNum}
          onChange={this.changePage}
          showSizeChanger
          // defaultCurrent={pageNum}
          // current={currentPage}
          total={count}
          pageSizeOptions={['10', '20', '50', '100', '200', '500', '1000']}
          showTotal={(total, range) => {
            return (
              <div><FormattedMessage id="global.total"/>{total}</div>
            );
          }}
          onShowSizeChange={this.changePage}
        />
      </div>
      <CModal
        title={title}
        visible={visible}
        destroyOnClose={true}
        footer={null}
        onCancel={() => {
          this.player && this.player.dispose();
          this.setState({ title: '', visible: false });
        }}
      >
        <video id="player-container-id" style={{ width: '100%', height: '100%' }}>
        </video>
      </CModal>
    </div>;
  }
}


export default Historty;
