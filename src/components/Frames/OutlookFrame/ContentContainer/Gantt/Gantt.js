import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { gantt } from 'dhtmlx-gantt';
import { CMessage, CButton, CSpin } from '@/components/common/BasicWidgets';
import moment from 'moment';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import styles from './Gantt.less';
import { updateChangeTime } from '@/services/frame';
import { formatTime } from '@/utils/common';
import { Modal, DatePicker, Space } from 'antd';

const { RangePicker } = DatePicker;

class OutlookGantt extends Component {
  state = {
    configColor: [],
    startDay: '', // 弹出开始时间
    endDay: '', // 弹出结束时间
    taskId: '', // 弹出id
    title: '', // 弹出来的名称
    visiblePageConfig: false,
    ganttLeftWidth: 360,
    ganttCheckout: 50,
    scrollToHeight: 0, // 滚动的高度
    scrollToWidth: 0, // 滚动的宽度
  };

  static getDerivedStateFromProps(props, state) {
    // elementMap转为state
    // 原因：弹出第二层面板后发生触发器或修改按钮状态等情况下需要更新elementMap，会造成弹出面板死循环反复弹出
    //  || JSON.stringify(props.tabInfo) !== '{}'
    if (JSON.stringify(props.listSelectedRows) !== '{}' || JSON.stringify(props.tasks) !== '{}' || JSON.stringify(props.currentTabDropDownData) !== '{}') {
      return {
        currentTabDropDownData: props.currentTabDropDownData,
        listSelectedRows: props.listSelectedRows,
        tasks: props.tasks,
      };
    }
    return null;
  }

  // 组件已经被渲染到页面中后触发
  componentDidMount() {
    // 导出功能
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://export.dhtmlx.com/gantt/project/api.js';
    document.getElementById('ganttCls').appendChild(script);
    /*
      1、排序
      2、取消连线
      3、进度条
      4、通过Shift | Alt | Meta键+鼠标滚轮移动来启用/禁用水平滚动
     */
    gantt.config.sort = true;
    gantt.config.drag_links = false;
    gantt.config.show_progress = false;
    gantt.config.horizontal_scroll_key = 'altKey';
    // gantt.config.horizontal_scroll_key = 'altKey';
    // gantt.config.details_on_dblclick = false;
    // gantt.config.work_time = true;
    this.configLayout();
    this.configTaskText();
    this.configHeader();
    this.configState();
    // this.configMagnifying();
    this.configTips();
    this.configLeftHeader();
    this.configBox();
    this.configDoubleClick();
    this.onBeforeTaskChanged();

    // this.onAfterTaskDrag();
    gantt.i18n.setLocale('cn');
    gantt.init(this.ganttContainer);
    this.ganttContainer.addEventListener('click', (e) => {
      this.checkFun(e);
    }, false);
    // gantt.plugins({
    //   keyboard_navigation: true,
    // });
    // gantt.addShortcut('Space', (e) => {
    //   console.log(e);
    // }, 'gantt');
    // gantt.addShortcut('shift+w', function(e) {
    //   var task = gantt.locate(e);
    //   if (task)
    //       gantt.showQuickInfo(task);
    // }, 'taskRow');
  }

  checkFun = (e) => {
    e.stopPropagation();
    const { listSelectedRows, setContainerState, oldDatalist } = this.props;
    const { tasks } = this.state;
    let chill = document.getElementById('checkAll');
    let chilles = document.getElementsByName('checkOne');
    let listIdArr = [], oldListIdArr = [];
    if (e.target && e.target.id === 'checkAll') {
      if (e.target.checked) {
        tasks.data.forEach((item, index) => {
          item.isCheckout = true;
          listIdArr.push({ id: { id: item.id } });
          oldListIdArr.push(oldDatalist[index]);
        });
        this.setState({ tasks });
      } else {
        tasks.data.forEach(item => {
          item.isCheckout = false;
        });
        this.setState({ tasks });
        listIdArr = [];
      }
    }
    if (e.target && e.target.name === 'checkOne') {
      chilles.forEach(item => {
        let id = item.getAttribute('dateId');
        tasks.data.forEach(val => {
          if (item.checked && id === val.id) {
            val.isCheckout = true;
          } else if (!item.checked && id === val.id) {
            val.isCheckout = false;
          }
        });
      });
      tasks.data.forEach((val, index) => {
        if (val.isCheckout === true) {
          listIdArr.push({ id: { id: val.id } });
          oldListIdArr.push(oldDatalist[index]);
        };
      });
      let sPos = gantt.getScrollState();
      let scrollToHeight = sPos.y;
      let scrollToWidth = sPos.x;
      this.setState({
        scrollToHeight,
        scrollToWidth,
        tasks,
      });
    }
    if (e.target && e.target.id === 'checkAll' || e.target && e.target.name === 'checkOne') {
      setContainerState({
        listSelectedRows: listIdArr,
        oldListSelectedRows: oldListIdArr,
      });
    }
    if (e.target && e.target.id === 'leftButn' || e.target && e.target.id === 'rightButn') {
      let gantt_task = document.querySelector('.gantt_task').offsetWidth;
      let gantt_task_scale = document.querySelector('.gantt_task_scale').offsetWidth;
      let sPos = gantt.getScrollState();
      let posX = sPos.x;
      let num = gantt_task_scale / 20;
      if (e.target && e.target.id === 'leftButn') {
        if (gantt_task === gantt_task_scale || posX === 0) {
          CMessage('暂无数据', 'warning');
          return;
        } else {
          posX = posX <= 0 && posX || posX - num;
          gantt.scrollTo(posX, null);
        }
      }
      if (e.target && e.target.id === 'rightButn') {
        if (gantt_task === gantt_task_scale || posX === gantt_task_scale) {
          CMessage('暂无数据', 'warning');
          return;
        } else {
          posX = posX >= gantt_task_scale && gantt_task_scale || (posX + num);
          gantt.scrollTo(posX, null);
          let PresPos = gantt.getScrollState();
          let prePosX = PresPos.x;
          if (prePosX !== posX) {
            CMessage('暂无数据', 'warning');
          }
        }
      }
    }
  };

  // 组件被更新完成后触发。页面中产生了新的DOM的元素，可以进行DOM操作
  componentDidUpdate(prevProps, prevState) {
    const { setSelected, setContainerState, listSelectedRows } = this.props;
    const { scrollToHeight, scrollToWidth, currentTabDropDownData, tasks } = this.state;
    if (prevState.currentTabDropDownData !== this.state.currentTabDropDownData) {
      const { state } = this.props;
      let configColor = [];
      if (JSON.stringify(currentTabDropDownData) !== '[]' && JSON.stringify(state) !== '[]') {
        const stateDate = currentTabDropDownData && state && currentTabDropDownData[state[0].id];
        stateDate && stateDate.forEach(item => {
          configColor.push({
            key: item.id,
            backgroundColor: item.colorcode,
            textColor: '#FFF',
          });
        });
      }
      gantt.serverList('staff', configColor);
      // gantt.render();
    };
    if (prevState.tasks !== tasks) {
      let arrNum = 0;
      listSelectedRows && listSelectedRows.forEach(item => {
        tasks.data.forEach(val => {
          if (item.id.id === val.id) {
            val.isCheckout = true;
            arrNum = arrNum + 1;
          }
        });
      });
      gantt.clearAll();
      tasks && gantt.parse(tasks);
      // if (JSON.stringify(tasks.data) !== '[]') {
      //   gantt.exportToPDF({
      //     tasks,
      //     locale: 'cn',
      //   });
      // }
      if (JSON.stringify(tasks.data) !== '[]' && (arrNum === tasks.data.length)) document.getElementById('checkAll').checked = true;
      gantt.scrollTo(scrollToWidth, scrollToHeight);
    }
  }

  // 布局
  configLayout = () => {
    const { ganttLeftWidth } = this.state;
    gantt.config.layout = {
      css: 'gantt_container',
      rows: [
        {
          cols: [
            {
              width: ganttLeftWidth,
              rows: [
                { view: 'grid', scrollX: 'gridScroll', scrollable: true, scrollY: 'scrollVer' },
                { view: 'scrollbar', id: 'gridScroll' },
              ],
            },
            // {
            //   width: 25,
            //   rows: [
            //     {
            //       html: '<div style="height: 50px;display: flex;align-items: center;justify-content: center;background: #FAFAFA;border-bottom: 1px solid #EBEBEB;cursor: pointer;user-select: none;color: #808080;font-size: 14px;font-weight: bold;" id="leftButn" class="switchbgd">\<</div>',
            //     },
            //   ],
            // },
            {
              rows: [
                { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
                { view: 'scrollbar', id: 'scrollHor' },
              ],
            },
            // {
            //   width: 25,
            //   rows: [
            //     {
            //       html: '<div style="height: 50px;display: flex;align-items: center;justify-content: center;background: #FAFAFA;border-bottom: 1px solid #EBEBEB;cursor: pointer;user-select: none;color: #808080;font-size: 14px;font-weight: bold;" id="rightButn" class="switchbgd">\></div>',
            //     },
            //   ],
            // },
            { view: 'scrollbar', id: 'scrollVer' }, // 向下滚动
          ],
        },
      ],
    };
    gantt.resetLayout();
  };

  // 配置右头部
  configHeader = () => {
    let zoomConfig = {
      levels: [
        {
          name: 'hour',
          scale_height: 50,
          min_column_width: 50,
          scales: [
            {
              unit: 'day', step: 1, format: function(date) {
                let dateToStr = gantt.date.date_to_str('%Y-%m-%d');
                return dateToStr(date);
              },
            },
            {
              unit: 'hour',
              format: function(date) {
                let dateToStr = gantt.date.date_to_str('%H:%i');
                // let endDate = gantt.date.add(date, 3, 'hour');
                // let endDate = gantt.date.add(gantt.date.add(date, 5, 'hour'), -1, 'hour');
                return dateToStr(date);
              },
            },
          ],
        },
        {
          name: 'day',
          scale_height: 50,
          min_column_width: 80,
          scales: [
            {
              unit: 'month', step: 1, format: function(date) {
                let dateToStr = gantt.date.date_to_str('%Y-%m');
                return dateToStr(date);
              },
            },
            { unit: 'day', step: 1, format: '%d' },
          ],
        },
        {
          name: 'week',
          scale_height: 50,
          min_column_width: 130,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            {
              unit: 'week',
              step: 1,
              format: function(date) {
                let dateToStr = gantt.date.date_to_str('%m.%d');
                let endDate = gantt.date.add(gantt.date.add(date, 7, 'day'), -1, 'day');
                let weekNum = gantt.date.date_to_str('%W')(date);
                return (
                  weekNum + '周 ' + dateToStr(date) + ' ~ ' + dateToStr(endDate)
                );
              },
            },
          ],
        },
        {
          name: 'month',
          scale_height: 50,
          min_column_width: 90,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            { unit: 'month', step: 1, format: '%M' },
          ],
        },
        {
          name: 'quarter',
          scale_height: 50,
          min_column_width: 140,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            {
              unit: 'quarter', step: 1, format: function(date) {
                let dateToStr = gantt.date.date_to_str('%M');
                let endDate = gantt.date.add(gantt.date.add(date, 3, 'month'), -1, 'day');
                let Month = Number(gantt.date.date_to_str('%n')(date));
                let quarter = '';
                if (Month === 1) {
                  quarter = '第一季度';
                } else if (Month === 4) {
                  quarter = '第二季度';
                } else if (Month === 7) {
                  quarter = '第三季度';
                } else if (Month === 10) {
                  quarter = '第四季度';
                }
                return quarter + ' ' + dateToStr(date) + ' ~ ' + dateToStr(endDate);
              },
            }],
        },
        {
          name: 'year',
          scale_height: 50,
          min_column_width: 30,
          scales: [
            {
              unit: 'year', step: 1, format: function(date) {
                let dateToStr = gantt.date.date_to_str('%Y');
                return dateToStr(date) + '年';
              },
            },
          ],
        },
      ],
    };
    gantt.ext.zoom.init(zoomConfig);
    gantt.ext.zoom.setLevel('year');
  };

  // 配置状态样式
  configState = () => {
    // gantt.serverList('staff', [
    //   { key: 1, backgroundColor: '#E73D3D', textColor: '#FFF' },
    //   { key: 2, backgroundColor: '#FAB71C', textColor: '#FFF' },
    //   { key: 3, backgroundColor: '#23CFB0', textColor: '#FFF' },
    //   { key: 4, backgroundColor: '#B0C1DA', textColor: '#FFF' },
    //   { key: 5, backgroundColor: '#3791F8', textColor: '#FFF' },
    //   { key: 6, backgroundColor: '#D9D9D9', textColor: '#FFF' },
    // ]);
    // stateColor: ['#E73D3D', '#FAB71C', '#23CFB0', '#B0C1DA', '#3791F8', '#D9D9D9'],
    gantt.templates.rightside_text = function(start, end, task) {
      function byId(list, id) {
        for (let i = 0; i < list.length; i++) {
          if (list[i].key === id)
            return list[i].label || '';
        }
        return '';
      }

      return byId(gantt.serverList('staff'), task.get_id_stateid);
    };
    gantt.templates.task_class = function(start, end, task) {
      let css = [];
      if (task.$virtual || task.type === gantt.config.types.project)
        css.push('summary-bar');
      if (task.get_id_stateid) {
        css.push('gantt_resource_task gantt_resource_' + task.get_id_stateid);
      }
      return css.join(' ');
    };
    gantt.attachEvent('onParse', function() {
      let styleId = 'dynamicGanttStyles';
      let element = document.getElementById(styleId);
      if (!element) {
        element = document.createElement('style');
        element.id = styleId;
        document.querySelector('head').appendChild(element);
      }
      let html = [];
      let resources = gantt.serverList('staff');
      resources.forEach(function(r) {
        html.push('.gantt_task_line.gantt_resource_' + r.key + '{' +
          'background-color:' + r.backgroundColor + '; ' +
          'color:' + r.textColor + ';' +
          'border: 1px solid ' + r.backgroundColor + ';' +
          'transition: all 1s;' +
          '}');
        html.push('.gantt_task_line.gantt_resource_' + r.key + ':hover {' +
          'box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.3);' +
          '}');
        html.push('.gantt_row.gantt_resource_' + r.key + ' .gantt_cell:nth-child(1) .gantt_tree_content{' +
          'background-color:' + r.backgroundColor + '; ' +
          'color:' + r.textColor + ';' +
          '}');
      });
      element.innerHTML = html.join('');
    });
  };

  // 放大
  // configMagnifying() {
  //   gantt.attachEvent('onScaleClick', function(e, date) {
  //     gantt.ext.zoom.zoomIn(date);
  //     gantt.render();
  //   });
  // }

  // tips
  configTips = () => {
    const { columns } = this.props;
    gantt.plugins({
      tooltip: true,
    });
    gantt.templates.tooltip_text = function(start, end, task) {
      let dateToStr = gantt.date.date_to_str('%Y-%m-%d %H:%i');
      let columnsString = '';
      columns.forEach(item => {
        if (item.visiabled) {
          let value = task[item.relationColumnName] || '';
          // if (item.basetype === 3) value = task[item.mainColumnName]; // 注意点
          columnsString += '<b>' + item.displayName + ':</b> ' + value + '<br/>';
        }
      });
      return (
        columnsString +
        '<b>开始时间:</b> ' +
        dateToStr(task.start_date) +
        '<br/><b>结束时间:</b> ' +
        dateToStr(task.end_date)
      );
    };
    gantt.attachEvent('onGanttReady', function() {
      let tooltips = gantt.ext.tooltips;
      tooltips.tooltip.setViewport(gantt.$task_data);
    });
  };

  // getListSelectedRows = () => {
  //   const { listSelectedRows } = this.props;
  //   return listSelectedRows;
  // };

  // 左边头部设置 布局设置宽度
  configLeftHeader = () => {
    const { ganttCheckout, ganttLeftWidth } = this.state;
    const { columns } = this.props;
    gantt.config.columns = [];
    let columnsList = [{
      width: ganttCheckout,
      name: 'check',
      align: 'center',
      label: '<input type="checkbox" id="checkAll" class="checkOutClass"/>',
      template: (obj) => {
        // let getListSelectedRows = this.getListSelectedRows();
        // let state = false;
        // getListSelectedRows.forEach(item => {
        //   if (Number(item.id.id) === obj.id) {
        //     state = true;
        //   }
        // });
        return '<input ' + (obj.isCheckout ? 'checked' : '') + ' dateId=' + obj.id + ' type="checkbox" name="checkOne" class="checkOutClass"/>';
      },
    }];
    columns.forEach((item, index) => {
      const { columnSpan } = item;
      if (((columnSpan && columnSpan > 100) || !columnSpan)) {
        if (columnSpan === 105) {
          item.speed = 0.9;
        } else if (columnSpan === 110) {
          item.speed = 1;
        } else if (columnSpan === 115) {
          item.speed = 1.1;
        } else if (columnSpan === 120) {
          item.speed = 1.2;
        }
      } else {
        if (columnSpan === 8) {
          item.speed = 640 / ganttLeftWidth;
        } else if (columnSpan === 12) {
          item.speed = 960 / ganttLeftWidth;
        } else if (columnSpan === 24) {
          item.speed = 1920 / ganttLeftWidth;
        }
      }
    });
    console.log(columns);
    columns.forEach((item, index) => {
      const { relationColumnName, displayName, columnSpan, id } = item;
      let spanwidth = '';
      if (columns.length === 1) {
        spanwidth = ganttLeftWidth - ganttCheckout;
      } else if (columns.length === 2) {
        spanwidth = (ganttLeftWidth - ganttCheckout) / 2;
      } else {
        spanwidth = (ganttLeftWidth - ganttCheckout) / 3 * item.speed;
      }
      if (item.visiabled) {
        if (item.jumpType === 2 || item.relationColumnName === 'stateid') {
          let objDate = {
            name: id,
            label: displayName,
            width: spanwidth,
          };
          if (item.relationColumnName === 'stateid' && item.jumpType === 2) {
            objDate.template = (obj) => {
              return '<a href="javascript:void(0);"><span style="width: 10px;height: 10px;display: inline-block;border-radius: 50%;margin-right: 5px;background-color: ' + obj['color'] + ';"></span>' + obj[relationColumnName] + '</a>';
            };
          } else if (item.jumpType === 2) {
            objDate.template = (obj) => {
              return '<a href="javascript:void(0);">' + obj[relationColumnName] + '</a>';
            };
          } else if (item.relationColumnName === 'stateid') {
            objDate.template = (obj) => {
              return '<span><span style="width: 10px;height: 10px;display: inline-block;border-radius: 50%;margin-right: 5px;background-color: ' + obj['color'] + '"></span>' + obj[relationColumnName] + '</span>';
            };
          };
          columnsList.push(objDate);
        } else {
          let columnsdata = {
            name: id,
            label: displayName,
            width: spanwidth,
            align: 'left',
          };
          columnsList.push(columnsdata);
        }
      }
    });
    gantt.config.columns = columnsList;
  };

  // 配置灯箱元素
  configBox = () => {
    gantt.config.lightbox.sections = [
      { name: 'time', map_to: 'auto', type: 'time', time_format: ['%Y', '%m', '%d', '%H:%i'] },
    ];
  };
  // 配置右边提示
  configTaskText = () => {
    gantt.templates.task_text = function(start, end, task) {
      return task.name || '';
    };
  };
  // 点击两次
  configDoubleClick = () => {
    const { setPopupTabInfo, columns, elementList } = this.props;
    let that = this;
    let mapping = {
      init: function(inlineEditors) {
        gantt.attachEvent('onTaskDblClick', function(id, e) {
          return false;
        });
        gantt.attachEvent('onTaskClick', function(id, e) {
          let task = gantt.getTask(id);
          let cell = inlineEditors.locateCell(e.target);
          if (cell) {
            if (e.target.tagName === 'A') {
              let listDate = {};
              elementList.forEach(item => {
                listDate[item.id] = { id: task['get_id_' + item.relationColumnName], name: item.relationColumnName };
              });
              let eleObj = columns.find(item => String(item.id) === cell.columnName) || {};
              setPopupTabInfo({ eleObj: eleObj, listRowData: listDate });
            } else {
              return true;
            }
          } else {
            let startDay = formatTime(task.start_date);
            let endDay = formatTime(task.end_date);
            that.setState({
              taskId: id,
              startDay: startDay,
              endDay: endDay,
              title: task.name,
              visiblePageConfig: true,
            });
          }
          return true;
        });
      },
    };
    gantt.ext.inlineEditors.setMapping(mapping);
  };
  onBeforeTaskChanged = () => {
    const { tabInfo, fetchListData } = this.props;
    gantt.attachEvent('onAfterTaskDrag', function(id, mode, old_event) {
      let task = gantt.getTask(id);
      if (mode === gantt.config.drag_mode.move || mode === gantt.config.drag_mode.resize) {
        // if (moment().valueOf() > moment(old_event.start_date).valueOf()) {
        //   return false;
        // }
        let startDay = formatTime(task.start_date);
        let endDay = formatTime(task.end_date);
        let params = {
          tabSource: tabInfo && tabInfo.relationTableName,
          id: task.id,
          planStartTime: startDay,
          planEndTime: endDay,
        };
        updateChangeTime(params).then(res => {
          CMessage('修改成功');
          // fetchListData({});
          gantt.render();
        });
      }
      return true;
    });
  };
  handleSelectTime1 = (value, dateString) => {
    this.setState({
      startDay: dateString,
    });
  };
  handleSelectTime2 = (value, dateString) => {
    this.setState({
      endDay: dateString,
    });
  };
  handleOk = e => {
    const { startDay, endDay, taskId, tasks } = this.state;
    const { tabInfo, fetchListData } = this.props;
    let params = {
      tabSource: tabInfo && tabInfo.relationTableName,
      id: taskId,
      planStartTime: startDay,
      planEndTime: endDay,
    };
    let startDayTime = new Date(startDay).valueOf();
    let endDayTime = new Date(endDay).valueOf();
    if (startDayTime > endDayTime) {
      CMessage('开始时间不能大于结束时间', 'warning');
      return;
    }
    updateChangeTime(params).then(res => {
      const { listDataArr, elementList, setContainerState } = this.props;
      CMessage('修改成功');
      // tasks.data.forEach(item => {
      //   if (item.id === params.id) {
      //     item.planStartTime = params.planStartTime;
      //     item.planEndTime = params.planEndTime;
      //     item.start_date = formatTime(params.planStartTime, 3);
      //     item.end_date = formatTime(params.planEndTime, 3);
      //   }
      // });
      // gantt.clearAll();
      // this.state.tasks && gantt.parse(this.state.tasks);
      this.setState({ visiblePageConfig: false });
      const { total, datalist } = listDataArr;
      JSON.stringify(datalist) !== '[]' && datalist.forEach(item => {
        let idVal = '';
        elementList.forEach(val => {
          let itemObj = item[val.id];
          if (val.relationColumnName === 'id') {
            idVal = itemObj && JSON.parse(itemObj).id;
          }
          if (idVal === params.id && val.relationColumnName === 'plannedenddate') {
            let valueDate = {
              id: params.planEndTime,
              name: params.planEndTime,
            };
            item[val.id] = JSON.stringify(valueDate);
          } else if (idVal === params.id && val.relationColumnName === 'plannedstartdate') {
            let valueDate = {
              id: params.planStartTime,
              name: params.planStartTime,
            };
            item[val.id] = JSON.stringify(valueDate);
          }
        });
      });
      setContainerState({
        listDataArr: listDataArr,
      });
      console.log(listDataArr);
    });
  };
  handleCancel = e => {
    this.setState({ visiblePageConfig: false });
  };

  render() {
    const { tabInfo } = this.props;
    const { visiblePageConfig, startDay, endDay, title } = this.state;
    const footer = (
      <Fragment>
        <CButton
          onClick={() => this.handleCancel()}
        >
          <FormattedMessage id="global.cancel"/>
        </CButton>
        <CButton
          type="primary"
          onClick={() => this.handleOk()}
        >
          <FormattedMessage id="global.save"/>
        </CButton>
      </Fragment>
    );
    return (
      <div className={styles.gantt_con} id="ganttCls">
        <div ref={(input) => {
          this.ganttContainer = input;
          }} className={styles.gantt}
        >
        </div>
        <Modal
          getContainer={document.getElementById('main-container')} // 挂载的html节点
          title="修改时间"
          centered={true}
          visible={visiblePageConfig}
          footer={footer}
          onCancel={this.handleCancel}
          width={600}
        >
          <span style={{ width: '70px', display: 'inline-block' }}>开始时间</span>
          <DatePicker value={moment(startDay, 'YYYY-MM-DD HH:mm:ss')} showTime onChange={this.handleSelectTime1} />
          <span style={{ width: '70px', display: 'inline-block', margin: '0 0 0 15px' }}>结束时间</span>
          <DatePicker value={moment(endDay, 'YYYY-MM-DD HH:mm:ss')} showTime onChange={this.handleSelectTime2} />
          {/* <RangePicker
            showTime
            onChange={this.handleSelectTime}
            className={styles.pickerTime}
            value={[moment(startDay, 'YYYY-MM-DD HH:mm:ss'), moment(endDay, 'YYYY-MM-DD HH:mm:ss')]}
          /> */}
        </Modal>
      </div>
    );
  }
}

export default OutlookGantt;
