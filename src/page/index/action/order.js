
import api from '../api';

export const ORDER_STATUS = 'ORDER_STATUS';

export const ORDER_UPDATE_ATTR = 'ORDER_UPDATE_ATTR';

function getPassengerInfo(seat, passengerList) {
  const passengerTicketArray = [];
  const oldPassengerArray = [];
  passengerList.forEach(item => {
    const {
      type,
      passenger_name: name,
      passenger_id_no: id,
    } = item;
    // passengerTicketStr:3,0,1,袁飞翔,1,36220219910701281X,18576697703,N
    // oldPassengerStr:袁飞翔,1,36220219910701281X,1_
    passengerTicketArray.push([ seat.seatType, 0, type, name, 1, id, '', 'N' ].join(','));
    oldPassengerArray.push([ name, 1, id, type ].join(','));
  });
  return {
    passengerTicketStr: passengerTicketArray.join('_'),
    oldPassengerStr: oldPassengerArray.join('_') + '_',
  };
}

async function prepareSubmit(dispatch, getState) {
  const { input, order } = getState();
  const { train, seat, tourFlag } = order;

  await api.submitOrderRequest({
    train,
    tourFlag,
    isStu: false,
  });

  const { submitToken, keyChange } = await api.initDc();

  const { passengerTicketStr, oldPassengerStr } = getPassengerInfo(seat, input.passengerList);

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
    console.log('请立刻输入 验证码2 ，验证码输入正确后将自动提交订单');
    dispatch({
      type: ORDER_STATUS,
      data: 'read-checkcode',
    });
  } else {
    await confirmSingleForQueue(dispatch, getState);
  }
}

async function confirmSingleForQueue(dispatch, getState) {
  const { order } = getState();
  const { train, submitToken, keyChange, passengerTicketStr, oldPassengerStr, randCode } = order;

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
}

async function query(dispatch, getState) {
  const { input, order } = getState();

  if (['stop', 'success', 'fail'].indexOf(order.status) !== -1) {
    return true;
  }

  const queryUrl = await api.getQueryUrl();

  if (!input.from || !input.to || !input.date) {
    console.log('请选择发站、到站、日期');
    return false;
  }

  const allTrain = await api.query({
    queryUrl,
    from: input.from.code,
    to: input.to.code,
    date: input.date.format('YYYY-MM-DD'),
  });

  let okTrain;
  allTrain.forEach(item => {
    let hasLogTrain = false;
    return input.trainList.forEach(({ train, seat }) => {
      if (item.name === train.name) {
        if (!hasLogTrain) {
          console.log(item);
          hasLogTrain = true;
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
          console.log(err);
          stop = true;
          dispatch({
            type: ORDER_STATUS,
            data: 'fail',
          });
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
