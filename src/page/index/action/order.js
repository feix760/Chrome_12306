
import api from '../api';
import * as Log from '../log';

export const ORDER_STATUS = 'ORDER_STATUS';

export const ORDER_UPDATE_ATTR = 'ORDER_UPDATE_ATTR';

function getPassengerInfo(seatType, passengerList) {
  const passengerTicketArray = [];
  const oldPassengerArray = [];
  passengerList.forEach(item => {
    const {
      type,
      passenger_name: name,
      passenger_id_no: id,
    } = item;
    passengerTicketArray.push([ seatType, 0, type, name, 1, id, '', 'N' ].join(','));
    oldPassengerArray.push([ name, 1, id, type ].join(','));
  });
  return {
    passengerTicketStr: passengerTicketArray.join('_'),
    oldPassengerStr: oldPassengerArray.join('_') + '_',
  };
}

async function prepareSubmit(dispatch, getState) {
  const { input, order } = getState();
  const { train, tourFlag, seat } = order;

  Log.info(`发现有票车: ${train.name} ${seat.name} ${train[seat.key]} 准备提交中...`);

  await api.submitOrderRequest({
    train,
    tourFlag,
    isStu: false,
  });

  const { submitToken, keyChange } = await api.initDc();

  if (!input.passengerList.length) {
    Log.info('请选择乘客！');
    dispatch({
      type: ORDER_STATUS,
      data: 'stop',
    });
    return;
  }

  const { passengerTicketStr, oldPassengerStr } = getPassengerInfo(seat.seatType, input.passengerList);

  Log.info({
    passengerTicketStr,
    oldPassengerStr,
  });

  const checkOrderInfo = await api.checkOrderInfo({
    submitToken,
    tourFlag,
    passengerTicketStr,
    oldPassengerStr,
  });

  dispatch({
    type: ORDER_UPDATE_ATTR,
    data: {
      submitToken,
      keyChange,
      passengerTicketStr,
      oldPassengerStr,
    },
  });

  if (checkOrderInfo.ifShowPassCode === 'Y') {
    Log.info('请立刻输入 订单验证码，验证码输入正确后将自动提交订单');
    dispatch({
      type: ORDER_STATUS,
      data: 'read-checkcode',
    });

    try {
      await getQueueCount(dispatch, getState);
    } catch (err) {
    }
  } else {
    Log.info('无需输入验证码，自动提交订单...');
    await confirmSingleForQueue(dispatch, getState);
  }
}

async function getQueueCount(dispatch, getState) {
  const { train, seat, submitToken, startAt } = getState().order;
  const queueCount = await api.getQueueCount({
    train,
    submitToken,
    seatType: seat.seatType,
  });

  const counts = queueCount.ticket.split(',');
  let str = `余票: ${counts[0]}张${counts[1] ? ' 无座: ' + counts[1] + '张' : ''} 排队人数: ${queueCount.countT}`;
  if (!counts[0] || queueCount.op_2 === 'true') {
    str += ' 目前排队人数已经超过余票张数，请您选择其他席别或车次。';
    str += ` 耗时: ${(Date.now() - startAt) / 1000}s`;
    dispatch({
      type: ORDER_STATUS,
      data: 'stop',
    });
    return false;
  }
  Log.info(str);
  return true;
}

async function confirmSingleForQueue(dispatch, getState) {
  const { order } = getState();
  const { train, submitToken, keyChange, passengerTicketStr, oldPassengerStr, randCode } = order;

  const getQueueCountResult = await getQueueCount(dispatch, getState);

  if (!getQueueCountResult) {
    return;
  }

  await api.confirmSingleForQueue({
    randCode,
    train,
    submitToken,
    keyChange,
    passengerTicketStr,
    oldPassengerStr,
  });

  dispatch({
    type: ORDER_STATUS,
    data: 'success',
  });

  Log.info(`提交订单成功，耗时: ${(Date.now() - order.startAt) / 1000}s，请点击 <a href="https://kyfw.12306.cn/otn/queryOrder/initNoComplete" target="_blank">查看订单</a> 前往12306完成付款。`);
}

async function query(dispatch, getState) {
  const { input, order } = getState();

  if (['stop', 'success', 'fail'].indexOf(order.status) !== -1) {
    return true;
  }

  if (!input.from || !input.to || !input.date) {
    Log.info('请选择发站、到站、日期');
    return false;
  }

  Log.info(`${input.date.format('MM-DD')} 查询${input.queryStudent ? '学生' : '成人'}票..`);

  let allTrain;
  try {
    const queryUrl = input.queryUrl;
    allTrain = await api.query({
      queryUrl,
      from: input.from.code,
      to: input.to.code,
      date: input.date.format('YYYY-MM-DD'),
    });
  } catch (err) {
    Log.info('query fail');
    return false;
  }

  let okTrain;
  allTrain.forEach(item => {
    let hasLogTrain = false;
    return input.trainList.forEach(({ train, seat }) => {
      if (item.name === train.name) {
        if (!hasLogTrain) {
          hasLogTrain = true;
          Log.info(`${input.date.format('MM-DD')} ${item.name}：${item.button}`);
          Log.info(`硬座：${item.yz} 无座：${item.wz} 硬卧：${item.yw} 软卧：${item.rw} 二等座：${item.ze} 一等座：${item.zy}`);
        }
        const count = item[seat.key];
        if (count && (count === '有' || !isNaN(count))) {
          okTrain = {
            train: item,
            seat,
          };
          return true;
        }
      }
      return false;
    });
  });

  if (okTrain) {
    dispatch({
      type: ORDER_UPDATE_ATTR,
      data: {
        ...okTrain,
        status: 'submit',
        startAt: Date.now(),
      },
    });
    await prepareSubmit(dispatch, getState);
    return true;
  }

  return false;
}

export function startQuery() {
  return (dispatch, getState) => {
    if (getState().order.status !== 'stop') {
      return Promise.reject();
    }

    dispatch({
      type: ORDER_STATUS,
      data: 'query',
    });

    return (async () => {
      while (true) {
        let stop;

        try {
          stop = await query(dispatch, getState);
        } catch (err) {
          dispatch({
            type: ORDER_STATUS,
            data: 'fail',
          });
          console.log(err);
          Log.info('系统异常');
        }

        if (stop) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, getState().input.duration));
      }
    })();
  };
}

export function stopQuery() {
  return (dispatch, getState) => {
    Log.info('停止查询');
    dispatch({
      type: ORDER_STATUS,
      data: 'stop',
    });
  };
}

export function submitOrder(randCode) {
  return (dispatch, getState) => {
    dispatch({
      type: ORDER_UPDATE_ATTR,
      data: {
        randCode,
      },
    });
    return confirmSingleForQueue(dispatch, getState);
  };
}
