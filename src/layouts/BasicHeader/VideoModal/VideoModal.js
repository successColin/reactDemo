// import React, { Component } from 'react';
// import { connect } from 'dva';
// import TRTCCalling from 'trtc-calling-js';
// import TRTC from 'trtc-js-sdk';
// import TIM from 'tim-js-sdk';
// import COS from 'cos-js-sdk-v5';
// import CreateModal from '@/components/common/CreateModal/CreateModal';
// import VideoContent from '@/components/VideoManagement/VideoContent/VideoContent';
// import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
// import { Base64 } from 'js-base64';
// import { BaseContext } from '@/constants/global';
// import { getCookie } from '@/utils/common';
// import { invite, getUserInfo, getUserSig } from '@/services/videoManager';
// import avatar from '@/assets/avatar.png';
// import Styles from './VideoModal.less';
//
//
// @connect(state => ({
//   userInfo: state.user.userInfo,
//   vedioVisible: state.global.vedioVisible, // 视频弹框
//   vedioUserList: state.global.vedioUserList,  // 正在视频的用户
// }))
// class VideoTypeModal extends Component {
//   static contextType = BaseContext;
//
//   constructor(props) {
//     super(props);
//     this.state = {
//       inviteConfig: {}, // 邀请者信息
//       callStatus: '', // 接通状态
//       visibleTell: false,
//       userList: [], // 用户人员列表
//       callType: '', // 1:语音通话；2:视频通话
//       isReady: false,
//     };
//     this.trtcCalling = null;
//     this.shareClient = null;
//     this.tim = null;
//   }
//
//   componentDidMount() {
//     const eam_info = getCookie('eaminfo');
//     const userInfo = eam_info ? JSON.parse(decodeURIComponent(unescape(eam_info))) : {};
//     const { account, expert } = userInfo;
//     if (expert) { // 只有专家列表的用户才能使用
//       // const config = genTestUserSig(userInfo.account);
//       getUserSig({ userId: Base64.encode(userInfo.account) }).then(res => {
//           // let options = {
//           //   SDKAppID: res.sdkAppId, // 接入时需要将0替换为您的即时通信应用的 SDKAppID
//           // };
//           // this.tim = TIM.create(options); // SDK 实例通常用 tim 表示
//           // this.tim.registerPlugin({ 'cos-js-sdk': COS });
//         // this.tim.login({ userID: account, userSig: res.userSig }).then(res => {
//         //   console.log('登录成功');
//         //
//         // });
//         this.trtcCalling = new TRTCCalling({ SDKAppID: res.sdkAppId });
//         const _tsignalingClient = this.trtcCalling._tsignalingClient;
//         const _tsignaling = _tsignalingClient && _tsignalingClient._tsignaling;
//         this.tim = _tsignaling._tim;
//         this.tim.registerPlugin({ 'cos-js-sdk': COS });
//         console.log(this.trtcCalling,'ssssssssssssssssssss,trtcCalling')
//         this.trtcCalling.login({ userID: account, userSig: res.userSig });
//         // this.addTimEvent();
//         this.addEvent();
//       });
//     }
//   }
//
//   componentWillUnmount() {
//     this.trtcCalling && this.trtcCalling.logout();
//     this.trtcCalling && this.offEvent();
//     // this.tim && this.removeEvent();
//     // this.tim && this.tim.logout().then(res => {
//     //   console.log('退出登录');
//     // }).catch(err => {
//     //   console.log('退出登录失败');
//     // });
//   }
//
//   removeEvent = () => {
//     this.tim.off(TIM.EVENT.SDK_READY, () => {
//
//     });
//   };
//   addTimEvent = () => {
//     this.tim.on(TIM.EVENT.SDK_READY, () => {
//       console.log('ready---------------------');
//       this.setState({ isReady: true });
//     });
//     this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, (event) => {
//       console.log('监听到用户司法局路撒打飞机', event);
//       this.getReceiver(event);
//     });
//   };
//   getReceiver = (event) => {
//     const { data } = event;
//     const obj = data[0];
//     console.log(obj, '------------------');
//   };
//
// // 视频中所有的事件监听
//   offEvent = () => {
//     this.trtcCalling.off( // 监听邀请
//       TRTCCalling.EVENT.INVITED,
//       this.handleNewInvitationReceived,
//     );
//     this.trtcCalling.off( // 监听人员进房间
//       TRTCCalling.EVENT.USER_ENTER,
//       this.handleUserEnter,
//     );
//     this.trtcCalling.off( // 监听人员离开房间
//       TRTCCalling.EVENT.USER_LEAVE,
//       this.handleUserLeave,
//     );
//     this.trtcCalling.off( // 结束通话
//       TRTCCalling.EVENT.CALL_END,
//       this.handleCallEnd,
//     );
//     this.trtcCalling.on( // 拒绝邀请通话
//       TRTCCalling.EVENT.REJECT,
//       this.handleInviteeReject,
//     );
//     this.trtcCalling.off( // 邀请用户无应答
//       TRTCCalling.EVENT.NO_RESP,
//       this.handleNoResponse,
//     );
//     this.trtcCalling.off( // 用户忙线
//       TRTCCalling.EVENT.LINE_BUSY,
//       this.handleInviteeLineBusy,
//     );
//     this.trtcCalling.off( // 取消通话
//       TRTCCalling.EVENT.CALLING_CANCEL,
//       this.handleInviterCancel,
//     );
//     this.trtcCalling.off( // 邀请超时
//       TRTCCalling.EVENT.CALLING_TIMEOUT,
//       this.handleCallTimeout,
//     );
//   };
//   // 视频中所有的事件监听
//   addEvent = () => {
//     this.trtcCalling.on( // 监听邀请
//       TRTCCalling.EVENT.INVITED,
//       this.handleNewInvitationReceived,
//     );
//     this.trtcCalling.on( // 监听人员进房间
//       TRTCCalling.EVENT.USER_ENTER,
//       this.handleUserEnter,
//     );
//     this.trtcCalling.on( // 监听人员离开房间
//       TRTCCalling.EVENT.USER_LEAVE,
//       this.handleUserLeave,
//     );
//     this.trtcCalling.on( // 结束通话
//       TRTCCalling.EVENT.CALL_END,
//       this.handleCallEnd,
//     );
//     this.trtcCalling.on( // 拒绝邀请通话
//       TRTCCalling.EVENT.REJECT,
//       this.handleInviteeReject,
//     );
//     this.trtcCalling.on( // 邀请用户无应答
//       TRTCCalling.EVENT.NO_RESP,
//       this.handleNoResponse,
//     );
//     this.trtcCalling.on( // 用户忙线
//       TRTCCalling.EVENT.LINE_BUSY,
//       this.handleInviteeLineBusy,
//     );
//     this.trtcCalling.on( // 取消通话
//       TRTCCalling.EVENT.CALLING_CANCEL,
//       this.handleInviterCancel,
//     );
//     this.trtcCalling.on( // 邀请超时
//       TRTCCalling.EVENT.CALLING_TIMEOUT,
//       this.handleCallTimeout,
//     );
//     this.trtcCalling.on( // 远端用户打开关闭摄像头。
//       TRTCCalling.EVENT.USER_VIDEO_AVAILABLE,
//       this.handleUserVideoChange,
//     );
//     this.trtcCalling.on( // 远端用户开启/关闭了麦克风。
//       TRTCCalling.EVENT.USER_AUDIO_AVAILABLE,
//       this.handleUserAudioChange,
//     );
//   };
//   // 远端用户开启/关闭了麦克风。
//   handleUserAudioChange = ({ userID, isAudioAvailable }) => {
//     console.log(userID, isAudioAvailable, '远端用户开启/关闭了麦克风');
//     if (userID.indexOf('_show') > -1) return;
//     this.updateUserList(userID, { hasMicrophone: isAudioAvailable });
//   };
//   // 更新列表
//   updateUserList = (userID, obj = {}) => {
//     const { updateState, vedioUserList } = this.props;
//     const userList = [...vedioUserList];
//     let User = userList.find(item => item.userID === userID);
//     if (!User) return;
//     let newLocalUser = { ...User, ...obj };
//     const index = userList.findIndex(item => item.userID === userID);
//     let newUserList = [...userList];
//     newUserList.splice(index, 1, newLocalUser);
//     const { dispatch } = this.context;
//     const params = { vedioUserList: newUserList };
//     dispatch({
//       type: 'global/updateState',
//       payload: { ...params },
//     });
//   };
//   // 监听用户切换摄像头
//   handleUserVideoChange = ({ userID, isVideoAvailable }) => {
//     if (userID.indexOf('_show') > -1) return;
//     this.updateUserList(userID, { hasCamera: isVideoAvailable });
//   };
//
//   // 邀请超时
//   handleCallTimeout = () => {
//     const { dispatch, langLib } = this.context;
//     CMessage(langLib['global.timeOut'], 'warn');
//     this.setState({ visibleTell: false });
//     this.removeAudio();
//     this.handleCallEnd();
//   };
//   // 取消通话
//   handleInviterCancel = () => {
//     const { dispatch, langLib } = this.context;
//     this.setState({ visibleTell: false });
//     this.removeAudio();
//     CMessage(langLib['global.Cancelcall'], 'warn');
//     this.handleCallEnd();
//   };
//   // 用户忙线
//   handleInviteeLineBusy = ({ userID }) => {
//     const { dispatch, langLib } = this.context;
//     getUserInfo({ account: userID }).then(res => {
//       const { name } = res;
//       CMessage(langLib['global.busyline'](name), 'warn');
//     });
//     this.handleCallEnd();
//   };
//   // 邀请用户无应答
//   handleNoResponse = ({ userID }) => {
//     const { dispatch, langLib } = this.context;
//     CMessage(langLib['global.response'](userID), 'warn');
//     // this.handleCallEnd();
//   };
//
//   // 拒绝通话
//   handleInviteeReject = ({ userID }) => {
//     const { dispatch, langLib } = this.context;
//     getUserInfo({ account: userID }).then(res => {
//       const { name } = res;
//       CMessage(langLib['global.reject'](name), 'warn');
//     });
//     this.handleCallEnd();
//   };
//   // 结束通话
//   handleCallEnd = () => {
//     console.log('结束通话-------');
//     this.trtcCalling.hangup();
//     this.dissolveMeetingIfNeed();
//   };
//
//   dissolveMeetingIfNeed = () => {
//     const { vedioUserList } = this.props;
//     if (vedioUserList.length < 2) {
//       const params = {
//         vedioVisible: false,
//         vedioUserList: [],
//       };
//       this.update(params);
//       this.setState({
//         callType: '',
//         inviteConfig: {},
//       });
//     }
//
//
//   };
//
//   // 用户离开
//   handleUserLeave = ({ userID }) => {
//     const { vedioUserList, userInfo } = this.props;
//     const { dispatch, langLib } = this.context;
//     console.log('用户离开-------', userID);
//     if (userID.indexOf('_show') > -1) {
//       const inviter = vedioUserList.find(item => item.inviteType === 1) || {};
//       const showUser = userID.split('_')[0];
//       if (inviter.userID === userInfo.account && showUser === userInfo.account) return;
//       if (inviter.userID === userInfo.account && showUser !== userInfo.account) {
//         console.log('stopRemoteView');
//         this.trtcCalling.stopLocalView({ userID: userInfo.account, videoViewDomID: 'local_stream' });
//         this.trtcCalling.startLocalView({ userID: userInfo.account, videoViewDomID: 'local_stream' });
//         return;
//       }
//
//       setTimeout(() => {
//         this.trtcCalling.stopRemoteView({ userID: inviter.userID, videoViewDomID: 'local_stream' }); // 将远端用户的摄像头数据渲染到指定的 DOM ID 节点里。
//         this.trtcCalling.startRemoteView({ userID: inviter.userID, videoViewDomID: 'local_stream' }); // 将远端用户的摄像头数据渲染到指定的 DOM ID 节点里。
//       }, 0);
//       return;
//     }
//     const index = vedioUserList.findIndex(item => item.userID === userID);
//     let newUserList = [...vedioUserList];
//     newUserList.splice(index, 1);
//
//     if (newUserList.length < 2) {
//       const params = {
//         vedioVisible: false,
//         vedioUserList: [],
//       };
//       this.update(params);
//       this.setState({
//         callType: '',
//         inviteConfig: {},
//       });
//       this.handleCallEnd();
//     } else {
//       const params = {
//         vedioUserList: newUserList,
//       };
//       this.update(params);
//     }
//     getUserInfo({ account: userID }).then(res => {
//       const { name } = res;
//       CMessage(langLib['global.leave'](name));
//     });
//
//   };
//   update = (params) => {
//     const { dispatch } = this.context;
//     dispatch({
//       type: 'global/updateState',
//       payload: { ...params },
//     });
//   };
//
//   // 被邀请
//   handleNewInvitationReceived = ({
//                                    sponsor, userIDList, isFromGroup, inviteData, inviteID,
//                                  }) => {
//     console.log(sponsor, userIDList, isFromGroup, inviteData, inviteID, '邀请人信息');
//     const { userInfo } = this.props;
//     if (userInfo.account === sponsor) return;
//     // 这里需要考虑忙线的情况
//     if (this.callStatus === 'connected') {
//       console.log('connected');
//       this.trtcCalling.reject({ inviteID, isBusy: true });
//       return;
//     }
//     if (inviteData.callEnd) {
//       // 最后一个人发送 invite 进行挂断
//       return;
//     }
//     getUserInfo({ account: sponsor }).then(res => {
//       const { name, profileUrl } = res;
//       this.setState({
//         visibleTell: true,
//         inviteConfig: {
//           inviteID,
//           inviteData,
//           sponsor, // 邀请人账号
//           sponsorName: name,
//           sponsorUrl: profileUrl,
//         },
//       }, () => {
//         let audio = document.createElement('audio');
//         audio.style.display = 'none';
//         audio.id = 'inviteAudio';
//         audio.src = require('@/assets/audio/wx.mp3');
//         audio.loop = 'loop';
//         audio.type = 'audio/mpeg';
//         document.body.appendChild(audio);
//         audio.play();
//       });
//     });
//
//   };
//   // 用户进入并且渲染dom节点
//   handleUserEnter = ({ userID }) => {
//     const { userInfo, vedioUserList } = this.props;
//     const { langLib } = this.context;
//     const { inviteConfig: { sponsor }, callType } = this.state;
//     let user = {
//       userID, // 用户id
//       hasCamera: true, // 是否开启摄像头，默认true
//       hasMicrophone: true, // 是否开启麦克风，默认true
//       hasSpeaker: true, // 是否开启扬声器，默认true
//       inviteType: 2, // 邀请人是否是被邀请，1：邀请人 2：被邀请
//     };
//     console.log(userID, sponsor, 'handleUserEnter----------------');
//     if (userID === sponsor) { // 如果进入的人是邀请者，放到主屏
//       user.inviteType = 1;
//       this.trtcCalling.startRemoteView({ userID, videoViewDomID: 'local_stream' }); // 将本地用户的摄像头数据渲染到指定的 DOM ID 节点里
//     } else if (!sponsor && userID.indexOf('_show') === -1) { // 对应本地邀请别人，sponsor值是空，视频放到主屏
//       this.trtcCalling.startLocalView({ userID: userInfo.account, videoViewDomID: 'local_stream' });
//     } else if (userID.indexOf('_show') > -1) {
//       console.log(vedioUserList, '33333333');
//       const inviter = vedioUserList.find(item => item.inviteType === 1) || {};
//       console.log(inviter, 'inviter');
//       // if (inviter.userID === userInfo.account) return;
//       const showUser = userID.split('_')[0];
//       console.log(showUser, 'sssssssssssssssss');
//       if (userInfo.account !== showUser) {
//         if (inviter.userID === userInfo.account) {
//           this.trtcCalling.stopLocalView({ userID: inviter.userID, videoViewDomID: 'local_stream' });
//         } else {
//           this.trtcCalling.stopRemoteView({ userID: inviter.userID, videoViewDomID: 'local_stream' });
//         }
//         // document.querySelector('#local_stream').innerHTML = '';
//         this.trtcCalling.startRemoteView({ userID, videoViewDomID: 'local_stream' }); // 将远端用户的摄像头数据渲染到指定的 DOM ID 节点里。
//       }
//       return;
//     }
//
//     getUserInfo({ account: userID }).then(res => {
//       const { name, profileUrl } = res;
//       user = {
//         ...user,
//         userName: name, // 用户名称
//         useravatar: profileUrl, // 用户头像
//       };
//       vedioUserList.push(user);
//       this.update({ vedioUserList: [...vedioUserList] });
//       CMessage(langLib['global.enter'](name));
//     });
//   };
//   // 接受通话
//   handleRecever = (type) => {
//     const { inviteConfig } = this.state;
//     const { dispatch } = this.context;
//     const { userInfo, vedioUserList } = this.props;
//     const { inviteID, inviteData: { roomID, callType }, sponsor } = inviteConfig;
//     console.log('先接受邀请，---------', inviteConfig, this.state, roomID);
//     const inviteInfo = {
//       userID: userInfo.account, // 用户id
//       hasCamera: type === 1 ? false : true, // 是否开启摄像头，默认true
//       hasMicrophone: true, // 是否开启麦克风，默认true
//       hasSpeaker: true, // 是否开启扬声器，默认true
//       inviteType: 2, // 邀请人是否是被邀请，1：邀请人 2：被邀请
//       userName: userInfo.username, // 用户名称
//       useravatar: userInfo.picpath || '', // 用户头像
//     }; // 接收人的数据类型
//     this.trtcCalling.accept({ inviteID, roomID, callType });
//     invite({ inviteID: sponsor, roomID, callType });
//     vedioUserList.push(inviteInfo);
//     console.log(vedioUserList, '先接受邀请');
//     const params = {
//       vedioVisible: true,
//       vedioUserList: [...vedioUserList],
//     };
//     this.update(params);
//     this.setState({ visibleTell: false, callType: type });
//     this.removeAudio();
//   };
//   // 移除铃声
//   removeAudio = () => {
//     let audioDom = document.getElementById('inviteAudio');
//     audioDom && document.body.removeChild(audioDom);
//   };
//   // 拒绝通话
//   reject = () => {
//     const { inviteConfig } = this.state;
//     const { inviteID, inviteData: { roomID, callType } } = inviteConfig;
//     this.trtcCalling.reject({ inviteID, isBusy: false, callType });
//     console.log('拒绝通话拒绝通话拒绝通话拒绝通话拒绝通话');
//     this.setState({ visibleTell: false }, () => {
//       this.removeAudio();
//     });
//   };
//   // 更新状态
//   updateState = (itemObj = {}, callback) => {
//     this.setState({ ...itemObj }, () => {
//       callback && callback();
//     });
//   };
//
//
//   render() {
//     const { vedioVisible, vedioUserList, userInfo } = this.props;
//     console.log(vedioUserList, 'vedioUserList', '--------------');
//     const {
//       visibleTell, inviteConfig: {
//         sponsor, sponsorName,
//         sponsorUrl,
//         inviteData,
//       },
//       isReady,
//     } = this.state;
//     return (
//       <div>
//         <CreateModal
//           footer={null}
//           closable={false}
//           destroyOnClose={true}
//           maskClosable={false}
//           visible={visibleTell}
//           getContainer={() => document.getElementById('main-container')}
//           width={318}
//           wrapClassName={Styles.wrapClassName}
//         >
//           <div className={Styles.avatar}>
//             <img src={sponsorUrl || avatar} alt=""/>
//           </div>
//           <div className={Styles.invitName}>{sponsorName || sponsor}</div>
//           <div className={Styles.descrtion}>邀请您加入视频会议</div>
//           <div className={Styles.audioWrap} onClick={() => {
//             this.handleRecever(1);
//           }}>
//             <span className={`iconfont icon-audio ${Styles.audio}`}></span>
//             <div className={Styles.tit}>语音通话</div>
//           </div>
//
//
//           <div className={Styles.rejectedWrap} onClick={() => {
//             this.reject();
//           }}>
//             <span className={`iconfont icon-reject ${Styles.rejected}`}></span>
//             <div className={Styles.tit}>挂断</div>
//           </div>
//           <div className={Styles.videoWrap} onClick={() => {
//             this.handleRecever(2);
//           }}>
//             <span className={`iconfont icon-vedio ${Styles.video}`}></span>
//             <div className={Styles.tit}>视频通话</div>
//           </div>
//
//         </CreateModal>
//         <CreateModal
//           visible={vedioVisible}
//           // visible={true}
//           title={null}
//           size="large"
//           footer={null}
//           wrapClassName={Styles.wrapContentDetial}
//           closable={false}
//           destroyOnClose={true}
//           maskClosable={false}
//           getContainer={() => document.getElementById('main-container')}
//         >
//           <VideoContent
//             inviteData={inviteData}
//             userInfo={userInfo}
//             userList={vedioUserList}
//             trtcCalling={this.trtcCalling}
//             tim={this.tim}
//             isReady={isReady}
//             SYSTRTCCalling={TRTCCalling}
//             updateState={this.updateState}
//           />
//         </CreateModal>
//       </div>
//     );
//   }
// }
//
// export default VideoTypeModal;
