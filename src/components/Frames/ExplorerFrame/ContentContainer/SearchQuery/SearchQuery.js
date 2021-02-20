/*
 * @Author: Fus
 * @Date:   2019-10-10 16:33:22
 * @Desc: 便捷查询+高级筛选
 */
import { Component } from 'react';
import { Input, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import { BaseContext } from '@/constants/global';
import { CSearch } from '@/components/common/BasicWidgets';
import styles from './SearchQuery.less';

const { Option } = Select;
const InputGroup = Input.Group;

class SearchQuery extends Component {
  static contextType = BaseContext
  state = {
    selectedFiledObj: { ignore_is_all: true }, // 选中的字段控件详情
  }
  // 获取便捷搜索列表
  getQuickQueryEle = () => {
    const { elementList } = this.props;
    const quickQueryEleList = elementList.filter(item => item.quickQuery);
    return quickQueryEleList;
  }
  // 搜索
  handleSearch = value => {
    const { selectedFiledObj } = this.state;
    const quickQueryEleList = this.getQuickQueryEle();
    let searchQueryList = [];
    if (value && !selectedFiledObj.ignore_is_all) {
      // 选择了某个字段，则使用该字段传入
      const field = (selectedFiledObj.mainColumnName && selectedFiledObj.mainTableName) ? selectedFiledObj.mainColumnName : selectedFiledObj.relationColumnName;
      searchQueryList = [{
        field, // 配了实体表和实体表字段时则使用实体表字段
        value,
        tableName: selectedFiledObj.mainTableName,
        elementId: selectedFiledObj.id,
      }];
    } else if (!value || selectedFiledObj.ignore_is_all) { // 选择全部时，全部字段返回
      searchQueryList = quickQueryEleList.map(item => {
        const field = (item.mainColumnName && item.mainTableName) ? item.mainColumnName : item.relationColumnName;
        return {
          field, // 配了实体表和实体表字段时则使用实体表字段
          value,
          tableName: item.mainTableName,
          elementId: item.id,
        };
      });
    }
    const { setContainerState, fetchListData } = this.props;
    setContainerState({
      listQueryParams: {
        pageSize: 10,
        pageNum: 1,
      },
    }, () => {
      fetchListData({ searchQueryList });
    });
  }
  render() {
    const quickQueryEleList = this.getQuickQueryEle();
    const { langLib } = this.context;
    return (
      <div className={styles.wrap}>
        <InputGroup compact>
          <Select
            defaultValue={null}
            dropdownMatchSelectWidth={false}
            onChange={(val, option) => this.setState({ selectedFiledObj: option.props.dataObj })}
          >
            <Option value={null} dataObj={{ ignore_is_all: true }}>
              <FormattedMessage id="global.all" />
            </Option>
            {quickQueryEleList.map(item => (
              <Option value={item.relationColumnName} key={item.id} dataObj={item}>
                <span title={item.displayName}>
                  {item.displayName}
                </span>
              </Option>
            ))}
          </Select>
          <CSearch
            placeholder={langLib['form.placeholder.keywords']}
            style={{ width: 240 }}
            onSearch={this.handleSearch}
            onChange={e => !e.target.value && this.handleSearch(e.target.value)}
          />
        </InputGroup>
      </div>
    );
  }
}

export default SearchQuery;