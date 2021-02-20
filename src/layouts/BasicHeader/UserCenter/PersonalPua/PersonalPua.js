/*
 * @Author: Fus
 * @Date:   2019-09-23 15:13:26
 * @Desc: 上传个人资质
 */
import { Component } from 'react';
import { connect } from 'dva';
import { FormattedMessage } from 'react-intl';
import { BaseContext } from '@/constants/global';
import { CUpload } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';

@connect(state => ({
  userInfo: state.user.userInfo,
  personalPuaList: state.user.personalPuaList,
}))
class PersonalPua extends Component {
  static contextType = BaseContext
  handleUpdatePuaList = (fileId) => {
    const { userInfo, personalPuaList } = this.props;
    const newList = [...personalPuaList];
    newList.push({
      relationId: userInfo.id,
      relationTableName: 'user',
      relationTypeId: 2,
      mainId: fileId,
      basetype: 2,
      shouldSave: true,
    });
    this.setList(newList);
  }
  handleRemoveFile = removeId => {
    const { userInfo, personalPuaList } = this.props;
    const newList = [...personalPuaList];
    newList.forEach((item, index) => {
      if (item.mainId === removeId) {
        newList.splice(index, 1);
      }
    });
    this.setList(newList);
  }
  // 更新数据
  setList = (personalPuaList) => {
    this.context.dispatch({
      type: 'user/updateState',
      payload: {
        personalPuaList,
      },
    });
  }
  getFormConfigs = () => {
    const { userInfo } = this.props;
    return [{
      key: 'personalPua',
      label: <FormattedMessage id="userCenter.personalPua" />,
      colSpan: 24,
      component: (
        <div>
          <CUpload
            accept=".jpg, .jpeg, .png"
            fromType="personalPua"
            relationParams={{
              relationId: userInfo.id,
              relationTableName: 'user',
              relationTypeId: 2,
            }}
            setFileInfo={this.handleUpdatePuaList}
            onRemoveFile={removeId => this.handleRemoveFile(removeId)}
          />
        </div>
      ),
    }];
  }
  render() {
    const { form } = this.props;
    return (
      <FormItems
        formConfigs={this.getFormConfigs()}
        form={form}
        loading={false}
      />
    );
  }
}
export default PersonalPua;