
export const INPUT_UPDATE = 'INPUT_UPDATE';

export const seatMap = [
  { name: '硬卧', key: 'yw', seatType: '3' },
  { name: '硬座', key: 'yz', seatType: '1' },
  { name: '无座', key: 'wz', seatType: '1' },
  { name: '软卧', key: 'rw', seatType: '4' },
  { name: '商务座', key: 'zs', seatType: '9' },
  { name: '一等座', key: 'zy', seatType: 'M' },
  { name: '二等座', key: 'ze', seatType: 'O' },
].reduce((o, item) => Object.assign(o, { [item.key]: item }), {});

export const passengerTypeMap = [
  { name: '成人票', key: '1' },
  { name: '学生票', key: '3' },
  { name: '儿童票', key: '2' },
].reduce((o, item) => Object.assign(o, { [item.key]: item }), {});

export function getUpdater(dispatch) {
  return field => data => dispatch({
    type: INPUT_UPDATE,
    field: field,
    value: data.target
      ? (data.target.type === 'checkbox' ? data.target.checked : data.target.value)
      : data,
  });
}
